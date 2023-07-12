export default [
  {
    method: 'GET',
    path: '/settings',
    handler: 'controller.getSettings',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
  {
    method: 'PUT',
    path: '/settings',
    handler: 'controller.setSettings',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
];
