import { Strapi } from '@strapi/strapi';

declare type SoftDeletedBy = {
  id?: number;
  type: string;
  name?: string;
}

export default ({ strapi }: { strapi: Strapi }) => ({
  getSoftDeletedBy: async (entry: any) => {
    const _softDeletedBy: SoftDeletedBy = {
      id: entry._softDeletedById,
      type: entry._softDeletedByType,
    }
    if (entry._softDeletedById && entry._softDeletedByType) {
      try {
        switch (entry._softDeletedByType) {
          case 'admin':
            const adminUser = await strapi.entityService.findOne('admin::user', entry._softDeletedById)
            _softDeletedBy.name = adminUser.username;
            break;

          case 'api-token':
            const apiToken = await strapi.entityService.findOne('admin::api-token', entry._softDeletedById);
            _softDeletedBy.name = apiToken.name;
            break;

          case 'transfer-token':
            const transferToken = await strapi.entityService.findOne('admin::transfer-token', entry._softDeletedById);
            _softDeletedBy.name = transferToken.name;
            break;

          case 'users-premissions':
            const user = await strapi.entityService.findOne('plugin::users-permissions.user', entry._softDeletedById);
            _softDeletedBy.name = user.username || user.email || user.id;
            break;
        }
      } catch (error) {}
    }
    return _softDeletedBy;
  },

  async findOne(ctx) {
    const entity = await strapi.query(ctx.params.uid).findOne({
      select: '*',
      where: {
        id: ctx.params.id,
        _softDeletedAt: {
          $ne: null,
        },
      },
    });

    return {
      ...entity,
      _softDeletedBy: await this.getSoftDeletedBy(entity),
    }
  },

  async findMany(ctx) {
    return await Promise.all((await strapi.query(ctx.params.uid).findMany({
      select: '*',
      where: {
        _softDeletedAt: {
          $ne: null,
        },
      },
      orderBy: {
        _softDeletedAt: 'desc',
      },
    })).map(async (entry) => {
      return {
        ...entry,
        _softDeletedBy: await this.getSoftDeletedBy(entry),
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
        _softDeletedAt: null,
        _softDeletedById: null,
        _softDeletedByType: null,
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
        _softDeletedAt: null,
        _softDeletedById: null,
        _softDeletedByType: null,
      },
    });
  },
});
