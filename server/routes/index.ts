export default [
  {
    method: 'GET',
    path: '/:kind/:uid',
    handler: 'controller.findMany',
    config: {
      policies: ['canRead'],
    },
  },
  {
    method: 'GET',
    path: '/:kind/:uid/:id',
    handler: 'controller.findOne',
    config: {
      policies: ['canRead'],
    },
  },
  {
    method: 'DELETE',
    path: '/delete/:kind/:uid/:id',
    handler: 'controller.delete',
    config: {
      policies: ['canDelete'],
    },
  },
  {
    method: 'PUT',
    path: '/restore/:kind/:uid/:id',
    handler: 'controller.restore',
    config: {
      policies: ['canRestore'],
    },
  },
  {
    method: 'PUT',
    path: '/delete/:kind/:uid',
    handler: 'controller.deleteMany',
    config: {
      policies: ['canDelete'],
    },
  },
  {
    method: 'PUT',
    path: '/restore/:kind/:uid',
    handler: 'controller.restoreMany',
    config: {
      policies: ['canRestore'],
    },
  },
];
