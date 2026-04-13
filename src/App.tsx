import { Navigate, Route, Routes } from "react-router-dom";
import Shell from "./components/layout/shell";
import { ToastProvider } from "./components/ui/toast-provider";
import { ConfirmProvider } from "./components/ui/confirm-provider";
import DashboardPage from "./app/page";
import CustomersPage from "./app/customers/page";
import CustomerDetailPage from "./app/customers/detail-page";
import FinancesPage from "./app/finances/page";
import RemindersPage from "./app/reminders/page";
import WhatsappPage from "./app/whatsapp/page";
import SettingsPage from "./app/settings/page";

export default function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <Shell>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:customerId" element={<CustomerDetailPage />} />
            <Route path="/finances" element={<FinancesPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="/whatsapp" element={<WhatsappPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Shell>
      </ConfirmProvider>
    </ToastProvider>
  );
}
