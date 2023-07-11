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
    path: '/:kind/:uid/:id/delete',
    handler: 'controller.delete',
    config: {
      policies: ['canDeletePermanently'],
    },
  },
  {
    method: 'PUT',
    path: '/:kind/:uid/:id/restore',
    handler: 'controller.restore',
    config: {
      policies: ['canRestore'],
    },
  },
  {
    method: 'PUT',
    path: '/:kind/:uid/delete',
    handler: 'controller.deleteMany',
    config: {
      policies: ['canDeletePermanently'],
    },
  },
  {
    method: 'PUT',
    path: '/:kind/:uid/restore',
    handler: 'controller.restoreMany',
    config: {
      policies: ['canRestore'],
    },
  },
];
