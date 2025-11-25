import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../hooks/useAuth';
import type { UserPermission } from '../lib/permissions';

const mockPermissions: UserPermission[] = [
  { module_name: 'DESPESAS', level: 'MANAGE' },
  { module_name: 'NOTAS_FISCAIS', level: 'WRITE' },
  { module_name: 'MATERIAIS', level: 'WRITE' },
];

export function Layout() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const isAdmin = user?.user_metadata?.role === 'admin' || false;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar permissions={mockPermissions} isAdmin={isAdmin} />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
