export const adminSections = [
  { id: 'dashboard', path: '/dashboard', label: '数据概览' },
  { id: 'books', path: '/books', label: '书籍管理' },
  { id: 'seats', path: '/seats', label: '楼层座位' },
  { id: 'events', path: '/events', label: '活动管理' },
  { id: 'users', path: '/users', label: '用户管理' },
] as const;

export type AdminSectionId = typeof adminSections[number]['id'];

export const getAdminPathBySection = (section: string) => {
  return adminSections.find(item => item.id === section)?.path || '/dashboard';
};

export const getAdminSectionByPath = (path: string): AdminSectionId | null => {
  return adminSections.find(item => item.path === path)?.id || null;
};
