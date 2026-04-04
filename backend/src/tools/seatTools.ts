import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { FindSeatsSchema, ReserveSeatSchema, GetSeatHeatmapSchema } from '../types';

const prisma = new PrismaClient();

export const seatTools = [
  {
    name: 'find_available_seats',
    description: 'Find available seats matching user preferences (quiet, near outlet, window seat, etc.)',
    input_schema: FindSeatsSchema.shape,
  },
  {
    name: 'get_seat_heatmap',
    description: 'Get all seats and current occupancy for heatmap visualization on a specific floor',
    input_schema: GetSeatHeatmapSchema.shape,
  },
  {
    name: 'reserve_seat',
    description: 'Reserve a specific seat for a given duration',
    input_schema: ReserveSeatSchema.shape,
  },
] as const;

// Parse natural language preferences into filters
function parsePreferences(query: string): any {
  const filters: any = { status: 'available' };

  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('quiet')) {
    filters.zone = 'quiet';
  }
  if (lowerQuery.includes('group') || lowerQuery.includes('study group')) {
    filters.zone = 'group';
  }
  if (lowerQuery.includes('outlet') || lowerQuery.includes('power')) {
    filters.hasOutlet = true;
  }
  if (lowerQuery.includes('window')) {
    filters.window = true;
  }

  return filters;
}

export async function handleFindAvailableSeats(input: z.infer<typeof FindSeatsSchema>) {
  const { query, floorId } = input;

  const filters = parsePreferences(query);
  if (floorId) {
    filters.floorId = floorId;
  }

  const seats = await prisma.seat.findMany({
    where: filters,
    include: { floor: true },
  });

  // If we don't have enough results, relax constraints
  if (seats.length < 3 && Object.keys(filters).length > 2) {
    // Try without one constraint
    const relaxedFilters = { ...filters };
    delete relaxedFilters.hasOutlet;
    const moreSeats = await prisma.seat.findMany({
      where: relaxedFilters,
      include: { floor: true },
    });
    seats.push(...moreSeats.slice(0, 5 - seats.length));
  }

  return {
    seats,
    count: seats.length,
  };
}

export async function handleGetSeatHeatmap(input: z.infer<typeof GetSeatHeatmapSchema>) {
  const { floorId } = input;
  const seats = await prisma.seat.findMany({
    where: { floorId },
  });
  return { seats };
}

export async function handleReserveSeat(input: z.infer<typeof ReserveSeatSchema>) {
  const { seatId, duration, userId, startTime: inputStartTime } = input;

  // Check if seat is available
  const seat = await prisma.seat.findUnique({ where: { id: seatId } });

  if (!seat) {
    return { success: false, message: '未找到该座位。' };
  }

  if (seat.status !== 'available') {
    return { success: false, message: '该座位已被占用或已被预约。' };
  }

  // Calculate times - use provided startTime or default to now
  let startTime: Date;
  if (inputStartTime) {
    startTime = new Date(inputStartTime);
    // If it's today, set to opening hours (8:00)
    const today = new Date();
    if (startTime.toDateString() === today.toDateString()) {
      startTime.setHours(8, 0, 0, 0);
    }
  } else {
    startTime = new Date();
  }

  const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

  // Create reservation
  await prisma.seatReservation.create({
    data: {
      seatId,
      userId,
      startTime,
      endTime,
      checkedIn: false,
    },
  });

  // Update seat status
  await prisma.seat.update({
    where: { id: seatId },
    data: { status: 'reserved' },
  });

  // Auto-release is handled by cleanup - for demo, we'll leave it at that
  // In production, a job would check after 15 minutes and release if not checked in

  const formattedDate = startTime.toLocaleDateString('zh-CN');
  const formattedTime = endTime.toLocaleTimeString('zh-CN');

  return {
    success: true,
    message: `座位 ${seat.seatNumber} 预约成功，${formattedDate} ${startTime.toLocaleTimeString('zh-CN')} - ${formattedTime}。请在开始前15分钟内签到，否则预约将自动释放。`,
    seat,
    startTime,
    endTime,
  };
}

export async function handleSeatToolCall(name: string, input: any) {
  switch (name) {
    case 'find_available_seats':
      return await handleFindAvailableSeats(input);
    case 'get_seat_heatmap':
      return await handleGetSeatHeatmap(input);
    case 'reserve_seat':
      return await handleReserveSeat(input);
    default:
      throw new Error(`Unknown seat tool: ${name}`);
  }
}

// Get all seats for a floor (used by frontend polling
export async function getSeatsForFloor(floorId: string) {
  return await prisma.seat.findMany({ where: { floorId } });
}

// Get all floors
export async function getAllFloors() {
  return await prisma.floor.findMany({ orderBy: { number: 'asc' } });
}

// Cancel reservation
export async function cancelReservation(seatId: string, userId: string) {
  const reservation = await prisma.seatReservation.findFirst({
    where: { seatId, userId, checkedIn: false, canceled: false },
  });

  if (!reservation) {
    return { success: false, message: '未找到该座位的有效预约。' };
  }

  await prisma.seatReservation.update({
    where: { id: reservation.id },
    data: { canceled: true },
  });

  await prisma.seat.update({
    where: { id: seatId },
    data: { status: 'available' },
  });

  return { success: true, message: '预约取消成功。' };
}
