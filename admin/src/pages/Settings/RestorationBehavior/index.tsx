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
  Alert,
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
  const [alert, setAlert] = useState<{ variant: 'success' | 'danger', message: string, error?: Error } | undefined>(undefined);

  const singleTypesRestorationOptions = [
    {
      label: formatMessage({id: getTrad('setting.restorationBehavior.softDeleteExisting'), defaultMessage: 'Soft Delete existing'}),
      value: 'soft-delete',
    },
    {
      label: formatMessage({id: getTrad('setting.restorationBehavior.deletePermanentlyExisting'), defaultMessage: 'Delete Permanently existing'}),
      value: 'delete-permanently',
    },
  ];
  const [singleTypesRestorationBehavior, setSingleTypesRestorationBehavior] = useState<string>(singleTypesRestorationOptions[0].value);

  const draftPublishRestorationOptions = [
    {
      label: formatMessage({id: getTrad('setting.restorationBehavior.draft'), defaultMessage: 'Draft'}),
      value: 'draft',
    },
    {
      label: formatMessage({id: getTrad('setting.restorationBehavior.unchanged'), defaultMessage: 'Unchanged'}),
      value: 'unchanged',
    },
  ];
  const [draftPublishRestorationBehavior, setDraftPublishRestorationBehavior] = useState<string>(draftPublishRestorationOptions[0].value);

  const [hasChanged, setHasChanged] = useState<boolean>(false);
  useEffect(() => {
    if (initialSettings) {
      setHasChanged(
        initialSettings.singleTypesRestorationBehavior !== singleTypesRestorationBehavior
        || initialSettings.draftPublishRestorationBehavior !== draftPublishRestorationBehavior
      );
    }
  }, [initialSettings, singleTypesRestorationBehavior, draftPublishRestorationBehavior]);

  useEffect(() => {
    setIsLoading(true);
    get(`/${pluginId}/settings`).catch((error: Error) => {
      setAlert({
        variant: 'danger',
        message: formatMessage({id: getTrad('settings.load.error'), defaultMessage: 'Error while loading Settings'}),
        error,
      });
    }).then((response: any) => {
      setInitialSettings(response.data);
      setSingleTypesRestorationBehavior(response.data.singleTypesRestorationBehavior);
      setDraftPublishRestorationBehavior(response.data.draftPublishRestorationBehavior);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const save = () => {
    setIsLoading(true);
    put(`/${pluginId}/settings`, {
      singleTypesRestorationBehavior,
      draftPublishRestorationBehavior,
    }).catch((error: Error) => {
      setAlert({
        variant: 'danger',
        message: formatMessage({id: getTrad('settings.save.error'), defaultMessage: 'Error while saving Settings'}),
        error,
      });
    }).then((response: any) => {
      setInitialSettings(response.data);
      setAlert({
        variant: 'success',
        message: formatMessage({id: getTrad('settings.save.success'), defaultMessage: 'Successfully saved Setings'})
      });
    }).finally(() => {
      setIsLoading(false);
      setTimeout(() => {
        setAlert(undefined);
      }, 3000);
    });
  };

  return (
    <>
      {(alert && <Alert
      position="fixed"
      top="5%"
      left="40%"
      zIndex="100"
      variant={alert.variant}
      onClose={() => setAlert(undefined)}
    >
      {alert.message} {alert.error?.message}
    </Alert>) || <></>}
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
                loading={isLoading}
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
              gap={6}
            >
              <SingleSelect
                disabled={isLoading}
                value={singleTypesRestorationBehavior}
                onChange={setSingleTypesRestorationBehavior}
                label={formatMessage({id: getTrad('explorer.singleTypes'), defaultMessage: 'Single Types'})}
                hint={formatMessage({id: getTrad('setting.restorationBehavior.singleTypes.hint'), defaultMessage: 'Single types cannot be restored in the same way as collections. You can choose to soft delete the existing unique type or delete it permanently.'})}
              >
                {singleTypesRestorationOptions.map(({ label, value }) => (
                  <SingleSelectOption key={value} value={value}>
                    {label}
                  </SingleSelectOption>
                ))}
              </SingleSelect>
              <SingleSelect
                disabled={isLoading}
                value={draftPublishRestorationBehavior}
                onChange={setDraftPublishRestorationBehavior}
                label={formatMessage({id: getTrad('explorer.draftPublish'), defaultMessage: 'Draft & Publish'})}
                hint={formatMessage({id: getTrad('setting.restorationBehavior.draftPublish.hint'), defaultMessage: 'You can choose to restore an entry supporting Draft & Publish to a draft or unchanged.'})}
              >
                {draftPublishRestorationOptions.map(({ label, value }) => (
                  <SingleSelectOption key={value} value={value}>
                    {label}
                  </SingleSelectOption>
                ))}
              </SingleSelect>
            </Flex>
          </ContentLayout>
        </Layout>
      </Box>
    </>
  );
};

export default RestorationBehavior;
