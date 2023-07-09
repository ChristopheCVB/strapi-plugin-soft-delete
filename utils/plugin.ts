import pluginPkg from '../package.json';

const name = pluginPkg.strapi.name;
const pluginId = pluginPkg.name.replace(/^(@[^-,.][\w,-]+\/|strapi-)plugin-/i, '');

export { pluginId, name };
