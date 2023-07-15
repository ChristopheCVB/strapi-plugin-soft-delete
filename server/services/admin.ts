import { Strapi } from '@strapi/strapi';
import { plugin } from '../../utils'
import { getSoftDeletedByAuth, eventHubEmit } from '../utils';

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
    const entity = strapi.query(ctx.params.uid).delete({
      where: {
        id: ctx.params.id,
      },
    });

    eventHubEmit({
      uid: ctx.params.uid,
      event: 'entry.delete',
      action: 'delete-permanently',
      entity,
    });

    return entity;
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

    eventHubEmit({
      uid: ctx.params.uid,
      event: 'entry.update',
      action: 'restore',
      entity: entry,
    });

    if (strapi.contentTypes[ctx.params.uid].options?.draftAndPublish && pluginSettings.draftPublishRestorationBehavior === 'draft') {
      if (entry.publishedAt !== null) {
        eventHubEmit({
          uid: ctx.params.uid,
          event: 'entry.unpublish',
          action: 'restore',
          entity: {...entry, publishedAt: null},
        });
      }
    }

    if (ctx.params.kind === 'singleType') {
      const notTargettedEntriesWhere = {
        id: {
          $ne: ctx.params.id,
        },
        _softDeletedAt: null,
      };
      const notTargettedEntries = await strapi.query(ctx.params.uid).findMany({
        select: '*',
        where: notTargettedEntriesWhere,
      });

      switch (pluginSettings.singleTypesRestorationBehavior) {
        case 'soft-delete':
          const {id: authId, strategy: authStrategy} = getSoftDeletedByAuth(ctx.state.auth);
          await strapi.query(ctx.params.uid).updateMany({
            where: notTargettedEntriesWhere,
            data: {
              _softDeletedAt: Date.now(),
              _softDeletedById: authId,
              _softDeletedByType: authStrategy,
            },
          });
          break;

        case 'delete-permanently':
          await strapi.query(ctx.params.uid).deleteMany({
            where: notTargettedEntriesWhere,
          });
          break;
      }

      for(const notTargettedEntry of notTargettedEntries ) {
        eventHubEmit({
          uid: ctx.params.uid,
          event: pluginSettings.singleTypesRestorationBehavior === 'soft-delete' ? 'entry.update' : 'entry.delete',
          action: pluginSettings.singleTypesRestorationBehavior,
          entity: notTargettedEntry,
        });
      }
    }

    return entry;
  },

  async deleteMany(ctx) {
    const entries = await strapi.query(ctx.params.uid).findMany({
      select: '*',
      where: {
        id: ctx.request.body.data.ids,
      },
    });

    const result = await strapi.query(ctx.params.uid).deleteMany({
      where: {
        id: ctx.request.body.data.ids,
      },
    });

    for(const entry of entries ) {
      eventHubEmit({
        uid: ctx.params.uid,
        event: 'entry.delete',
        action: 'delete-permanently',
        entity: entry,
      });
    }

    return result;
  },

  async restoreMany(ctx) {
    const entries = await strapi.query(ctx.params.uid).findMany({
      select: '*',
      where: {
        id: ctx.request.body.data.ids,
      },
    });


    const pluginSettings = await this.pluginStore.get({ key: 'settings' });

    let publishedAt: undefined | null = undefined;
    if (strapi.contentTypes[ctx.params.uid].options?.draftAndPublish && pluginSettings.draftPublishRestorationBehavior === 'draft') {
      publishedAt = null;
    }

    const result = await strapi.query(ctx.params.uid).updateMany({
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

    for(const entry of entries ) {
      eventHubEmit({
        uid: ctx.params.uid,
        event: 'entry.update',
        action: 'restore',
        entity: entry,
      });

      if (strapi.contentTypes[ctx.params.uid].options?.draftAndPublish && pluginSettings.draftPublishRestorationBehavior === 'draft') {
        if (entry.publishedAt !== null) {
          eventHubEmit({
            uid: ctx.params.uid,
            event: 'entry.unpublish',
            action: 'restore',
            entity: {...entry, publishedAt: null},
          });
        }
      }
    }

    if (ctx.params.kind === 'singleType') {
      const notTargettedEntriesWhere = {
        id: {
          $notIn: ctx.request.body.data.ids,
        },
        _softDeletedAt: null,
      };
      const notTargettedEntries = await strapi.query(ctx.params.uid).findMany({
        select: '*',
        where: notTargettedEntriesWhere,
      });

      switch (pluginSettings.singleTypesRestorationBehavior) {
        case 'soft-delete':
          const {id: authId, strategy: authStrategy} = getSoftDeletedByAuth(ctx.state.auth);
          await strapi.query(ctx.params.uid).updateMany({
            where: notTargettedEntriesWhere,
            data: {
              _softDeletedAt: Date.now(),
              _softDeletedById: authId,
              _softDeletedByType: authStrategy,
            },
          });
          break;

        case 'delete-permanently':
          await strapi.query(ctx.params.uid).deleteMany({
            where: notTargettedEntriesWhere,
          });
          break;
      }

      for(const notTargettedEntry of notTargettedEntries ) {
        eventHubEmit({
          uid: ctx.params.uid,
          event: pluginSettings.singleTypesRestorationBehavior === 'soft-delete' ? 'entry.update' : 'entry.delete',
          action: pluginSettings.singleTypesRestorationBehavior,
          entity: notTargettedEntry,
        });
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
