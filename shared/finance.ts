export interface IncomeItem {
  id: string;
  title: string;
  amount: number;
  date: string;
  note?: string | null;
  projectId?: string | null;
  customerId?: string | null;
  createdAt: string;
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category?: string | null;
  date: string;
  note?: string | null;
  customerId?: string | null;
  createdAt: string;
}

export interface CreateIncomeInput {
  title: string;
  amount: number;
  date: string;
  note?: string;
  customerId?: string;
}

export interface UpdateIncomeInput extends CreateIncomeInput {
  id: string;
}

export interface CreateExpenseInput {
  title: string;
  amount: number;
  category?: string;
  date: string;
  note?: string;
  customerId?: string;
}

export interface UpdateExpenseInput extends CreateExpenseInput {
  id: string;
}
