export interface Deposit {
  id: string;
  amount: number;
  date: string;
  notes?: string;
  memberId?: string;
}

export interface Expense {
  id: string;
  shopperName?: string; // Optional now, defaults to 'Me'
  items: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface MealEntry {
  breakfast: boolean; // 1.0 unit
  lunch: boolean;     // 1.0 unit
  dinner: boolean;    // 1.0 unit
}

// Map: Date (YYYY-MM-DD) -> MealEntry (Single user, so no nested MemberID)
export type MealMap = Record<string, MealEntry>;

export enum ViewState {
  MEALS = 'MEALS',
  FINANCES = 'FINANCES'
}

export type Language = 'en' | 'bn';

export type Translation = Record<string, string>;

export interface Member {
  id: string;
  name: string;
  roomNo: string;
  joinedDate: string;
}

export interface Stats {
  cashInHand: number;
  totalDeposits: number;
  totalExpenses: number;
  mealRate: number;
  totalMealUnits: number;
}