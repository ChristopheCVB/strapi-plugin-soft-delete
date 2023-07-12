/**
 *
 * RestorationBehavior
 *
 */

import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Box,
  Layout,
  BaseHeaderLayout,
  ContentLayout,
  Button,
  Flex,
  SingleSelect,
  SingleSelectOption,
} from '@strapi/design-system';
import { Check } from '@strapi/icons';

import { pluginId } from '../../../../../utils/plugin';
import getTrad from '../../../utils/getTrad';

import { useFetchClient } from '@strapi/helper-plugin';
import type { Settings } from './types'

const RestorationBehavior: React.FunctionComponent = () => {
  const { formatMessage } = useIntl();
  const { get, put } = useFetchClient();

  const [initialSettings, setInitialSettings] = useState<Settings | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const singleTypesOptions = [
    {
      label: formatMessage({id: getTrad('setting.restorationBehavior.softDeleteExisting'), defaultMessage: 'Soft Delete existing'}),
      value: 'soft-delete',
    },
    {
      label: formatMessage({id: getTrad('setting.restorationBehavior.deletePermanentlyExisting'), defaultMessage: 'Delete Permanently existing'}),
      value: 'delete-permanently',
    },
  ];
  const [singleTypesBehavior, setSingleTypesBehavior] = useState<string>(singleTypesOptions[0].value);

  // const [draftPublishBehavior, setDraftPublishBehavior] = useState<string>(undefined);

  const [hasChanged, setHasChanged] = useState<boolean>(false);
  useEffect(() => {
    if (initialSettings) {
      setHasChanged(
        initialSettings.singleTypesResorationBehavior !== singleTypesBehavior
      );
    }
  }, [singleTypesBehavior, initialSettings]);

  useEffect(() => {
    setIsLoading(true);
    get(`/${pluginId}/settings`).catch((error: Error) => {
      console.error(error); // FIXME: Handle Get Settings Error
    }).then(response => {
      setInitialSettings(response.data);
      setSingleTypesBehavior(response.data.singleTypesResorationBehavior);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const save = () => {
    setIsLoading(true);
    put(`/${pluginId}/settings`, {
      singleTypesResorationBehavior: singleTypesBehavior,
    }).catch((error: Error) => {
      console.error(error); // FIXME: Handle Save Settings Error
    }).then(response => {
      setInitialSettings(response.data);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  return (
    <Box background="neutral100">
      <Layout>
        <BaseHeaderLayout
          title={formatMessage({id: getTrad('setting.restorationBehavior'), defaultMessage: 'Restoration Behavior'})}
          as="h1"
          primaryAction={
            <Button
              startIcon={<Check />}
              disabled={!hasChanged || isLoading}
              onClick={save}
            >
              {formatMessage({id: getTrad('save'), defaultMessage: 'Save'})}
            </Button>
          }
        />
        <ContentLayout>
          <Flex
            hasRadius
            background="neutral0"
            width="100%"
            padding={6}
            direction="column"
            alignItems="stretch"
            gap={4}
          >
            <SingleSelect
              disabled={isLoading}
              value={singleTypesBehavior}
              onChange={setSingleTypesBehavior}
              label={formatMessage({id: getTrad('singleTypes'), defaultMessage: 'Single Types'})}
              hint={formatMessage({id: getTrad('setting.restorationBehavior.singleTypes.hint'), defaultMessage: 'Select the behavior when restoring a single type.'})}
            >
              {singleTypesOptions.map(({ label, value }) => (
                <SingleSelectOption key={value} value={value}>
                  {label}
                </SingleSelectOption>
              ))}
            </SingleSelect>
          </Flex>
        </ContentLayout>
      </Layout>
    </Box>
  );
};

export default RestorationBehavior;
