import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import type { ComponentPropsWithoutRef, MouseEventHandler, ReactNode } from 'react';
import { cn } from '../../utils/functions';
import { PageNavigator } from './PageNavigator';
import { Button } from './Button';
import { ArrowLeft, Plus } from 'pixelarticons/react';
import { SearchBar } from './SearchBar';
import { WorkspaceSelect } from '../WorkspaceSelect';

type TabProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Tab>;
type TabPanelProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Panel> & {
  title: string;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  search: string;
  setSearch: (search: string) => void;
  searchPlaceholder: string;
  onAdd?: MouseEventHandler<HTMLButtonElement>;
  isAdding?: boolean;
  headerAction?: ReactNode;
  returnAction?: () => void | null;
};
type TabIndicatorProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Indicator>;

const Tabs = TabsPrimitive.Root;
const TabsList = TabsPrimitive.List;
const Tab = ({ className, ...props }: TabProps) => (
  <TabsPrimitive.Tab
    render={
      <Button
        size="lg"
        className={cn(
          'bg-panel-header hover:bg-info-soft sunken [&[data-active]]:raised !text-text focus-visible:ring-accent/35 !border-0 outline-none focus-visible:ring-[3px] [&_svg]:size-9',
          className,
        )}
      />
    }
    {...props}
  />
);

const TabsIndicator = ({ className, ...props }: TabIndicatorProps) => (
  <TabsPrimitive.Indicator
    className={cn(
      'border-panel-header absolute top-0 left-1 z-30 h-full w-[calc(var(--active-tab-width)-8px)] translate-x-[var(--active-tab-left)] border-b-4 p-2',
      className,
    )}
    {...props}
  />
);

const TabPanel = ({
  className,
  title,
  children,
  currentPage,
  totalPages,
  setCurrentPage,
  search,
  setSearch,
  searchPlaceholder,
  onAdd,
  isAdding,
  headerAction,
  returnAction,
  ...props
}: TabPanelProps) => (
  <TabsPrimitive.Panel className={cn('app-content', className)} {...props}>
    <div className="app-header grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] !border-0 shadow-[inset_4px_0_0_color-mix(in_srgb,var(--pixel-light)_72%,transparent),inset_-4px_0_0_color-mix(in_srgb,var(--pixel-dark)_48%,transparent),inset_0_-4px_0_color-mix(in_srgb,var(--pixel-dark)_48%,transparent)] [&_svg]:size-10 [&_svg]:shrink-0">
      {returnAction && (
        <Button variant={'ghost'} className="justify-self-start" disableHover onClick={returnAction}>
          <ArrowLeft />
        </Button>
      )}
      <span className="col-start-2 text-center">{title}</span>
      {headerAction ?? (
        <Button
          variant="primary"
          className="bg-info hover:bg-info-soft hover:text-info focus-visible:ring-accent/35 col-start-3 !size-12 place-items-center self-center justify-self-end !p-0 outline-none focus-visible:ring-[3px] [&_svg]:size-7"
          aria-label="Adicionar item"
          title="Adicionar item"
          onClick={onAdd}
          disabled={isAdding}
        >
          <Plus />
        </Button>
      )}
    </div>

    <WorkspaceSelect />

    <SearchBar
      query={search}
      setQuery={(query) => {
        setSearch(query);
        setCurrentPage(1);
      }}
      placeholder={searchPlaceholder}
    />

    <div className="app-list">{children}</div>

    <footer className="app-footer">
      <PageNavigator
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </footer>
  </TabsPrimitive.Panel>
);

export { Tabs, TabsList, Tab, TabsIndicator, TabPanel };
