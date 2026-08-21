import { useState } from 'react';
import { useSearchParams } from 'react-router';
import type { WorkspaceListKey, WorkspaceListRelation } from '../types';

export const DEFAULT_WORKSPACE_TAB: WorkspaceListKey = 'memberships';

const workspaceListKeys: WorkspaceListKey[] = [
  'memberships',
  'shifts',
  'schoolClasses',
  'responsibles',
  'students',
];

const isWorkspaceListKey = (value: string | null): value is WorkspaceListKey =>
  workspaceListKeys.some((key) => key === value);

export const useWorkspacePageState = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [drawerOpenItemId, setDrawerOpenItemId] = useState<string | null>(null);

  const requestedTab = searchParams.get('tab');
  const tab = isWorkspaceListKey(requestedTab) ? requestedTab : DEFAULT_WORKSPACE_TAB;
  const responsibleId = searchParams.get('responsibleId') ?? undefined;
  const shiftId = searchParams.get('shiftId') ?? undefined;

  const resetTransientState = () => {
    setIsAdding(false);
    setDrawerOpenItemId(null);
    setEditingItemId(null);
  };

  const selectTab = (nextTab: WorkspaceListKey) => {
    setCurrentPage(1);
    resetTransientState();
    setSearchParams({ tab: nextTab });
  };

  const showChildList = (child: WorkspaceListRelation, parentId: string) => {
    setSearchParams({
      tab: child.key,
      [child.param]: parentId,
    });
  };

  const returnToParentList = (parent: WorkspaceListRelation) => {
    setCurrentPage(1);
    resetTransientState();
    setSearchParams({ tab: parent.key });
  };

  const startAdding = () => {
    setIsAdding(true);
    setEditingItemId(null);
    setDrawerOpenItemId(null);
  };

  const toggleEditing = (itemId: string) => {
    setEditingItemId((current) => (current === itemId ? null : itemId));
    setDrawerOpenItemId((current) => (current === itemId ? null : itemId));
    setIsAdding(false);
  };

  const finishEditing = (itemId: string) => {
    setEditingItemId(null);
    setDrawerOpenItemId(itemId);
  };

  const finishDeleting = () => {
    setEditingItemId(null);
    setIsAdding(false);
    setDrawerOpenItemId(null);
  };

  return {
    tab,
    responsibleId,
    shiftId,
    currentPage,
    setCurrentPage,
    search,
    setSearch,
    isAdding,
    setIsAdding,
    editingItemId,
    drawerOpenItemId,
    setDrawerOpenItemId,
    selectTab,
    showChildList,
    returnToParentList,
    startAdding,
    toggleEditing,
    finishEditing,
    finishDeleting,
  };
};

export type WorkspacePageState = ReturnType<typeof useWorkspacePageState>;
