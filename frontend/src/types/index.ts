export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  year?: number;
  category: string;
  location: string;
  status: string;
  format: string;
  electronicUrl?: string;
  description?: string;
}

export interface Seat {
  id: string;
  floorId: string;
  seatNumber: string;
  x: number;
  y: number;
  hasOutlet: boolean;
  zone: string;
  window: boolean;
  status: string;
}

export interface Floor {
  id: string;
  number: number;
  name: string;
}

export interface LibraryEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  location: string;
  interests: string[];
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Recommendation {
  bookId: string;
  title: string;
  author: string;
  reason: string;
  matchScore: number;
  summary?: string;
}

export interface AISearchResponse {
  query: string;
  books: Book[];
  message: string;
}

export interface AIRecommendationResponse {
  recommendations: Recommendation[];
  message: string;
}

export interface AISeatResponse {
  seats: Seat[];
  message: string;
  explanation?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  interests: string[];
  violationCount: number;
  createdAt: string;
}

export interface SeatReservation {
  id: string;
  seatId: string;
  seat: Seat & { floor: Floor };
  userId: string;
  startTime: string;
  endTime: string;
  status: string;
  checkedIn: boolean;
  canceled: boolean;
  createdAt: string;
}

export interface SeatReservationWithSeat extends SeatReservation {
  seat: Seat & { floor: Floor };
}

export interface BookCheckout {
  id: string;
  bookId: string;
  userId: string;
  book: Book;
  checkoutDate: string;
  dueDate: string;
  returned: boolean;
  createdAt: string;
}

export interface AtmosphereHistoryPoint {
  date: string;
  noise: number | null;
  crowding: number | null;
  brightness: number | null;
  overall: number | null;
}

