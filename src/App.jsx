import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import BillingReports from "./pages/BillingReports";
import EnterpriseDetails from "./pages/EnterpriseDetails";
import EnterpriseAccounts from "./pages/EnterpriseAccounts";
import Invoices from "./pages/Invoices";
import OverviewDashboard from "./pages/OverviewDashboard";
import PreBillReview from "./pages/PreBillReview";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<OverviewDashboard />} />
        <Route path="/enterprises" element={<EnterpriseAccounts />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/enterprise/:id" element={<EnterpriseDetails />} />
        <Route path="/pre-bill-review" element={<PreBillReview />} />
        <Route path="/reports" element={<BillingReports />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
