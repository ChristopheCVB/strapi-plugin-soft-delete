import pluginPkg from '../package.json';

export const name = pluginPkg.strapi.name;
export const pluginId = pluginPkg.name.replace(/^(@[^-,.][\w,-]+\/|strapi-)plugin-/i, '');
