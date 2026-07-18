import type { ComponentProps, FC } from 'react';
import { Button } from './Button';
import { Search } from 'pixelarticons/react';

type SearchBarProps = ComponentProps<'input'> & {
  placeholder?: string;
  query: string;
  setQuery: (query: string) => void;
};

export const SearchBar: FC<SearchBarProps> = ({ placeholder, query, setQuery }) => {
  return (
    <div className="app-toolbar inline-flex w-full items-stretch justify-between">
      <input
        type="text"
        placeholder={placeholder}
        className="app-input w-full px-2 text-xl"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <Button variant="primary" size="lg" className="border-y-0 border-r-0 border-l-4 size-full">
        <Search />
      </Button>
    </div>
  );
};
