export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  violationCount: number;
  createdAt: string;
  _count?: {
    seats: number;
    books: number;
  };
}

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

export interface Floor {
  id: string;
  number: number;
  name: string;
  width?: number;
  height?: number;
  planAnnotations?: any;
  seats?: Seat[];
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

export interface LibraryEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  location: string;
  interests: string[];
}

export interface OverviewStats {
  totalBooks: number;
  availableBooks: number;
  totalSeats: number;
  availableSeats: number;
  totalEvents: number;
  totalFloors: number;
  totalUsers: number;
  totalReservations: number;
  onlineUsers: number;
  todayReservations: number;
  overdueCheckouts: number;
}

export interface TrendData {
  date: string;
  count: number;
}

export interface SeatUsageData {
  floorId: string;
  floorName: string;
  floorNumber: number;
  total: number;
  occupied: number;
  available: number;
  usageRate: number;
}

export interface PopularBook {
  id: string;
  title: string;
  author: string;
  category: string;
  checkoutCount: number;
}

export interface TimeUsageData {
  hour: number;
  label: string;
  usageRate: number;
}

export interface CategoryData {
  category: string;
  count: number;
}

export interface AnomalyAlert {
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
}

export interface AnomalyData {
  alerts: AnomalyAlert[];
  highViolationUsers: User[];
}

export interface OpsTodoItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  metric: string;
  actionLabel: string;
  actionSection: string;
}

export interface OpsInsight {
  title: string;
  description: string;
}

export interface OpsCenterData {
  todos: OpsTodoItem[];
  insights: OpsInsight[];
  generatedAt: string;
}

export interface LibraryStrategy {
  title: string;
  summary: string;
  strategies: Array<{
    title: string;
    recommendation: string;
  }>;
  generatedAt: string;
}

export type TemplateType = 'curator' | 'operations' | 'defense';

export interface DailyBriefBase {
  title: string;
  templateType: TemplateType;
  generatedAt: string;
}

export interface CuratorDailyBrief extends DailyBriefBase {
  templateType: 'curator';
  executiveSummary: string;
  collectionStatus: {
    totalBooks: number;
    availableBooks: number;
    availableRate: number;
    topCategories: Array<{ category: string; count: number }>;
    popularBooks: Array<{ id: string; title: string; author: string; category: string; checkoutCount: number }>;
  };
  spaceStatus: {
    totalFloors: number;
    totalSeats: number;
    availableSeats: number;
    availableSeatsRate: number;
  };
  circulationIssues: string[];
  acquisitionRecommendations: string[];
  eventPlanning: {
    totalExistingEvents: number;
    upcomingEvents: number;
    suggestion: string;
  };
}

export interface OperationsDailyBrief extends DailyBriefBase {
  templateType: 'operations';
  headline: string;
  summary: string;
  overview: {
    totalBooks: number;
    availableBooks: number;
    totalSeats: number;
    availableSeats: number;
    totalUsers: number;
    onlineUsers: number;
    todayReservations: number;
    overdueCheckouts: number;
  };
  seatUsage: Array<{
    floorId: string;
    floorName: string;
    floorNumber: number;
    total: number;
    occupied: number;
    available: number;
    usageRate: number;
  }>;
  todos: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    metric: string;
    actionSection: string;
  }>;
  strategies: Array<{
    title: string;
    recommendation: string;
  }>;
  insights: Array<{
    title: string;
    description: string;
  }>;
  highlights?: string[];
  actions?: string[];
}

export interface DefenseDailyBrief extends DailyBriefBase {
  templateType: 'defense';
  projectOverview: string;
  keyMetrics: Array<{ name: string; value: string }>;
  currentStatus: {
    infrastructure: {
      floors: number;
      seats: number;
      books: number;
      events: number;
    };
    todayActivity: {
      reservations: number;
      activeUsers: number;
      overdueBooks: number;
    };
    overallOccupancy: string;
  };
  floorUsage: Array<{ floor: string; usage: string }>;
  popularBooks: Array<{ title: string; author: string; checkouts: number }>;
  upcomingEvents: Array<{ title: string; date: string }>;
  systemFeatures: string[];
  innovationPoints: string[];
  conclusion: string;
}

export type DailyBrief = CuratorDailyBrief | OperationsDailyBrief | DefenseDailyBrief;
