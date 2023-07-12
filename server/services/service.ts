import { Strapi } from '@strapi/strapi';
import { pluginId } from '../../utils/plugin'
import { getSoftDeletedBy } from '../utils';

declare type SoftDeletedBy = {
  id?: number;
  type: string;
  name?: string;
}

export default ({ strapi }: { strapi: Strapi }) => ({
  pluginStore: strapi.store({
    environment: strapi.config.environment,
    type: 'plugin',
    name: pluginId,
  }),

  getSoftDeletedByEntry: async (entry: any) => {
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
      _softDeletedBy: await this.getSoftDeletedByEntry(entity),
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
        _softDeletedBy: await this.getSoftDeletedByEntry(entry),
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

  async restore(ctx) {
    const result = await strapi.query(ctx.params.uid).update({
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

    const pluginSettings = await this.pluginStore.get({ key: 'settings' });
    if (ctx.params.kind === 'singleType') {
      switch (pluginSettings.singleTypesResorationBehavior) {
        case 'soft-delete':
          const {authId, authStrategy} = getSoftDeletedBy(ctx);
          await strapi.query(ctx.params.uid).update({
            where: {
              id: {
                $ne: ctx.params.id,
              },
            },
            data: {
              _softDeletedAt: Date.now(),
              _softDeletedById: authId,
              _softDeletedByType: authStrategy,
            },
          });
          break;

        case 'delete-permanently':
          await strapi.query(ctx.params.uid).delete({
            where: {
              id: {
                $ne: ctx.params.id,
              },
            },
          });
          break;
      }
    }
    // TODO: Handle publicationState
    return result;
  },

  async deleteMany(ctx) {
    return await strapi.query(ctx.params.uid).deleteMany({
      select: '*',
      where: {
        id: ctx.request.body.data.ids,
      },
    });
  },

  async restoreMany(ctx) {
    // TODO: Handle publicationState
    const result = await strapi.query(ctx.params.uid).updateMany({
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

    const pluginSettings = await this.pluginStore.get({ key: 'settings' });
    if (ctx.params.kind === 'singleType') {
      const {authId, authStrategy} = getSoftDeletedBy(ctx);
      switch (pluginSettings.singleTypesResorationBehavior) {
        case 'soft-delete':
          await strapi.query(ctx.params.uid).updateMany({
            where: {
              id: {
                $notIn: ctx.request.body.data.ids,
              },
            },
            data: {
              _softDeletedAt: Date.now(),
              _softDeletedById: authId,
              _softDeletedByType: authStrategy,
            },
          });
          break;

        case 'delete-permanently':
          await strapi.query(ctx.params.uid).deleteMany({
            where: {
              id: {
                $notIn: ctx.request.body.data.ids,
              },
            },
          });
          break;
      }
    }

    return result;
  },

  async getSettings() {
    return await this.pluginStore.get({ key: 'settings' });
  },

  async setSettings(settings) {
    await this.pluginStore.set({ key: 'settings', value: settings });
    return await this.pluginStore.get({ key: 'settings' });
  },
});
