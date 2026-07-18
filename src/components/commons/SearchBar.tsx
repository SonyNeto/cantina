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
    <div className="border-border-soft inline-flex w-full items-stretch justify-between">
      <input
        type="text"
        placeholder={placeholder}
        className="w-full px-2 text-xl"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <Button variant="primary" size="md" className="border-l-4 border-y-0 border-r-0">
        <Search />
      </Button>
    </div>
  );
};
