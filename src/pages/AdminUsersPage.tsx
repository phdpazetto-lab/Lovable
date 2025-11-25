import { Shield, UserPlus } from 'lucide-react';

const users = [
  { id: 1, name: 'João Silva', email: 'joao@empresa.com', role: 'admin', status: 'active' },
  { id: 2, name: 'Maria Souza', email: 'maria@empresa.com', role: 'user', status: 'active' },
];

export function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-secondary">Usuários</h1>
          <p className="text-sm text-gray-500">Gerencie contas, permissões e status.</p>
        </div>
        <button className="button button-primary">
          <UserPlus size={16} className="mr-2" /> Novo Usuário
        </button>
      </header>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Nome</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Perfil</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Permissões</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3 uppercase">{user.role}</td>
                <td className="px-4 py-3">{user.status}</td>
                <td className="px-4 py-3 text-center">
                  <button className="button bg-white text-gray-700 hover:bg-gray-100">
                    <Shield size={16} className="mr-2" /> Gerenciar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
