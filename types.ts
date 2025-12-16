export interface Member {
  id: string;
  name: string;
  roomNo: string;
  joinedDate: string;
}

export interface Deposit {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface Expense {
  id: string;
  shopperName: string; // Could be a member ID or just a name
  items: string;
  amount: number;
  date: string;
}

export interface MealEntry {
  breakfast: boolean; // 0.5 unit
  lunch: boolean;     // 1.0 unit
  dinner: boolean;    // 1.0 unit
}

// Map: Date (YYYY-MM-DD) -> MemberID -> MealEntry
export type MealMap = Record<string, Record<string, MealEntry>>;

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  MEALS = 'MEALS',
  FINANCES = 'FINANCES',
  MEMBERS = 'MEMBERS',
  AI_ASSISTANT = 'AI_ASSISTANT'
}

export interface Stats {
  totalDeposits: number;
  totalExpenses: number;
  cashInHand: number;
  totalMealUnits: number;
  mealRate: number;
}

export type Language = 'en' | 'bn';

export type Translation = Record<string, string>;