export type CustomerStatus = "LEAD" | "ACTIVE" | "INACTIVE";

export interface Customer {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  notes?: string | null;
  lastContactAt?: string | null;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerInput {
  fullName: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  status: CustomerStatus;
}

export interface UpdateCustomerInput extends CreateCustomerInput {
  id: string;
  lastContactAt?: string | null;
}

export interface CustomerFinanceMovement {
  id: string;
  type: "INCOME" | "EXPENSE";
  title: string;
  amount: number;
  date: string;
  note?: string | null;
}

export interface CustomerReminderSummary {
  id: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
}

export interface CustomerDetail {
  customer: Customer;
  incomes: CustomerFinanceMovement[];
  expenses: CustomerFinanceMovement[];
  reminders: CustomerReminderSummary[];
  totalEarnings: number;
  lastContactAt?: string | null;
}
