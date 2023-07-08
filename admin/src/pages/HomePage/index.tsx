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
import { Trash, Refresh, ArrowLeft } from '@strapi/icons';

const { useState, useEffect } = React;
import { useLocation } from 'react-router-dom'
import { useFetchClient } from '@strapi/helper-plugin';
import { uidMatcher } from '../../../../utils';

declare type ContentType = {
  uid: string,
  kind: 'collectionType' | 'singleType',
  active: boolean,
  label: string,
  to: string
}

const HomePage: React.VoidFunctionComponent = () => {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const { get, del, put } = useFetchClient();

  const [softDeletableCollectionTypes, setSoftDeletableCollectionTypes] = useState<ContentType[]>([]);
  const [softDeletableSingleTypes, setSoftDeletableSingleTypes] = useState<ContentType[]>([]);
  const [activeContentType, setActiveContentType] = useState<ContentType | null>(null);
  const [mainField, setMainField] = useState<string| null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  useEffect(() => {
    get('/content-manager/init')
      .then(response => {
        const collectionTypes = (response.data.data.contentTypes as any[]).filter(contentType => contentType.isDisplayed && contentType.kind === 'collectionType' && uidMatcher(contentType.uid))
          .map((contentType, index) => ({
            uid: contentType.uid,
            kind: contentType.kind,
            active: false,
            label: contentType.info.displayName,
            to: `/plugins/${pluginId}/collectionType/${contentType.uid}`,
          }));
        setSoftDeletableCollectionTypes(collectionTypes);

        const singleTypes = (response.data.data.contentTypes as any[]).filter(contentType => contentType.isDisplayed && contentType.kind === 'singleType' && uidMatcher(contentType.uid))
          .map(contentType => ({
            uid: contentType.uid,
            kind: contentType.kind,
            active: false,
            label: contentType.info.displayName,
            to: `/plugins/${pluginId}/singleType/${contentType.uid}`,
          }));
        setSoftDeletableSingleTypes(singleTypes);
      });
  }, [])

  useEffect(() => {
    const collectionTypes = softDeletableCollectionTypes.map(contentType => {
      return {
        ...contentType,
        active: (location.pathname as string).match(/collectionType/) !== null && location.pathname.indexOf(contentType.kind + '/' + contentType.uid) > -1
      }
    })
    setSoftDeletableCollectionTypes(collectionTypes)
    const singleTypes = softDeletableSingleTypes.map(contentType => {
      return {
        ...contentType,
        active: (location.pathname as string).match(/singleType/) !== null && location.pathname.indexOf(contentType.kind + '/' + contentType.uid) > -1
      }
    })
    setSoftDeletableSingleTypes(singleTypes)
    const activeType = collectionTypes.concat(singleTypes).filter(type => type.active)[0]
    setActiveContentType(activeType);

    if (!activeType) return;

    get(`/content-manager/content-types/${activeType.uid}/configuration`)
      .then(response => {
        const mainField = response.data.data.contentType.settings.mainField;
        setMainField(mainField);
      });

    get(`/${pluginId}/${activeType.kind}/${activeType.uid}`)
      .then(response => {
        setEntries(response.data);
      });
  }, [location.pathname])

  const [restoreModalOpen, setRestoreModalOpen] = useState<false | number>(false);
  const [deleteForeverModalOpen, setDeleteForeverModalOpen] = useState<false | number>(false);

  const confirmRestore = () => {
    put(`/${pluginId}/${activeContentType?.kind}/${activeContentType?.uid}/${restoreModalOpen}`)
      .then(response => {
        setRestoreModalOpen(false);
      })
      .catch(error => {
        console.log(error);
        setRestoreModalOpen(false);
      });
  };

  const confirmDeleteForever = () => {
    del(`/${pluginId}/${activeContentType?.kind}/${activeContentType?.uid}/${deleteForeverModalOpen}`)
      .then(response => {
        setDeleteForeverModalOpen(false);
      })
      .catch(error => {
        console.log(error);
        setDeleteForeverModalOpen(false);
      });
  };

  return (
    <Box background="neutral100">
      <Layout sideNav={<SubNav ariaLabel="Soft Delete sub nav">
        <SubNavHeader searchable value={search} onClear={() => setSearch('')} onChange={e => setSearch(e.target.value)} label="Soft Delete" searchLabel="Search..." />
            <SubNavSections>
              <SubNavSection label="Collection Type" collapsable badgeLabel={softDeletableCollectionTypes.length.toString()}>
                {
                  softDeletableCollectionTypes.map((contentType, index) => <SubNavLink to={contentType.to} active={contentType.active} key={index}>
                    {contentType.label}
                  </SubNavLink>)
                }
              </SubNavSection>
              <SubNavSection label="Single Type" collapsable badgeLabel={softDeletableSingleTypes.length.toString()}>
                {
                  softDeletableSingleTypes.map((contentType, index) => <SubNavLink to={contentType.to} active={contentType.active} key={index}>
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
          } title={softDeletableCollectionTypes.concat(softDeletableSingleTypes).filter(type => type.active)[0]?.label || ''} subtitle={entries.length + " entries found"} as="h2" />}
          {activeContentType && <ContentLayout>
            <Table colCount={mainField && mainField != 'id' ? 6 : 5} rowCount={entries.length + 1}>
              <Thead>
                <Tr>
                  <Th>
                    <BaseCheckbox aria-label="Select all entries" />
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
                    <VisuallyHidden>Actions</VisuallyHidden>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {
                  entries.map(entry => <Tr key={entry.id}>
                    <Td>
                      <BaseCheckbox aria-label={`Select ${entry.name}`} />
                    </Td>
                    <Td>
                      <Typography textColor="neutral800">{entry.id}</Typography>
                    </Td>
                    <Td>
                      <Typography textColor="neutral800">{entry.softDeletedAt}</Typography>
                    </Td>
                    <Td>
                      <Typography textColor="neutral800">{entry.softDeletedBy}</Typography>
                    </Td>
                    { mainField && mainField != 'id' &&
                    <Td>
                      <Typography textColor="neutral800">{entry[mainField]}</Typography>
                    </Td>}
                    <Td>
                      <Flex justifyContent="end" gap="1">
                        <IconButton onClick={() => {setDeleteForeverModalOpen(false); setRestoreModalOpen(entry.id)}} label="Restore" icon={<Refresh />} />
                        <IconButton onClick={() => {setRestoreModalOpen(false); setDeleteForeverModalOpen(entry.id)}} label="Delete forever" icon={<Trash />} />
                      </Flex>
                    </Td>
                  </Tr>)
                }
              </Tbody>
            </Table>
          </ContentLayout>}
        </>
      </Layout>
      {restoreModalOpen && <ModalLayout onClose={() => setRestoreModalOpen(false)} labelledBy="title">
        <ModalHeader>
          <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
            Confirmation
          </Typography>
        </ModalHeader>
        <ModalBody>
          <Typography textColor="neutral800">
            Are you sure you want to restore this entry?
          </Typography>
        </ModalBody>
        <ModalFooter startActions={<Button onClick={() => setRestoreModalOpen(false)} variant="tertiary">
            Cancel
          </Button>} endActions={<>
            <Button onClick={confirmRestore}>Yes</Button>
          </>} />
      </ModalLayout>}
      {deleteForeverModalOpen && <ModalLayout onClose={() => setDeleteForeverModalOpen(false)} labelledBy="title">
        <ModalHeader>
          <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
            Confirmation
          </Typography>
        </ModalHeader>
        <ModalBody>
          <Typography textColor="neutral800">
            Are you sure you want to delete this entry forever?
          </Typography>
        </ModalBody>
        <ModalFooter startActions={<Button onClick={() => setDeleteForeverModalOpen(false)} variant="tertiary">
            Cancel
          </Button>} endActions={<>
            <Button onClick={confirmDeleteForever}>Yes</Button>
          </>} />
      </ModalLayout>}
    </Box>
  );
};

export default HomePage;
