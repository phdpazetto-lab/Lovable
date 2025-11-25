import { NavLink } from 'react-router-dom';
import { ClipboardList, FileText, Layers, ShieldCheck, Users, Wallet } from 'lucide-react';
import type { UserPermission } from '../lib/permissions';

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`;

interface Props {
  permissions: UserPermission[];
  isAdmin: boolean;
}

export function Sidebar({ permissions, isAdmin }: Props) {
  const has = (moduleName: string) => permissions.some((p) => p.module_name === moduleName && p.level !== 'NONE');

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white p-4">
      <div className="mb-6 text-xl font-semibold text-secondary">Reembolsos Corp</div>
      <nav className="flex flex-1 flex-col gap-1">
        {has('DESPESAS') && (
          <NavLink to="/despesas" className={navItemClass}>
            <Wallet size={18} /> Despesas
          </NavLink>
        )}
        {has('NOTAS_FISCAIS') && (
          <NavLink to="/notas" className={navItemClass}>
            <FileText size={18} /> Notas Fiscais
          </NavLink>
        )}
        {has('MATERIAIS') && (
          <NavLink to="/materiais" className={navItemClass}>
            <Layers size={18} /> Materiais
          </NavLink>
        )}
        <NavLink to="/relatorios" className={navItemClass}>
          <ClipboardList size={18} /> Meus Relatórios
        </NavLink>
        {isAdmin && (
          <>
            <div className="mt-4 text-xs font-semibold uppercase text-gray-500">Administração</div>
            <NavLink to="/admin/usuarios" className={navItemClass}>
              <Users size={18} /> Usuários
            </NavLink>
            <NavLink to="/admin/relatorios" className={navItemClass}>
              <ShieldCheck size={18} /> Aprovação
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}
