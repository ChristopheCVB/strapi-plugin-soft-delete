/*
 *
 * ContentTypeEntries
 *
 */

import type { ContentManagerConfigurationResponse, ContentTypeNavLink, ContentTypeEntry, Permission } from './types';

import { plugin } from '../../../../utils';
import getTrad from '../../utils/getTrad';

import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useFetchClient, useRBACProvider } from '@strapi/helper-plugin';
import parseISO from 'date-fns/parseISO';

import {
  BaseHeaderLayout,
  ContentLayout,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  BaseCheckbox,
  Typography,
  VisuallyHidden,
  Flex,
  IconButton,
  Link,
  ModalLayout,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Loader,
  Alert,
} from '@strapi/design-system';
import { Trash, ArrowLeft, Refresh, EmptyDocuments, EmptyPermissions } from '@strapi/icons';

declare type Props = {
  contentType?: ContentTypeNavLink;
};

const ContentTypeEntries: React.FunctionComponent<Props> = ({contentType}) => {
  const { formatMessage, formatDate } = useIntl();

  const { get, put } = useFetchClient();
  const { allPermissions }: { allPermissions: Permission[] } = useRBACProvider();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingError, setLoadingError] = useState<Error | null>(null);

  const [mainField, setMainField] = useState<string| null>(null);
  const [entries, setEntries] = useState<ContentTypeEntry[]>([]);
  const [selectedEntriesId, setSelectedEntriesId] = useState<number[]>([]);
  const [alert, setAlert] = useState<{variant: 'success' | 'danger', message: string} | undefined>(undefined);

  const canRestore = allPermissions.some(permission =>
    permission.action === `plugin::${plugin.pluginId}.explorer.restore` &&
    permission.subject === contentType?.uid
  );
  const canDeletePermanantly = allPermissions.some(permission =>
    permission.action === `plugin::${plugin.pluginId}.explorer.delete-permanently` &&
    permission.subject === contentType?.uid
  );
  const canReadMainField = mainField && allPermissions.some(permission =>
    permission.action === 'plugin::content-manager.explorer.read' &&
    permission.subject === contentType?.uid &&
    permission.properties.fields.includes(mainField)
  );

  useEffect(() => {
    setSelectedEntriesId([]);
    setEntries([]);
    setMainField(null);

    if (!contentType) return;

    setIsLoading(true);
    get(`/content-manager/content-types/${contentType.uid}/configuration`)
      .then((response: ContentManagerConfigurationResponse) => {
        setMainField(response.data.data.contentType.settings.mainField);
      })
      .catch((error: Error) => {
        setLoadingError(error);
      });

    get(`/${plugin.pluginId}/${contentType.kind}/${contentType.uid}`)
      .then((response: { data: ContentTypeEntry[] }) => {
        setEntries(response.data);
      })
      .catch((error: Error) => {
        setLoadingError(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [contentType])

  const [restoreModalEntriesId, setRestoreModalEntriesId] = useState<number[]>([]);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const confirmRestore = () => {
    if (isRestoring) return;

    setAlert(undefined);
    setIsRestoring(true);
    put(`/${plugin.pluginId}/${contentType?.kind}/${contentType?.uid}/restore`, {
      data: {
        ids: restoreModalEntriesId,
      },
    })
      .then(() => {
        setEntries(entries.filter(entry => !restoreModalEntriesId.includes(entry.id)));
        setSelectedEntriesId([]);
        setAlert({
          variant: 'success',
          message: formatMessage({id: getTrad('explorer.restore.success'), defaultMessage: 'Entries restored successfully'}),
        });
      })
      .catch((error: Error) => {
        setAlert({
          variant: 'danger',
          message: formatMessage({id: getTrad('explorer.restore.error'), defaultMessage: 'Error restoring entries'}),
        });
      })
      .finally(() => {
        setRestoreModalEntriesId([]);
        setIsRestoring(false);
        setTimeout(() => {
          setAlert(undefined);
        }, 3000);
      });
  };

  const [deletePermanentlyModalEntriesId, setDeletePermanentlyModalEntriesId] = useState<number[]>([]);
  const [isDeletingPermanently, setIsDeletingPermanently] = useState<boolean>(false);
  const confirmDeletePermanently = () => {
    if (isDeletingPermanently) return;

    setAlert(undefined);
    setIsDeletingPermanently(true);
    put(`/${plugin.pluginId}/${contentType?.kind}/${contentType?.uid}/delete`, {
      data: {
        ids: deletePermanentlyModalEntriesId,
      }
    })
      .then(() => {
        setEntries(entries.filter(entry => !deletePermanentlyModalEntriesId.includes(entry.id)));
        setSelectedEntriesId([]);
        setAlert({
          variant: 'success',
          message: formatMessage({id: getTrad('explorer.deletePermanently.success'), defaultMessage: 'Entries deleted permanently successfully'}),
        });
      })
      .catch((error: Error) => {
        setAlert({
          variant: 'danger',
          message: formatMessage({id: getTrad('explorer.deletePermanently.error'), defaultMessage: 'Error deleting entries permanently'}),
        });
      })
      .finally(() => {
        setDeletePermanentlyModalEntriesId([]);
        setIsDeletingPermanently(false);
        setTimeout(() => {
          setAlert(undefined);
        }, 3000);
      });
  };

  return (
    <>
      {isLoading && (
        <Flex justifyContent="center" alignItems="center" height="100%">
          <Loader />
        </Flex>
      )}
      {!isLoading && !loadingError && contentType && (
        <BaseHeaderLayout
          navigationAction={
            <Link startIcon={<ArrowLeft />} to={`/plugins/${plugin.pluginId}`}>
              {formatMessage({id: getTrad('back'), defaultMessage: 'Back'})}
            </Link>
          }
          title={contentType.label}
          subtitle={formatMessage({id: getTrad('explorer.countEntriesFound'), defaultMessage: `${entries.length} entries found`}, { count: entries.length })}
          as="h2"
        />
      )}
      {!isLoading && !loadingError && contentType && (
        <ContentLayout>
          <Table
            colCount={
              mainField && mainField != "id" && canReadMainField ? 6 : 5
            }
            rowCount={entries.length + 1}
          >
            <Thead>
              <Tr>
                <Th>
                  <BaseCheckbox
                    aria-label="Select all entries"
                    disabled={
                      (!canRestore && !canDeletePermanantly) ||
                      !entries.length
                    }
                    checked={
                      entries.length &&
                      selectedEntriesId.length === entries.length
                    }
                    indeterminate={
                      entries.length &&
                      selectedEntriesId.length &&
                      selectedEntriesId.length !== entries.length
                    }
                    onChange={() =>
                      selectedEntriesId.length === entries.length
                        ? setSelectedEntriesId([])
                        : setSelectedEntriesId(
                            entries.map((entry) => entry.id)
                          )
                    }
                  />
                </Th>
                <Th>
                  <Typography variant="sigma">ID</Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">
                    {formatMessage({id: getTrad('explorer.softDeletedAt'), defaultMessage: 'Soft Deleted At'})}
                  </Typography>
                </Th>
                <Th>
                  <Typography variant="sigma">{formatMessage({id: getTrad('explorer.softDeletedBy'), defaultMessage: 'Soft Deleted By'})}</Typography>
                </Th>
                {mainField && mainField != "id" && canReadMainField && (
                  <Th>
                    <Typography variant="sigma">{mainField}</Typography>
                  </Th>
                )}
                <Th>
                  {(selectedEntriesId.length && (
                    <Flex justifyContent="end" gap="1" width="100%">
                      {canRestore && (
                        <IconButton
                          onClick={() => {
                            setDeletePermanentlyModalEntriesId([]);
                            setRestoreModalEntriesId(selectedEntriesId);
                          }}
                          label={formatMessage({id: getTrad('explorer.restore'), defaultMessage: 'Restore'})}
                          icon={<Refresh />}
                        />
                      )}
                      {canDeletePermanantly && (
                        <IconButton
                          onClick={() => {
                            setRestoreModalEntriesId([]);
                            setDeletePermanentlyModalEntriesId(
                              selectedEntriesId
                            );
                          }}
                          label={formatMessage({id: getTrad('explorer.deletePermanently'), defaultMessage: 'Delete Permanently'})}
                          icon={<Trash />}
                        />
                      )}
                    </Flex>
                  )) || <VisuallyHidden>{formatMessage({id: getTrad('explorer.actions'), defaultMessage: 'Actions'})}</VisuallyHidden>}
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {(entries.length &&
                entries.map((entry) => (
                  <Tr key={entry.id}>
                    <Td>
                      <BaseCheckbox
                        aria-label={`Select ${entry.name}`}
                        disabled={!canRestore && !canDeletePermanantly}
                        checked={selectedEntriesId.includes(entry.id)}
                        onChange={() =>
                          selectedEntriesId.includes(entry.id)
                            ? setSelectedEntriesId(
                                selectedEntriesId.filter(
                                  (item) => item !== entry.id
                                )
                              )
                            : setSelectedEntriesId([
                                ...selectedEntriesId,
                                entry.id,
                              ])
                        }
                      />
                    </Td>
                    <Td>
                      <Typography textColor="neutral800">
                        {entry.id}
                      </Typography>
                    </Td>
                    <Td>
                      <Typography textColor="neutral800">
                        {formatDate(parseISO(entry._softDeletedAt), {
                          dateStyle: "full",
                          timeStyle: "short",
                        })}
                      </Typography>
                    </Td>
                    <Td>
                      <Typography textColor="neutral800">
                        {entry._softDeletedBy.name || entry._softDeletedBy.id || "-"}&nbsp;({entry._softDeletedBy.type})
                      </Typography>
                    </Td>
                    {mainField && mainField != "id" && canReadMainField && (
                      <Td>
                        <Typography textColor="neutral800">
                          {entry[mainField]}
                        </Typography>
                      </Td>
                    )}
                    <Td>
                      <Flex justifyContent="end" gap="1">
                        {canRestore && (
                          <IconButton
                            onClick={() => {
                              setDeletePermanentlyModalEntriesId([]);
                              setRestoreModalEntriesId([entry.id]);
                            }}
                            label={formatMessage({id: getTrad('explorer.restore'), defaultMessage: 'Restore'})}
                            icon={<Refresh />}
                          />
                        )}
                        {canDeletePermanantly && (
                          <IconButton
                            onClick={() => {
                              setRestoreModalEntriesId([]);
                              setDeletePermanentlyModalEntriesId([
                                entry.id,
                              ]);
                            }}
                            label={formatMessage({id: getTrad('explorer.deletePermanently'), defaultMessage: 'Delete Permanently'})}
                            icon={<Trash />}
                          />
                        )}
                      </Flex>
                    </Td>
                  </Tr>
                ))) || (
                <Tr>
                  <Td colSpan={5}>
                    <Flex direction="column" gap="6" padding="4rem">
                      <EmptyDocuments width="10rem" height="5.5rem" />
                      <Typography variant="delta" textColor="neutral600">
                        {formatMessage({id: getTrad('explorer.noEntriesFound'), defaultMessage: 'No entries found'})}
                      </Typography>
                    </Flex>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </ContentLayout>
      )}
      {!isLoading && loadingError && (
        <Flex
          direction="column"
          gap="2"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <Typography variant="delta" textColor="neutral500">
            {formatMessage({id: getTrad('explorer.errorLoadingEntries'), defaultMessage: 'Error loading entries'})}
          </Typography>
          <Typography variant="delta" textColor="neutral600">
            {loadingError.message}
          </Typography>
        </Flex>
      )}
      {!isLoading && !loadingError && !contentType && (
        <Flex
          direction="column"
          gap="2"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <EmptyPermissions width="10rem" height="5.5rem" />
          <Typography variant="delta" textColor="neutral600">
            {formatMessage({id: getTrad('explorer.noContentTypeSelected'), defaultMessage: 'No type selected'})}
          </Typography>
        </Flex>
      )}
      {(restoreModalEntriesId.length && (
        <ModalLayout
          onClose={!isRestoring ? () => setRestoreModalEntriesId([]) : null}
          labelledBy="title"
        >
          <ModalHeader>
            <Typography
              fontWeight="bold"
              textColor="neutral800"
              as="h2"
              id="title"
            >
              {formatMessage({id: getTrad('explorer.confirmation.restore.title'), defaultMessage: 'Confirm Restoration'})}
            </Typography>
          </ModalHeader>
          <ModalBody>
            <Typography textColor="neutral800">
              {formatMessage({id: getTrad('explorer.confirmation.restore.description'), defaultMessage: 'Are you sure you want to restore this?'})}
            </Typography>
          </ModalBody>
          <ModalFooter
            startActions={
              <Button
                variant="tertiary"
                onClick={() => setRestoreModalEntriesId([])}
                disabled={isRestoring}
              >
                {formatMessage({id: getTrad('cancel'), defaultMessage: 'Cancel'})}
              </Button>
            }
            endActions={
              <Button
                variant="default"
                onClick={confirmRestore}
                loading={isRestoring}
                startIcon={<Refresh />}
              >
                {formatMessage({id: getTrad('explorer.restore'), defaultMessage: 'Restore'})}
              </Button>
            }
          />
        </ModalLayout>
      )) || <></>}
      {(deletePermanentlyModalEntriesId.length && (
        <ModalLayout
          onClose={
            !isDeletingPermanently
              ? () => setDeletePermanentlyModalEntriesId([])
              : null
          }
          labelledBy="title"
        >
          <ModalHeader>
            <Typography
              fontWeight="bold"
              textColor="neutral800"
              as="h2"
              id="title"
            >
              {formatMessage({id: getTrad('explorer.confirmation.deletePermanently.title'), defaultMessage: 'Confirm Delete Permanently'})}
            </Typography>
          </ModalHeader>
          <ModalBody>
            <Typography textColor="neutral800">
              {formatMessage({id: getTrad('explorer.confirmation.deletePermanently.description'), defaultMessage: 'Are you sure you want to delete this permanently?'})}
            </Typography>
          </ModalBody>
          <ModalFooter
            startActions={
              <Button
                onClick={() => setDeletePermanentlyModalEntriesId([])}
                variant="tertiary"
                disabled={isDeletingPermanently}
              >
                {formatMessage({id: getTrad('cancel'), defaultMessage: 'Cancel'})}
              </Button>
            }
            endActions={
              <Button
                variant="danger-light"
                onClick={confirmDeletePermanently}
                loading={isRestoring}
                startIcon={<Trash />}
              >
                {formatMessage({id: getTrad('explorer.deletePermanently'), defaultMessage: 'Delete permanently'})}
              </Button>
            }
          />
        </ModalLayout>
      )) || <></>}
      {(alert && <Alert
        position="fixed"
        top="5%"
        left="40%"
        zIndex="100"
        variant={alert.variant}
        onClose={() => setAlert(undefined)}
      >
        {alert.message}
      </Alert>) || <></>}
    </>
  );
}

export default ContentTypeEntries;
