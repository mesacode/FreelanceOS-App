export interface ReminderItem {
  id: string;
  title: string;
  description?: string | null;
  dueDate: string;
  isCompleted: boolean;
  customerId?: string | null;
  createdAt: string;
}

export interface CreateReminderInput {
  title: string;
  description?: string;
  dueDate: string;
  customerId?: string;
}

export interface UpdateReminderInput extends CreateReminderInput {
  id: string;
  isCompleted: boolean;
}
