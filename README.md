<div align="center">
  <h1>Strapi v4 - Soft Delete plugin</h1>
</div>

---

<div style="margin: 20px 0" align="center">
  <img style="width: 100%; height: auto;" src="public/assets/preview.png" alt="UI preview" />
</div>

A plugin for [Strapi Headless CMS](https://github.com/strapi/strapi) that provides a Soft Delete feature.

## ✨ Features

- 🛢 Database
  - Adds `deletedAt` and `deletedBy` fields to all your collection and single content types.
- 🗂️ Content Manager & API
  - The normal delete functionality behaves as the soft delete. It will set the `deletedAt` field to the current date and `deletedBy` field to the admin user that deleted it.
  - 👤 RBAC
    - The name of the existing admin permission reflects the soft delete functionality. The `Delete` is renamed to `Soft Delete` and it is located in the `Settings > Roles > Edit a Role > Collection Types | Single Types` section.
    - A new admin permission is added to the `Settings > Roles > Edit a Role > Collection Types | Single Types` section. This is the `Deleted Read` permission. This will allow the admin user to view the soft deleted entries.
    - A new admin permission is added to the `Settings > Roles > Edit a Role > Collection Types | Single Types` section. This is the `Deleted Restore` permission. This will allow the admin user to restore the soft deleted entries.
    - A new admin permission is added to the `Settings > Roles > Edit a Role > Collection Types | Single Types` section. This is the `Delete Permanently` permission. This will allow the admin user to delete permanently the soft deleted entries.
- 🗂️ Adds a `Soft Delete` item in the Admin left Panel to access the Soft Deleted content explorer. This will list all the content types. You can restore or delete permanently the entries from here.
  - Adds a `Restore` action through the Soft Delete in the Admin Panel to the content types. This will set the `deletedAt` field to `null` and `deletedBy` field to `null`, thus restoring it.
  - Adds a `Delete Permanently` action through the Soft Delete in the Admin Panel to the content types. This will delete the entry permanently.

<!-- - You can still access the content type by using the `includeSoftDeleted` query parameter. This will return all the content types including the soft deleted ones. -->

## 📦 Compatibility

| Strapi Version | Plugin Version |
| -------------- | -------------- |
| v4             | 1.0.0          |
| v3             | Not Supported  |

> This plugin is designed for **Strapi v4** and will not work with v3.x.

## ⏳ Installation

To install this plugin, you need to add an NPM dependency to your Strapi application:

```sh
# Using Yarn
yarn add strapi-plugin-soft-delete

# Or using PNPM
pnpm add strapi-plugin-soft-delete

# Or using NPM
npm install strapi-plugin-soft-delete
```

Then, you'll need to build your admin panel:

```sh
# Using Yarn
yarn build

# Or using PNPM
pnpm run build

# Or using NPM
npm run build
```

Edit your `config/plugins.js|ts` or `config/<env>/plugins.js|ts` file and add the following configuration:

```js
// ...
  "soft-delete": {
    enabled: true,
  },
// ...
```

Finally, start your application:

```sh
# Using Yarn
yarn develop

# Or using PNPM
pnpm run develop

# Or using NPM
npm run develop
```

## 🤝 Contributing

Feel free to fork and make a PR if you want to add something or fix a bug.

## 👨‍💻 Community support

For general help using Strapi, please refer to [the official Strapi documentation](https://docs.strapi.io/). For additional help, you can use one of these channels to ask a question:

- [Discord](https://discord.strapi.io/) I'm present on official Strapi Discord workspace. Find me by `ChristopheCVB`.
- [GitHub](https://github.com/ChristopheCVB/strapi-plugin-soft-delete/issues) (Bug reports, Contributions, Questions and Discussions)

## 📝 License

[MIT License](LICENSE.md) Copyright (c) [ChristopheCVB](https://www.christophecvb.com/).
