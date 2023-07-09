export default [
  {
    method: 'GET',
    path: '/:kind/:uid',
    handler: 'controller.findMany',
    config: {
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/:kind/:uid/:id',
    handler: 'controller.findOne',
    config: {
      policies: [],
    },
  },
  {
    method: 'DELETE',
    path: '/delete/:kind/:uid/:id',
    handler: 'controller.delete',
    config: {
      policies: [],
    },
  },
  {
    method: 'PUT',
    path: '/restore/:kind/:uid/:id',
    handler: 'controller.restore',
    config: {
      policies: [],
    },
  },
  {
    method: 'PUT',
    path: '/delete/:kind/:uid',
    handler: 'controller.deleteMany',
    config: {
      policies: [],
    },
  },
  {
    method: 'PUT',
    path: '/restore/:kind/:uid',
    handler: 'controller.restoreMany',
    config: {
      policies: [],
    },
  },
];
