import { Strapi } from '@strapi/strapi';
import { plugin } from '../../utils'
import { getSoftDeletedByAuth } from '../utils';

declare type SoftDeletedBy = {
  id?: number;
  type: string;
  name?: string;
};

const getSoftDeletedByEntry = async (entry: any) => {
  const _softDeletedBy: SoftDeletedBy = {
    id: entry._softDeletedById,
    type: entry._softDeletedByType,
  };
  if (entry._softDeletedById && entry._softDeletedByType) {
    try {
      switch (entry._softDeletedByType) {
        case 'admin':
          const adminUser = await strapi.entityService.findOne('admin::user', entry._softDeletedById);
          _softDeletedBy.name = adminUser.username || (adminUser.firstname || adminUser.lastname ? adminUser.firstname + ' ' + adminUser.lastname : false) || adminUser.email;
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
          _softDeletedBy.name = user.username || user.email;
          break;
      }
    } catch (error) {}
  }
  return _softDeletedBy;
};

export default ({ strapi }: { strapi: Strapi }) => ({
  pluginStore: strapi.store({
    environment: strapi.config.environment,
    type: 'plugin',
    name: plugin.pluginId,
  }),

  async findOne(ctx) {
    const entry = await strapi.query(ctx.params.uid).findOne({
      select: '*',
      where: {
        id: ctx.params.id,
        _softDeletedAt: {
          $ne: null,
        },
      },
    });

    return {
      ...entry,
      _softDeletedById: undefined,
      _softDeletedByType: undefined,
      _softDeletedBy: await getSoftDeletedByEntry(entry),
    };
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
        _softDeletedById: undefined,
        _softDeletedByType: undefined,
        _softDeletedBy: await getSoftDeletedByEntry(entry),
      };
    }));
  },

  delete(ctx) {
    return strapi.query(ctx.params.uid).delete({
      where: {
        id: ctx.params.id,
      },
    });
  },

  async restore(ctx) {
    const pluginSettings = await this.pluginStore.get({ key: 'settings' });

    let publishedAt: undefined | null = undefined;
    if (strapi.contentTypes[ctx.params.uid].options?.draftAndPublish && pluginSettings.draftPublishRestorationBehavior === 'draft') {
      publishedAt = null;
    }

    const entry = await strapi.query(ctx.params.uid).update({
      where: {
        id: ctx.params.id,
      },
      data: {
        _softDeletedAt: null,
        _softDeletedById: null,
        _softDeletedByType: null,
        publishedAt,
      },
    });

    if (ctx.params.kind === 'singleType') {
      switch (pluginSettings.singleTypesRestorationBehavior) {
        case 'soft-delete':
          const {id: authId, strategy: authStrategy} = getSoftDeletedByAuth(ctx.state.auth);
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

    return entry;
  },

  async deleteMany(ctx) {
    return await strapi.query(ctx.params.uid).deleteMany({
      where: {
        id: ctx.request.body.data.ids,
      },
    });
  },

  async restoreMany(ctx) {
    const pluginSettings = await this.pluginStore.get({ key: 'settings' });

    let publishedAt: undefined | null = undefined;
    if (strapi.contentTypes[ctx.params.uid].options?.draftAndPublish && pluginSettings.draftPublishRestorationBehavior === 'draft') {
      publishedAt = null;
    }

    const entries = await strapi.query(ctx.params.uid).updateMany({
      where: {
        id: ctx.request.body.data.ids,
      },
      data: {
        _softDeletedAt: null,
        _softDeletedById: null,
        _softDeletedByType: null,
        publishedAt,
      },
    });

    if (ctx.params.kind === 'singleType') {
      const {id: authId, strategy: authStrategy} = getSoftDeletedByAuth(ctx.state.auth);
      switch (pluginSettings.singleTypesRestorationBehavior) {
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

    return entries;
  },

  async getSettings() {
    return await this.pluginStore.get({ key: 'settings' });
  },

  async setSettings(settings) {
    await this.pluginStore.set({ key: 'settings', value: settings });
    return await this.pluginStore.get({ key: 'settings' });
  },
});
