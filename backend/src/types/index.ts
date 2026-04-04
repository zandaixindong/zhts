import { z } from 'zod';

// Claude tool response types
export const SearchBooksSchema = z.object({
  query: z.string(),
  filters: z.object({
    category: z.string().optional(),
    status: z.string().optional(),
    format: z.string().optional(),
  }).optional(),
});

export const GetBookDetailsSchema = z.object({
  bookId: z.string(),
});

export const SubscribeAvailabilitySchema = z.object({
  bookId: z.string(),
  userId: z.string(),
});

export const FindSeatsSchema = z.object({
  floorId: z.string().optional(),
  query: z.string(),
  userId: z.string(),
});

export const ReserveSeatSchema = z.object({
  seatId: z.string(),
  duration: z.number(),
  userId: z.string(),
  startTime: z.string().optional(),
});

export const GetSeatHeatmapSchema = z.object({
  floorId: z.string(),
});

export const SearchLibraryDocsSchema = z.object({
  query: z.string(),
});

export const MatchInterestsSchema = z.object({
  userId: z.string(),
  interests: z.array(z.string()),
  events: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    interests: z.array(z.string()),
  })),
});

export type SearchBooksRequest = z.infer<typeof SearchBooksSchema>;
export type GetBookDetailsRequest = z.infer<typeof GetBookDetailsSchema>;
export type SubscribeAvailabilityRequest = z.infer<typeof SubscribeAvailabilitySchema>;
export type FindSeatsRequest = z.infer<typeof FindSeatsSchema>;
export type ReserveSeatRequest = z.infer<typeof ReserveSeatSchema>;
export type GetSeatHeatmapRequest = z.infer<typeof GetSeatHeatmapSchema>;
export type SearchLibraryDocsRequest = z.infer<typeof SearchLibraryDocsSchema>;
export type MatchInterestsRequest = z.infer<typeof MatchInterestsSchema>;

// Demo user ID for our simplified single-user setup
export const DEMO_USER_ID = 'demo-user-id';
