export type ContentManagerInitResponse = {
  data: {
    data: {
      contentTypes: ContentType[],
    },
  },
};

export type ContentManagerConfigurationResponse = {
  data: {
    data: {
      contentType: {
        settings: {
          mainField: string
        }
      }
    }
  }
};

export type ContentType = {
  uid: string,
  kind: 'collectionType' | 'singleType',
  isDisplayed: boolean,
  info: {
    displayName: string,
  },
};

export type ContentTypeNavLink = {
  uid: string,
  kind: 'collectionType' | 'singleType',
  label: string,
  to: string,
};

export type ContentTypeEntry = {
  id: number,
  _softDeletedAt: string,
  _softDeletedBy: {
    type: string,
    id?: number,
    name?: string,
  },
  [mainField: string]: unknown,
};

export type Permission = {
  action: string,
  subject: string | null,
  properties: {
    fields: string[],
  }
};
