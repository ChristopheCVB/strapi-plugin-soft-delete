import { Strapi } from '@strapi/strapi';

export default ({ strapi }: { strapi: Strapi }) => ({
  findOne(ctx) {
    return strapi.query(ctx.params.uid).findOne({
      select: '*',
      where: {
        id: ctx.params.id,
        softDeletedAt: {
          $ne: null,
        },
      },
      populate: ['softDeletedBy']
    });
  },

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
      populate: ['softDeletedBy']
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
    // TODO: Handle ctx.params.kind === singleType
    // TODO: Handle publicationState
    return strapi.query(ctx.params.uid).update({
      select: '*',
      where: {
        id: ctx.params.id,
      },
      data: {
        softDeletedAt: null,
        softDeletedBy: null,
      },
    });
  },

  deleteMany(ctx) {
    return strapi.query(ctx.params.uid).deleteMany({
      select: '*',
      where: {
        id: ctx.request.body.data.ids,
      },
    });
  },

  restoreMany(ctx) {
    // TODO: Handle ctx.params.kind === singleType
    // TODO: Handle publicationState
    return strapi.query(ctx.params.uid).updateMany({
      select: '*',
      where: {
        id: ctx.request.body.data.ids,
      },
      data: {
        softDeletedAt: null,
        softDeletedBy: null,
      },
    });
  },

});
