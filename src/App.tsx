import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DespesasPage } from './pages/despesas/DespesasPage';
import { DespesaForm } from './pages/despesas/DespesaForm';
import { NotasPage } from './pages/notas/NotasPage';
import { NotaForm } from './pages/notas/NotaForm';
import { MateriaisPage } from './pages/materiais/MateriaisPage';
import { MaterialForm } from './pages/materiais/MaterialForm';
import { OcorrenciasPage } from './pages/materiais/OcorrenciasPage';
import { OcorrenciaForm } from './pages/materiais/OcorrenciaForm';
import { SolicitacoesPage } from './pages/materiais/SolicitacoesPage';
import { SolicitacaoForm } from './pages/materiais/SolicitacaoForm';
import { ReportsPage } from './pages/ReportsPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminReportsPage } from './pages/AdminReportsPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/despesas" replace />} />

        <Route path="/despesas" element={<DespesasPage />} />
        <Route path="/despesas/novo" element={<DespesaForm />} />
        <Route path="/despesas/:id" element={<DespesaForm />} />

        <Route path="/notas" element={<NotasPage />} />
        <Route path="/notas/novo" element={<NotaForm />} />
        <Route path="/notas/:id" element={<NotaForm />} />

        <Route path="/materiais" element={<MateriaisPage />} />
        <Route path="/materiais/novo" element={<MaterialForm />} />
        <Route path="/materiais/:id" element={<MaterialForm />} />

        <Route path="/materiais/ocorrencias" element={<OcorrenciasPage />} />
        <Route path="/materiais/ocorrencias/novo" element={<OcorrenciaForm />} />
        <Route path="/materiais/ocorrencias/:id" element={<OcorrenciaForm />} />

        <Route path="/materiais/solicitacoes" element={<SolicitacoesPage />} />
        <Route path="/materiais/solicitacoes/novo" element={<SolicitacaoForm />} />
        <Route path="/materiais/solicitacoes/:id" element={<SolicitacaoForm />} />

        <Route path="/relatorios" element={<ReportsPage />} />
        <Route path="/admin/usuarios" element={<AdminUsersPage />} />
        <Route path="/admin/relatorios" element={<AdminReportsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
