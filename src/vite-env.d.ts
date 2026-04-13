/// <reference types="vite/client" />
<<<<<<< ours
<<<<<<< ours

import type {
  CreateCustomerInput,
  Customer,
  CustomerDetail,
  UpdateCustomerInput
} from "../shared/customer";
import type {
  CreateExpenseInput,
  CreateIncomeInput,
  ExpenseItem,
  IncomeItem,
  UpdateExpenseInput,
  UpdateIncomeInput
} from "../shared/finance";
import type {
  CreateReminderInput,
  ReminderItem,
  UpdateReminderInput
} from "../shared/reminder";
import type {
  CreateWhatsappTemplateInput,
  UpdateWhatsappTemplateInput,
  WhatsappTemplateItem
} from "../shared/whatsapp";
import type { SettingItem, UpsertSettingInput } from "../shared/settings";
import type { ActivityItem, DashboardSummary } from "../shared/dashboard";

interface Window {
  desktopAPI: {
    appName: string;
    version: string;
    customers: {
      list: () => Promise<Customer[]>;
      get: (id: string) => Promise<CustomerDetail>;
      create: (payload: CreateCustomerInput) => Promise<Customer>;
      update: (payload: UpdateCustomerInput) => Promise<Customer>;
      delete: (id: string) => Promise<{ success: true }>;
    };
    finances: {
      incomes: {
        list: () => Promise<IncomeItem[]>;
        create: (payload: CreateIncomeInput) => Promise<IncomeItem>;
        update: (payload: UpdateIncomeInput) => Promise<IncomeItem>;
        delete: (id: string) => Promise<{ success: true }>;
      };
      expenses: {
        list: () => Promise<ExpenseItem[]>;
        create: (payload: CreateExpenseInput) => Promise<ExpenseItem>;
        update: (payload: UpdateExpenseInput) => Promise<ExpenseItem>;
        delete: (id: string) => Promise<{ success: true }>;
      };
    };
    reminders: {
      list: () => Promise<ReminderItem[]>;
      create: (payload: CreateReminderInput) => Promise<ReminderItem>;
      update: (payload: UpdateReminderInput) => Promise<ReminderItem>;
      toggle: (id: string) => Promise<ReminderItem>;
      delete: (id: string) => Promise<{ success: true }>;
    };
    whatsapp: {
      list: () => Promise<WhatsappTemplateItem[]>;
      create: (payload: CreateWhatsappTemplateInput) => Promise<WhatsappTemplateItem>;
      update: (payload: UpdateWhatsappTemplateInput) => Promise<WhatsappTemplateItem>;
      delete: (id: string) => Promise<{ success: true }>;
    };
    settings: {
      list: () => Promise<SettingItem[]>;
      upsert: (payload: UpsertSettingInput) => Promise<SettingItem>;
      delete: (key: string) => Promise<{ success: true }>;
    };
    dashboard: {
      summary: () => Promise<DashboardSummary>;
      activities: () => Promise<ActivityItem[]>;
    };
  };
}
=======
>>>>>>> theirs
=======
>>>>>>> theirs
