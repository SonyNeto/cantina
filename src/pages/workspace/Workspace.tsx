import type { FC } from 'react';
import { Tab, Tabs, TabsIndicator, TabsList } from '../../components/commons/Tabs';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { WorkspaceListPanel } from './components/WorkspaceListPanel';
import { DEFAULT_WORKSPACE_TAB, useWorkspacePageState } from './hooks/useWorkspacePageState';
import { useWorkspaceLists } from './hooks/useWorkspaceLists';
import type { WorkspaceListKey } from './types';

export const Workspace: FC = () => {
  const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
  const pageState = useWorkspacePageState();
  const lists = useWorkspaceLists({
    page: pageState.currentPage,
    search: pageState.search,
    workspaceId,
    responsibleId: pageState.responsibleId,
    shiftId: pageState.shiftId,
  });

  return (
    <Tabs
      defaultValue={DEFAULT_WORKSPACE_TAB}
      value={pageState.tab}
      onValueChange={(value) => pageState.selectTab(value as WorkspaceListKey)}
      className="app-page"
    >
      <TabsList className="relative flex items-center">
        {lists.map((list) => {
          if (list.key !== pageState.tab && list.parent) return null;

          return (
            <Tab key={list.key} value={list.key}>
              <list.icon />
            </Tab>
          );
        })}
        <TabsIndicator />
      </TabsList>

      {lists.map((list) => (
        <WorkspaceListPanel
          key={list.key}
          list={list}
          workspaceId={workspaceId}
          pageState={pageState}
        />
      ))}
    </Tabs>
  );
};
