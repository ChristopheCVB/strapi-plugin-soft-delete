export default [
  {
    method: 'GET',
    path: '/:kind/:uid',
    handler: 'controller.findMany',
    config: {
      policies: [],
    },
  },
];
