export default [
  {
    method: 'GET',
    path: '/settings',
    handler: 'admin.getSettings',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
  {
    method: 'PUT',
    path: '/settings',
    handler: 'admin.setSettings',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
];
