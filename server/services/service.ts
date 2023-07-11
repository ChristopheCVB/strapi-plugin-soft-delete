import { Strapi } from '@strapi/strapi';

declare type SoftDeletedBy = {
  id?: number;
  type: string;
  name?: string;
}

export default ({ strapi }: { strapi: Strapi }) => ({
  getSoftDeletedBy: async (entry: any) => {
    const softDeletedBy: SoftDeletedBy = {
      id: entry.softDeletedById,
      type: entry.softDeletedByType,
    }
    if (entry.softDeletedById && entry.softDeletedByType) {
      try {
        switch (entry.softDeletedByType) {
          case 'admin':
            const adminUser = await strapi.entityService.findOne('admin::user', entry.softDeletedById)
            softDeletedBy.name = adminUser.username;
            break;

          case 'api-token':
            const apiToken = await strapi.entityService.findOne('admin::api-token', entry.softDeletedById);
            softDeletedBy.name = apiToken.name;
            break;

          case 'transfer-token':
            const transferToken = await strapi.entityService.findOne('admin::transfer-token', entry.softDeletedById);
            softDeletedBy.name = transferToken.name;
            break;

          case 'users-premissions':
            const user = await strapi.entityService.findOne('plugin::users-permissions.user', entry.softDeletedById);
            softDeletedBy.name = user.username || user.email || user.id;
            break;
        }
      } catch (error) {}
    }
    return softDeletedBy;
  },

  async findOne(ctx) {
    const entity = await strapi.query(ctx.params.uid).findOne({
      select: '*',
      where: {
        id: ctx.params.id,
        softDeletedAt: {
          $ne: null,
        },
      },
    });

    return {
      ...entity,
      softDeletedBy: await this.getSoftDeletedBy(entity),
    }
  },

  async findMany(ctx) {
    return await Promise.all((await strapi.query(ctx.params.uid).findMany({
      select: '*',
      where: {
        softDeletedAt: {
          $ne: null,
        },
      },
      orderBy: {
        softDeletedAt: 'desc',
      },
    })).map(async (entry) => {
      return {
        ...entry,
        softDeletedBy: await this.getSoftDeletedBy(entry),
      }
    }));
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
    // FIXME: Handle ctx.params.kind === singleType
    // TODO: Handle publicationState
    return strapi.query(ctx.params.uid).update({
      select: '*',
      where: {
        id: ctx.params.id,
      },
      data: {
        softDeletedAt: null,
        softDeletedById: null,
        softDeletedByType: null,
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
    // FIXME: Handle ctx.params.kind === singleType
    // TODO: Handle publicationState
    return strapi.query(ctx.params.uid).updateMany({
      select: '*',
      where: {
        id: ctx.request.body.data.ids,
      },
      data: {
        softDeletedAt: null,
        softDeletedById: null,
        softDeletedByType: null,
      },
    });
  },
});
