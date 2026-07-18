import { ArrowLeft, ArrowRight } from 'pixelarticons/react';
import { cn } from '../../utils/functions';
import { Button } from './Button';
import type { ComponentProps } from 'react';

type PageNavigatorProps = ComponentProps<'div'> & {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
};

const MAX_VISIBLE_ITEMS = 7;
const EDGE_WINDOW_SIZE = MAX_VISIBLE_ITEMS - 2;
const CENTER_WINDOW_SIZE = MAX_VISIBLE_ITEMS - 4;
const CENTER_RADIUS = Math.floor(CENTER_WINDOW_SIZE / 2);
const EDGE_CURRENT_LIMIT = Math.ceil(EDGE_WINDOW_SIZE / 2);

type PaginationItem = number | 'start-ellipsis' | 'end-ellipsis';

const range = (start: number, count: number) =>
  Array.from({ length: count }, (_, index) => start + index);

const getPaginationItems = (currentPage: number, totalPages: number): PaginationItem[] => {
  if (totalPages <= MAX_VISIBLE_ITEMS) {
    return range(1, totalPages);
  }

  if (currentPage <= EDGE_CURRENT_LIMIT) {
    return [...range(1, EDGE_WINDOW_SIZE), 'end-ellipsis', totalPages];
  }

  if (currentPage >= totalPages - EDGE_CURRENT_LIMIT) {
    return [1, 'start-ellipsis', ...range(totalPages - EDGE_WINDOW_SIZE + 1, EDGE_WINDOW_SIZE)];
  }

  return [
    1,
    'start-ellipsis',
    ...range(currentPage - CENTER_RADIUS, CENTER_WINDOW_SIZE),
    'end-ellipsis',
    totalPages,
  ];
};

export const PageNavigator = ({
  currentPage,
  totalPages,
  setCurrentPage,
  className,
}: PageNavigatorProps) => {
  const paginationItems = getPaginationItems(currentPage, totalPages);

  return (
    <nav aria-label="pagination" className={cn('app-pagination raised', className)}>
      <Button
        variant="ghost"
        size="md"
        onClick={() => {
          if (currentPage > 1) setCurrentPage(currentPage - 1);
        }}
      >
        <ArrowLeft />
      </Button>
      <div className="inline-flex min-w-0 items-center justify-center gap-1 overflow-hidden">
        {paginationItems.map((item) => {
          if (typeof item !== 'number') {
            return (
              <span key={item} aria-hidden={true}>
                …
              </span>
            );
          }

          const isCurrentPage = item === currentPage;

          return (
            <Button
              key={`pagination-button-${item}`}
              variant="ghost"
              size="sm"
              className={cn('text-xl', isCurrentPage && 'text-danger')}
              aria-current={isCurrentPage ? 'page' : undefined}
              aria-label={`Ir para a página ${item}`}
              onClick={() => setCurrentPage(item)}
            >
              {item}
            </Button>
          );
        })}
      </div>

      <Button
        variant="ghost"
        size="md"
        onClick={() => {
          if (currentPage < totalPages) setCurrentPage(currentPage + 1);
        }}
      >
        <ArrowRight />
      </Button>
    </nav>
  );
};
