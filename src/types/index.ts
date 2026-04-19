export interface User {
  id: string;
  email: string;
}

export interface Expense {
  id: string;
  userId: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  mode: string;
  month: string;
  year: number;
  tag: string;
  recurring: boolean;
  notes: string;
}

export interface Budget {
  id?: string;
  userId: string;
  month: string;
  year: number;
  income: number;
  savingsTarget: number;
}
