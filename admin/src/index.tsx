import { prefixPluginTranslations } from '@strapi/helper-plugin';
import { pluginId, name } from '../../utils/plugin';
import Initializer from './components/Initializer';
import PluginIcon from './components/PluginIcon';
import getTrad from './utils/getTrad';
import permissions from './permissions';

export default {
  register(app: any) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.name`,
        defaultMessage: name,
      },
      Component: async () => {
        const component = await import(/* webpackChunkName: "[request]" */ './pages/App');

        return component;
      },
      permissions: permissions.main,
    });

    app.createSettingSection(
      { id: pluginId, intlLabel: { id: getTrad('name'), defaultMessage: 'Soft Delete' } },
      [
        {
          intlLabel: { id: getTrad('setting.restorationBehavior'), defaultMessage: 'Restoration Behavior' },
          id: `${pluginId}.setting.restorationBehavior`,
          to: `/settings/${pluginId}/restoration-behavior`,
          Component: async () => {
            const component = await import(/* webpackChunkName: "[request]" */ './pages/Settings/RestorationBehavior');

            return component;
          },
          permissions: permissions.settings,
        },
      ],
    );

    app.registerPlugin({
      id: pluginId,
      name,
      initializer: Initializer, // FIXME: What does this do?
      isReady: false, // FIXME: What does this do?
    });
  },

  bootstrap(app: any) {},

  async registerTrads(app: any) { // registerTranslations
    const { locales } = app;

    const importedTranslations = await Promise.all(
      locales.map((locale: string) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return Promise.resolve(importedTranslations);
  },
};
