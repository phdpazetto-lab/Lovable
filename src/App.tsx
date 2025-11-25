import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { MaterialsPage } from './pages/MaterialsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminReportsPage } from './pages/AdminReportsPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/despesas" replace />} />
        <Route path="/despesas" element={<ExpensesPage />} />
        <Route path="/notas" element={<InvoicesPage />} />
        <Route path="/materiais" element={<MaterialsPage />} />
        <Route path="/relatorios" element={<ReportsPage />} />
        <Route path="/admin/usuarios" element={<AdminUsersPage />} />
        <Route path="/admin/relatorios" element={<AdminReportsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
