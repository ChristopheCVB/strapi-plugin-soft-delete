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
    method: 'DELETE',
    path: '/:kind/:uid/:id',
    handler: 'controller.delete',
    config: {
      policies: [],
    },
  },
  {
    method: 'PUT',
    path: '/:kind/:uid/:id',
    handler: 'controller.restore',
    config: {
      policies: [],
    },
  },
];
