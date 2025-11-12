export type Role = 'admin' | 'finance' | 'juridico' | 'hub' | 'viewer' | 'coordenador';

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Administrador',
  finance: 'Financeiro',
  juridico: 'Jurídico',
  hub: 'Gestor de Hub',
  viewer: 'Visualizador',
  coordenador: 'Coordenador de HUB'
};

type Permission =
  | 'view_finance'
  | 'approve_reimbursements'
  | 'review_reimbursements'
  | 'approve_local_reimbursements'
  | 'view_assets'
  | 'transfer_assets'
  | 'create_reimbursement'
  | 'view_dashboards';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    'view_finance',
    'approve_reimbursements',
    'review_reimbursements',
    'approve_local_reimbursements',
    'view_assets',
    'transfer_assets',
    'create_reimbursement',
    'view_dashboards'
  ],
  finance: ['view_finance', 'approve_reimbursements', 'view_assets', 'view_dashboards'],
  juridico: ['review_reimbursements', 'view_assets', 'view_dashboards'],
  coordenador: ['approve_local_reimbursements', 'view_assets', 'transfer_assets', 'view_dashboards'],
  hub: ['create_reimbursement', 'view_assets', 'view_dashboards'],
  viewer: ['view_dashboards']
};

export function roleHas(role: Role, permission: Permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canManageFinance(role: Role) {
  return roleHas(role, 'view_finance');
}

export function canReadAllHubs(role: Role) {
  return role === 'admin';
}

export function canAccessHub(role: Role) {
  return role !== 'viewer' ? 'write' : 'read';
}

export function canApproveLocalReimbursements(role: Role) {
  return roleHas(role, 'approve_local_reimbursements');
}

export function canApproveFinanceReimbursements(role: Role) {
  return roleHas(role, 'approve_reimbursements');
}

export function canReviewReimbursements(role: Role) {
  return roleHas(role, 'review_reimbursements');
}

export function canTransferAssets(role: Role) {
  return roleHas(role, 'transfer_assets');
}
