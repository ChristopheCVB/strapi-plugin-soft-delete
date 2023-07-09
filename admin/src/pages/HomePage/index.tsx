/*
 *
 * HomePage
 *
 */

import React from 'react';
import { pluginId } from '../../../../utils/plugin';
import {
  Box,
  BaseHeaderLayout,
  Layout,
  SubNav,
  SubNavHeader,
  SubNavSection,
  SubNavSections,
  SubNavLink,
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
} from '@strapi/design-system';
import { Trash, ArrowLeft, Refresh, EmptyDocuments, Loader } from '@strapi/icons';

const { useState, useEffect } = React;
import { useHistory, useParams } from 'react-router-dom'
import { useFetchClient } from '@strapi/helper-plugin';
import { uidMatcher } from '../../../../utils';
import parseISO from 'date-fns/parseISO';
import { useIntl } from 'react-intl';

import { useRBACProvider } from '@strapi/helper-plugin';

declare type ContentTypeItem = {
  uid: string,
  kind: 'collectionType' | 'singleType',
  label: string,
  to: string,
}

declare type EntryItem = {
  id: number,
  softDeletedAt: string,
  softDeletedBy: {
    username: string,
    email: string,
  }[],
  [mainField: string]: unknown,
}

const HomePage: React.VoidFunctionComponent = () => {
  const { formatDate } = useIntl();
  const params = useParams();
  const history = useHistory();
  const [search, setSearch] = useState(''); // TODO: Implement Conent Type search
  const { get, put } = useFetchClient();
  const { allPermissions } = useRBACProvider();

  const [softDeletableCollectionTypes, setSoftDeletableCollectionTypes] = useState<ContentTypeItem[]>([]);
  const [softDeletableSingleTypes, setSoftDeletableSingleTypes] = useState<ContentTypeItem[]>([]);
  const [mainField, setMainField] = useState<string| null>(null);
  const [entries, setEntries] = useState<EntryItem[]>([]);

  const activeContentType = softDeletableCollectionTypes.concat(softDeletableSingleTypes).filter(contentType => params.uid === contentType.uid)[0]
  const canRestore = allPermissions.some(permission => permission.action === 'plugin::soft-delete.explorer.restore' && permission.subject === activeContentType?.uid);
  const canDeletePermanantly = allPermissions.some(permission => permission.action === 'plugin::soft-delete.explorer.delete-permanently' && permission.subject === activeContentType?.uid);
  const canReadMainField = allPermissions.some(permission => permission.action === 'plugin::content-manager.explorer.read' && permission.subject === activeContentType?.uid && permission.properties.fields.includes(mainField));

  useEffect(() => {
    get('/content-manager/init')
      .then(response => {
        const collectionTypes = (response.data.data.contentTypes as any[])
          .filter(contentType => contentType.isDisplayed && contentType.kind === 'collectionType' && uidMatcher(contentType.uid))
          .filter(contentType => allPermissions.some(permission => permission.action === `plugin::soft-delete.explorer.read` && permission.subject === contentType.uid))
          .map(contentType => ({
            uid: contentType.uid,
            kind: contentType.kind,
            label: contentType.info.displayName,
            to: `/plugins/${pluginId}/collectionType/${contentType.uid}`,
          }));

        const singleTypes = (response.data.data.contentTypes as any[])
          .filter(contentType => contentType.isDisplayed && contentType.kind === 'singleType' && uidMatcher(contentType.uid))
          .filter(contentType => allPermissions.some(permission => permission.action === `plugin::soft-delete.explorer.read` && permission.subject === contentType.uid))
          .map(contentType => ({
            uid: contentType.uid,
            kind: contentType.kind,
            label: contentType.info.displayName,
            to: `/plugins/${pluginId}/singleType/${contentType.uid}`,
          }));

        setSoftDeletableCollectionTypes(collectionTypes);
        setSoftDeletableSingleTypes(singleTypes);

        const firstSoftDeletableContentType = collectionTypes.concat(singleTypes)[0];
        if (firstSoftDeletableContentType && (!params.type || !params.uid)) {
          history.push(`/plugins/${pluginId}/${firstSoftDeletableContentType.kind}/${firstSoftDeletableContentType.uid}`);
        }
      });
  }, [params.type, params.uid])

  const [selectedEntriesIds, setSelectedEntriesIds] = useState<number[]>([]);

  useEffect(() => {
    setSelectedEntriesIds([]);
    setEntries([]);
    if (!activeContentType) return;

    get(`/content-manager/content-types/${activeContentType.uid}/configuration`)
      .then(response => {
        setMainField(response.data.data.contentType.settings.mainField);
      });

    get(`/${pluginId}/${activeContentType.kind}/${activeContentType.uid}`)
      .then(response => {
        setEntries(response.data);
      });
  }, [params.type, params.uid, softDeletableCollectionTypes, softDeletableSingleTypes])

  const [restoreModalEntriesIds, setRestoreModalEntriesIds] = useState<number[]>([]);
  const [deletePermanentlyModalEntriesIds, setDeletePermanentlyModalEntriesIds] = useState<number[]>([]);

  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const confirmRestore = () => {
    if (isRestoring) return;

    setIsRestoring(true);
    put(`/${pluginId}/restore/${activeContentType?.kind}/${activeContentType?.uid}`, {
      data: {
        ids: restoreModalEntriesIds,
      },
    })
      .then(() => {
        setEntries(entries.filter(entry => !restoreModalEntriesIds.includes(entry.id)));
        setSelectedEntriesIds([]);
      })
      .catch(error => {
        console.log(error); // TODO: Show error
      })
      .finally(() => {
        setRestoreModalEntriesIds([]);
        setIsRestoring(false);
      });
  };

  const [isDeletingPermanently, setIsDeletingPermanently] = useState<boolean>(false);
  const confirmDeleteForever = () => {
    if (isDeletingPermanently) return;

    setIsDeletingPermanently(true);
    put(`/${pluginId}/delete/${activeContentType?.kind}/${activeContentType?.uid}`, {
      data: {
        ids: deletePermanentlyModalEntriesIds,
      }
    })
      .then(() => {
        setEntries(entries.filter(entry => !deletePermanentlyModalEntriesIds.includes(entry.id)));
        setSelectedEntriesIds([]);
      })
      .catch(error => {
        console.log(error); // TODO: Show error
      })
      .finally(() => {
        setDeletePermanentlyModalEntriesIds([]);
        setIsDeletingPermanently(false);
      });
  };

  return (
    <Box background="neutral100">
      <Layout sideNav={<SubNav ariaLabel="Soft Delete sub nav">
        <SubNavHeader searchable value={search} onClear={() => setSearch('')} onChange={e => setSearch(e.target.value)} label="Soft Delete" searchLabel="Search..." />
            <SubNavSections>
              <SubNavSection label="Collection Type" collapsable badgeLabel={softDeletableCollectionTypes.length.toString()}>
                {
                  softDeletableCollectionTypes.map((contentType, index) => <SubNavLink to={contentType.to} active={contentType.uid === activeContentType?.uid} key={index}>
                    {contentType.label}
                  </SubNavLink>)
                }
              </SubNavSection>
              <SubNavSection label="Single Type" collapsable badgeLabel={softDeletableSingleTypes.length.toString()}>
                {
                  softDeletableSingleTypes.map((contentType, index) => <SubNavLink to={contentType.to} active={contentType.uid === activeContentType?.uid} key={index}>
                    {contentType.label}
                  </SubNavLink>)
                }
              </SubNavSection>
            </SubNavSections>
          </SubNav>}>
        <>
          {activeContentType && <BaseHeaderLayout navigationAction={
            <Link startIcon={<ArrowLeft />} to={`/plugins/${pluginId}`}>
              Go back
            </Link>
          } title={activeContentType?.label || ''} subtitle={entries.length + " entries found"} as="h2" />}
          {activeContentType && <ContentLayout>
            <Table colCount={mainField && mainField != 'id' && canReadMainField ? 6 : 5} rowCount={entries.length + 1}>
              <Thead>
                <Tr>
                  <Th>
                    <BaseCheckbox
                      aria-label="Select all entries"
                      disabled={!canRestore && !canDeletePermanantly || !entries.length}
                      checked={entries.length && selectedEntriesIds.length === entries.length}
                      indeterminate={entries.length && selectedEntriesIds.length && selectedEntriesIds.length !== entries.length}
                      onChange={() => selectedEntriesIds.length === entries.length ? setSelectedEntriesIds([]) : setSelectedEntriesIds(entries.map(entry => entry.id))}
                    />
                  </Th>
                  <Th>
                    <Typography variant="sigma">ID</Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma">Soft Deleted At</Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma">Soft Deleted By</Typography>
                  </Th>
                  {mainField && mainField != 'id' && canReadMainField && <Th>
                    <Typography variant="sigma">{mainField}</Typography>
                  </Th>}
                  <Th>
                    {selectedEntriesIds.length && <Flex justifyContent="end" gap="1" width="100%">
                      {canRestore && <IconButton onClick={() => {setDeletePermanentlyModalEntriesIds([]); setRestoreModalEntriesIds(selectedEntriesIds)}} label="Restore" icon={<Refresh />} />}
                      {canDeletePermanantly && <IconButton onClick={() => {setRestoreModalEntriesIds([]); setDeletePermanentlyModalEntriesIds(selectedEntriesIds)}} label="Delete forever" icon={<Trash />} />}
                    </Flex> || <VisuallyHidden>Actions</VisuallyHidden>}
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {entries.length &&
                  entries.map(entry => <Tr key={entry.id}>
                    <Td>
                      <BaseCheckbox
                        aria-label={`Select ${entry.name}`}
                        disabled={!canRestore && !canDeletePermanantly}
                        checked={selectedEntriesIds.includes(entry.id)}
                        onChange={() => selectedEntriesIds.includes(entry.id) ? setSelectedEntriesIds(selectedEntriesIds.filter(item => item !== entry.id)) : setSelectedEntriesIds([...selectedEntriesIds, entry.id])}
                      />
                    </Td>
                    <Td>
                      <Typography textColor="neutral800">{entry.id}</Typography>
                    </Td>
                    <Td>
                      <Typography textColor="neutral800">{formatDate(parseISO(entry.softDeletedAt), { dateStyle: 'full', timeStyle: 'short' })}</Typography>
                    </Td>
                    <Td>
                      <Typography textColor="neutral800">{entry.softDeletedBy[0]?.username || entry.softDeletedBy[0]?.email || '-'}</Typography>
                    </Td>
                    { mainField && mainField != 'id' && canReadMainField &&
                    <Td>
                      <Typography textColor="neutral800">{entry[mainField]}</Typography>
                    </Td>}
                    <Td>
                      <Flex justifyContent="end" gap="1">
                        {canRestore && <IconButton onClick={() => {setDeletePermanentlyModalEntriesIds([]); setRestoreModalEntriesIds([entry.id])}} label="Restore" icon={<Refresh />} />}
                        {canDeletePermanantly && <IconButton onClick={() => {setRestoreModalEntriesIds([]); setDeletePermanentlyModalEntriesIds([entry.id])}} label="Delete forever" icon={<Trash />} />}
                      </Flex>
                    </Td>
                  </Tr>) || <Tr>
                    <Td colSpan={5}>
                      <Flex direction="column" gap="6" padding="4rem">
                        <EmptyDocuments width="10rem" height="5.5rem" />
                        <Typography variant="delta" textColor="neutral600">No entries found</Typography>
                      </Flex>
                    </Td>
                  </Tr>
                }
              </Tbody>
            </Table>
          </ContentLayout>}
        </>
      </Layout>
      {restoreModalEntriesIds.length && <ModalLayout onClose={!isRestoring ? () => setRestoreModalEntriesIds([]) : null} labelledBy="title">
        <ModalHeader>
          <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
            Confirm Restore
          </Typography>
        </ModalHeader>
        <ModalBody>
          {isRestoring &&
          <Loader width="10rem" height="10rem" /> &&
          <Typography textColor="neutral800">
            Restoring {restoreModalEntriesIds.length > 1 ? `${restoreModalEntriesIds.length} entries` : 'one entry'}?
          </Typography> ||
          <Typography textColor="neutral800">
            Are you sure you want to restore {restoreModalEntriesIds.length > 1 ? `${restoreModalEntriesIds.length} entries` : 'one entry'}?
          </Typography>}
        </ModalBody>
        <ModalFooter startActions={<Button onClick={() => setRestoreModalEntriesIds([])} variant="tertiary" disabled={isRestoring}>
            Cancel
          </Button>} endActions={<>
            <Button onClick={confirmRestore} disabled={isRestoring}>Yes</Button>
          </>} />
      </ModalLayout> || <></>}
      {deletePermanentlyModalEntriesIds.length && <ModalLayout onClose={!isDeletingPermanently ? () => setDeletePermanentlyModalEntriesIds([]) : null} labelledBy="title">
        <ModalHeader>
          <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
            Confirm Delete Permanently
          </Typography>
        </ModalHeader>
        <ModalBody>
          {isDeletingPermanently &&
          <Loader width="10rem" height="10rem" /> &&
          <Typography textColor="neutral800">
            Restoring {deletePermanentlyModalEntriesIds.length > 1 ? `${deletePermanentlyModalEntriesIds.length} entries` : 'one entry'}?
          </Typography> ||
          <Typography textColor="neutral800">
            Are you sure you want to permanently delete {deletePermanentlyModalEntriesIds.length > 1 ? `${deletePermanentlyModalEntriesIds.length} entries` : 'one entry'}?
          </Typography>}
        </ModalBody>
        <ModalFooter startActions={<Button onClick={() => setDeletePermanentlyModalEntriesIds([])} variant="tertiary" disabled={isDeletingPermanently}>
            Cancel
          </Button>} endActions={<>
            <Button onClick={confirmDeleteForever} disabled={isDeletingPermanently}>Yes</Button>
          </>} />
      </ModalLayout> || <></>}
    </Box>
  );
};

export default HomePage;
