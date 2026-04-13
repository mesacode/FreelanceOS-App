export interface DashboardSummary {
  monthlyIncome: number;
  monthlyExpense: number;
  netBalance: number;
  activeCustomerCount: number;
  pendingReminderCount: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  entityType:
    | "CUSTOMER"
    | "INCOME"
    | "EXPENSE"
    | "REMINDER"
    | "WHATSAPP_TEMPLATE"
    | "SETTING";
}
