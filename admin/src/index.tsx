import { prefixPluginTranslations } from '@strapi/helper-plugin';
import { plugin } from '../../utils';
import PluginIcon from './components/PluginIcon';
import getTrad from './utils/getTrad';
import permissions from './permissions';

export default {
  register(app: any) {
    app.addMenuLink({
      to: `/plugins/${plugin.pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${plugin.pluginId}.name`,
        defaultMessage: plugin.name,
      },
      Component: async () => {
        const component = await import(/* webpackChunkName: "[request]" */ './pages/App');

        return component;
      },
      permissions: permissions.main,
    });

    app.createSettingSection(
      { id: plugin.pluginId, intlLabel: { id: getTrad('name'), defaultMessage: 'Soft Delete' } },
      [
        {
          intlLabel: { id: getTrad('setting.restorationBehavior'), defaultMessage: 'Restoration Behavior' },
          id: `${plugin.pluginId}.setting.restorationBehavior`,
          to: `/settings/${plugin.pluginId}/restoration-behavior`,
          Component: async () => {
            const component = await import(/* webpackChunkName: "[request]" */ './pages/Settings/RestorationBehavior');

            return component;
          },
          permissions: permissions.settings,
        },
      ],
    );

    app.registerPlugin({
      id: plugin.pluginId,
      name: plugin.name,
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
              data: prefixPluginTranslations(data, plugin.pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      }),
    );

    return Promise.resolve(importedTranslations);
  },
};
