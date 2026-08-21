import { Check, PenSquare } from 'pixelarticons/react';
import { TrashCan } from '../../../assets/icons/MenuIcons';
import { Button } from '../../../components/commons/Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from '../../../components/commons/Dialog';
import { Loader } from '../../../components/commons/Loader';
import { SwipeActionRow } from '../../../components/commons/SwipeActionRow';
import { TabPanel } from '../../../components/commons/Tabs';
import type { WorkspacePageState } from '../hooks/useWorkspacePageState';
import type { WorkspaceFormRequest, WorkspaceList, WorkspaceListItem } from '../types';
import { WorkspaceItemForm } from './WorkspaceItemForm';

type WorkspaceListPanelProps = {
  list: WorkspaceList;
  workspaceId?: string;
  pageState: WorkspacePageState;
};

const getItemText = (item: WorkspaceListItem) => {
  if ('label' in item) return item.label;
  if ('name' in item) return item.name;
  return item.email;
};

export const WorkspaceListPanel = ({ list, workspaceId, pageState }: WorkspaceListPanelProps) => {
  const parent = list.parent;

  return (
    <TabPanel
      value={list.key}
      title={list.label}
      currentPage={pageState.currentPage}
      totalPages={list.pagination.totalPages}
      setCurrentPage={pageState.setCurrentPage}
      search={pageState.search}
      setSearch={pageState.setSearch}
      searchPlaceholder={`Encontre ${list.label}`}
      onAdd={pageState.startAdding}
      isAdding={pageState.isAdding}
      returnAction={parent ? () => pageState.returnToParentList(parent) : undefined}
    >
      {pageState.isAdding && (
        <WorkspaceItemForm
          request={{ key: list.key } as WorkspaceFormRequest}
          workspaceId={workspaceId}
          responsibleId={pageState.responsibleId}
          shiftId={pageState.shiftId}
          inviteOpen
          onInviteOpenChange={pageState.setIsAdding}
          onClose={() => pageState.setIsAdding(false)}
        />
      )}

      {list.items.map((item) => {
        const isEditing = pageState.editingItemId === item.id;
        const isDrawerOpen = pageState.drawerOpenItemId === item.id;

        return (
          <div key={item.id} className="app-row relative isolate overflow-hidden !p-0">
            {isEditing ? (
              <WorkspaceItemForm
                request={{ key: list.key, item } as WorkspaceFormRequest}
                workspaceId={workspaceId}
                responsibleId={pageState.responsibleId}
                shiftId={pageState.shiftId}
                inviteOpen={false}
                onInviteOpenChange={pageState.setIsAdding}
                onClose={() => pageState.finishEditing(item.id)}
              />
            ) : (
              <div className="app-row-action relative z-10 grid w-full grid-cols-[minmax(0,1fr)_7ch] items-center gap-2.5 py-4 pr-8 pl-4">
                <span>{getItemText(item)}</span>
                <span>{'role' in item && item.role}</span>
              </div>
            )}

            <SwipeActionRow
              right={{
                content: (
                  <>
                    <Button onClick={() => pageState.toggleEditing(item.id)} disabled={isEditing}>
                      <PenSquare />
                    </Button>

                    <Dialog>
                      <DialogTrigger
                        render={<Button size="md" variant="primary" disabled={isEditing} />}
                      >
                        <TrashCan />
                      </DialogTrigger>
                      <DialogContent title="Atenção">
                        <span>Tem certeza que deseja excluir?</span>
                        <DialogClose
                          render={
                            <Button
                              onClick={() => {
                                list.deleteItem(item.id);
                                pageState.finishDeleting();
                              }}
                            />
                          }
                        >
                          <Check />
                          <span>Sim</span>
                        </DialogClose>
                      </DialogContent>
                    </Dialog>
                  </>
                ),
                handleWidth: 16,
                width: 136,
              }}
              openSide={isDrawerOpen ? 'right' : null}
              onOpenSideChange={(side) =>
                pageState.setDrawerOpenItemId(side === 'right' ? item.id : null)
              }
              onTap={() => {
                if (list.child) pageState.showChildList(list.child, item.id);
              }}
              captureInteractions={!isEditing}
            />
          </div>
        );
      })}

      {list.isFetching && <Loader />}
    </TabPanel>
  );
};
