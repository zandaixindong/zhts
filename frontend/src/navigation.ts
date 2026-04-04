export const frontendTabs = [
  { id: 'scan', path: '/scan', label: '扫码找书' },
  { id: 'search', path: '/search', label: '找书' },
  { id: 'for-you', path: '/for-you', label: '为你推荐' },
  { id: 'seats', path: '/seats', label: '座位预约' },
  { id: 'my-activity', path: '/my-activity', label: '我的活动' },
  { id: 'bookmarks', path: '/bookmarks', label: '收藏夹' },
  { id: 'chat', path: '/chat', label: 'AI 助手' },
  { id: 'notifications', path: '/notifications', label: '通知中心' },
] as const;

export type FrontendTabId = typeof frontendTabs[number]['id'];

export const getPathByTab = (tab: string) => {
  return frontendTabs.find(item => item.id === tab)?.path || '/search';
};

export const getTabByPath = (path: string): FrontendTabId | null => {
  return frontendTabs.find(item => item.path === path)?.id || null;
};
