export type ModuleName = 'DESPESAS' | 'NOTAS_FISCAIS' | 'MATERIAIS';
export type PermissionLevel = 'NONE' | 'READ' | 'WRITE' | 'MANAGE';

export type UserPermission = {
  module_name: ModuleName;
  level: PermissionLevel;
};

export function canWrite(level: PermissionLevel) {
  return level === 'WRITE' || level === 'MANAGE';
}

export function canManage(level: PermissionLevel) {
  return level === 'MANAGE';
}
