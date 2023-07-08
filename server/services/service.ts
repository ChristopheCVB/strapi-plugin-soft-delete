import { Strapi } from '@strapi/strapi';

export default ({ strapi }: { strapi: Strapi }) => ({
  findMany(ctx) {
    return strapi.query(ctx.params.uid).findMany({
      select: '*',
      where: {
        softDeletedAt: {
          $ne: null,
        },
      },
      orderBy: {
        softDeletedAt: 'desc',
      },
    });
  },

  delete(ctx) {
    return strapi.query(ctx.params.uid).delete({
      select: '*',
      where: {
        id: ctx.params.id,
      },
    });
  },

  restore(ctx) {
    return strapi.query(ctx.params.uid).update({
      select: '*',
      where: {
        id: ctx.params.id,
      },
      data: {
        softDeletedAt: null,
        // softDeletedBy: null, // FIXME: IDK how this works
      },
    });
  },

  // TODO: findOne, deleteMany, restoreMany
});
