import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, type ComponentPropsWithoutRef } from 'react';
import { toast } from 'sonner';
import { Plus } from 'pixelarticons/react';
import { apiFetch } from '../utils/api';
import { cn } from '../utils/functions';
import { Button } from './commons/Button';
import { Dialog, DialogContent, DialogTrigger } from './commons/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger } from './commons/Select';
import { useWorkspaceStore, type Workspace } from '../stores/useWorkspaceStore';

type WorkspacesResponse = {
  workspaces: Workspace[];
};

type WorkspaceSelectProps = Omit<
  ComponentPropsWithoutRef<typeof SelectTrigger>,
  'value' | 'onChange' | 'children' | 'placeholder'
>;

const getWorkspaces = async (): Promise<WorkspacesResponse> => {
  const res = await apiFetch('/workspaces');
  return res.json();
};

export const WorkspaceSelect = ({ className, ...props }: WorkspaceSelectProps) => {
  const queryClient = useQueryClient();
  const selectedWorkspace = useWorkspaceStore((state) => state.workspace);
  const setWorkspace = useWorkspaceStore((state) => state.setWorkspace);
  const setDefaultWorkspace = useWorkspaceStore.getState().setDefaultWorkspace;

  const { data: userWorkspaces, isPending } = useQuery({
    queryKey: ['workspaces'],
    queryFn: getWorkspaces,
    select: (data) => data.workspaces,
  });

  const postWorkspace = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiFetch('/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        throw new Error('Falha ao criar instituição');
      }

      return null;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Instituição criada com sucesso!');
    },

    onError: () => {
      toast.error('Falha ao criar instituição');
    },
  });

  useEffect(() => {
    if (!userWorkspaces) return;

    setDefaultWorkspace(userWorkspaces);
  }, [setDefaultWorkspace, userWorkspaces]);

  return (
    <Dialog>
      <Select
        name="workspaceSelect"
        id="workspace-select"
        value={selectedWorkspace?.id ?? null}
        onValueChange={(workspaceId) => {
          if (!workspaceId) return;

          const workspace = userWorkspaces?.find((item) => item.id === workspaceId);
          if (!workspace) return;

          setWorkspace(workspace);
          queryClient.invalidateQueries({
            predicate: (query) => query.queryKey[0] !== 'workspaces',
          });
        }}
        items={(userWorkspaces ?? []).map((workspace) => ({
          label: workspace.name,
          value: workspace.id,
        }))}
      >
        <SelectTrigger
          placeholder="Selecione uma instituição"
          className={cn(
            'border-text/40 bg-secondary text-text hover:bg-hover hover:text-text-hover h-14 w-full shrink-0 justify-between rounded-none border-x-0 border-t-0 border-b-4 px-4',
            className,
          )}
          {...props}
        />

        <SelectContent className="overflow-hidden rounded-none border-0">
          {!isPending &&
            userWorkspaces?.map((workspace) => (
              <SelectItem
                value={workspace.id}
                key={workspace.id}
                className="border-text/40 min-h-12 min-w-0 border-t-4 px-2"
              >
                {workspace.name}
              </SelectItem>
            ))}

          <DialogTrigger
            render={
              <Button
                variant="ghost"
                size="lg"
                className="border-text/40 text-text grid h-14 w-full grid-cols-[2.5rem_minmax(0,1fr)] rounded-none border-y-4 px-2"
              />
            }
          >
            <Plus className="col-start-1 justify-self-end" />
            <span className="col-start-2 min-w-0 truncate text-center text-xl font-medium">
              Adicionar instituição
            </span>
          </DialogTrigger>
        </SelectContent>
      </Select>

      <DialogContent title="Criar instituição">
        <form
          className="flex w-full min-w-0 flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();

            const formData = new FormData(e.currentTarget);
            const name = formData.get('name') as string;

            postWorkspace.mutate(name);
          }}
        >
          <input
            name="name"
            id="add-workspace-name"
            type="text"
            placeholder="Nome da instituição"
            className="border-text/40 bg-primary text-text placeholder:text-text/50 h-12 w-full min-w-0 border-4 px-3 text-xl outline-none focus-visible:ring-[3px]"
          />
          <Button
            variant="primary"
            size="md"
            type="submit"
            className="w-full shrink-0 rounded-none px-3"
          >
            Criar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
