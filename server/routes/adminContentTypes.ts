export default [
  {
    method: 'GET',
    path: '/:kind/:uid',
    handler: 'admin.findMany',
    config: {
      policies: ['adminCanRead'],
    },
  },
  {
    method: 'GET',
    path: '/:kind/:uid/:id',
    handler: 'admin.findOne',
    config: {
      policies: ['adminCanRead'],
    },
  },
  {
    method: 'DELETE',
    path: '/:kind/:uid/:id/delete',
    handler: 'admin.delete',
    config: {
      policies: ['adminCanDeletePermanently'],
    },
  },
  {
    method: 'PUT',
    path: '/:kind/:uid/:id/restore',
    handler: 'admin.restore',
    config: {
      policies: ['adminCanRestore'],
    },
  },
  {
    method: 'PUT',
    path: '/:kind/:uid/delete',
    handler: 'admin.deleteMany',
    config: {
      policies: ['adminCanDeletePermanently'],
    },
  },
  {
    method: 'PUT',
    path: '/:kind/:uid/restore',
    handler: 'admin.restoreMany',
    config: {
      policies: ['adminCanRestore'],
    },
  },
];
