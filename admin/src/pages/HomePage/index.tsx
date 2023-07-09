/*
 *
 * HomePage
 *
 */

import React from 'react';
import pluginId from '../../pluginId';
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
import { Trash, ArrowLeft, Refresh, EmptyDocuments } from '@strapi/icons';

const { useState, useEffect } = React;
import { useHistory, useParams } from 'react-router-dom'
import { useFetchClient } from '@strapi/helper-plugin';
import { uidMatcher } from '../../../../utils';
import parseISO from 'date-fns/parseISO';
import { useIntl } from 'react-intl';

declare type ContentTypeItem = {
  uid: string,
  kind: 'collectionType' | 'singleType',
  label: string,
  to: string
}

const HomePage: React.VoidFunctionComponent = () => {
  const { formatDate } = useIntl();
  const params = useParams();
  const history = useHistory();
  const [search, setSearch] = useState('');
  const { get, put } = useFetchClient();

  const [softDeletableCollectionTypes, setSoftDeletableCollectionTypes] = useState<ContentTypeItem[]>([]);
  const [softDeletableSingleTypes, setSoftDeletableSingleTypes] = useState<ContentTypeItem[]>([]);
  const [mainField, setMainField] = useState<string| null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const activeContentType = softDeletableCollectionTypes.concat(softDeletableSingleTypes).filter(contentType => params.uid === contentType.uid)[0]
  useEffect(() => {
    get('/content-manager/init')
      .then(response => {
        const collectionTypes = (response.data.data.contentTypes as any[]).filter(contentType => contentType.isDisplayed && contentType.kind === 'collectionType' && uidMatcher(contentType.uid))
          .map((contentType, index) => ({
            uid: contentType.uid,
            kind: contentType.kind,
            label: contentType.info.displayName,
            to: `/plugins/${pluginId}/collectionType/${contentType.uid}`,
          }));
        setSoftDeletableCollectionTypes(collectionTypes);

        const singleTypes = (response.data.data.contentTypes as any[]).filter(contentType => contentType.isDisplayed && contentType.kind === 'singleType' && uidMatcher(contentType.uid))
          .map(contentType => ({
            uid: contentType.uid,
            kind: contentType.kind,
            label: contentType.info.displayName,
            to: `/plugins/${pluginId}/singleType/${contentType.uid}`,
          }));
        setSoftDeletableSingleTypes(singleTypes);

        const firstSoftDeletableContentType = collectionTypes.concat(singleTypes)[0];
        if (firstSoftDeletableContentType && (!params.type || !params.uid)) {
          history.push(`/plugins/${pluginId}/${firstSoftDeletableContentType.kind}/${firstSoftDeletableContentType.uid}`);
        }
      });
  }, [params.type, params.uid])

  const [selectedEntries, setSelectedEntries] = useState<number[]>([]);

  useEffect(() => {
    setSelectedEntries([]);
    if (!activeContentType) return;

    get(`/content-manager/content-types/${activeContentType.uid}/configuration`)
      .then(response => {
        const mainField = response.data.data.contentType.settings.mainField;
        setMainField(mainField);
      });

    get(`/${pluginId}/${activeContentType.kind}/${activeContentType.uid}`)
      .then(response => {
        setEntries(response.data);
      });
  }, [params.type, params.uid, softDeletableCollectionTypes, softDeletableSingleTypes])

  const [restoreModalOpen, setRestoreModalOpen] = useState<number[]>([]);
  const [deleteForeverModalOpen, setDeleteForeverModalOpen] = useState<number[]>([]);

  const [restoring, setRestoring] = useState<boolean>(false);
  const confirmRestore = () => {
    if (restoring) return;

    setRestoring(true);
    put(`/${pluginId}/restore/${activeContentType?.kind}/${activeContentType?.uid}`, {
      data: {
        ids: restoreModalOpen,
      },
    })
      .then(response => {
        setRestoreModalOpen([]);
      })
      .catch(error => {
        console.log(error);
        setRestoreModalOpen([]);
      })
      .finally(() => {
        setRestoring(false);
      });
  };

  const [deletingForever, setDeletingForever] = useState<boolean>(false);
  const confirmDeleteForever = () => {
    if (deletingForever) return;

    setDeletingForever(true);
    put(`/${pluginId}/delete/${activeContentType?.kind}/${activeContentType?.uid}`, {
      data: {
        ids: deleteForeverModalOpen,
      }
    })
      .then(response => {
        setDeleteForeverModalOpen([]);
      })
      .catch(error => {
        console.log(error);
        setDeleteForeverModalOpen([]);
      })
      .finally(() => {
        setDeletingForever(false);
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
            <Table colCount={mainField && mainField != 'id' ? 6 : 5} rowCount={entries.length + 1}>
              <Thead>
                <Tr>
                  <Th>
                    <BaseCheckbox
                      aria-label="Select all entries"
                      disabled={!entries.length}
                      checked={entries.length && selectedEntries.length === entries.length}
                      indeterminate={selectedEntries.length && selectedEntries.length !== entries.length}
                      onChange={() => selectedEntries.length === entries.length ? setSelectedEntries([]) : setSelectedEntries(entries.map(entry => entry.id))}
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
                  { mainField && mainField != 'id' &&<Th>
                    <Typography variant="sigma">{mainField}</Typography>
                  </Th>}
                  <Th>
                    {selectedEntries.length && <Flex justifyContent="end" gap="1" width="100%">
                      <IconButton onClick={() => {setDeleteForeverModalOpen([]); setRestoreModalOpen(selectedEntries)}} label="Restore" icon={<Refresh />} />
                      <IconButton onClick={() => {setRestoreModalOpen([]); setDeleteForeverModalOpen(selectedEntries)}} label="Delete forever" icon={<Trash />} />
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
                        checked={selectedEntries.includes(entry.id)}
                        onChange={() => selectedEntries.includes(entry.id) ? setSelectedEntries(selectedEntries.filter(item => item !== entry.id)) : setSelectedEntries([...selectedEntries, entry.id])}
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
                    { mainField && mainField != 'id' &&
                    <Td>
                      <Typography textColor="neutral800">{entry[mainField]}</Typography>
                    </Td>}
                    <Td>
                      <Flex justifyContent="end" gap="1">
                        <IconButton onClick={() => {setDeleteForeverModalOpen([]); setRestoreModalOpen([entry.id])}} label="Restore" icon={<Refresh />} />
                        <IconButton onClick={() => {setRestoreModalOpen([]); setDeleteForeverModalOpen([entry.id])}} label="Delete forever" icon={<Trash />} />
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
      {restoreModalOpen.length && <ModalLayout onClose={() => setRestoreModalOpen([])} labelledBy="title">
        <ModalHeader>
          <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
            Confirmation
          </Typography>
        </ModalHeader>
        <ModalBody>
          <Typography textColor="neutral800">
            Are you sure you want to restore {restoreModalOpen.length > 1 ? 'these entries' : 'this entry'}?
          </Typography>
        </ModalBody>
        <ModalFooter startActions={<Button onClick={() => setRestoreModalOpen([])} variant="tertiary" disabled={restoring}>
            Cancel
          </Button>} endActions={<>
            <Button onClick={confirmRestore} disabled={restoring}>Yes</Button>
          </>} />
      </ModalLayout> || <></>}
      {deleteForeverModalOpen.length && <ModalLayout onClose={() => setDeleteForeverModalOpen([])} labelledBy="title">
        <ModalHeader>
          <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
            Confirmation
          </Typography>
        </ModalHeader>
        <ModalBody>
          <Typography textColor="neutral800">
            Are you sure you want to delete {deleteForeverModalOpen.length > 1 ? 'these entries' : 'this entry'} forever?
          </Typography>
        </ModalBody>
        <ModalFooter startActions={<Button onClick={() => setDeleteForeverModalOpen([])} variant="tertiary" disabled={deletingForever}>
            Cancel
          </Button>} endActions={<>
            <Button onClick={confirmDeleteForever} disabled={deletingForever}>Yes</Button>
          </>} />
      </ModalLayout> || <></>}
    </Box>
  );
};

export default HomePage;
