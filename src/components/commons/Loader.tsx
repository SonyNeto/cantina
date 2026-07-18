import type { FC } from 'react';
import { Loader as LoadingIcon } from 'pixelarticons/react';

export const Loader: FC = () => {
  return (
    <div className="text-text/35 flex h-full w-full p-2 items-center justify-center overflow-hidden [&_svg]:size-14 [&_svg]:shrink-0">
      <LoadingIcon />
    </div>
  );
};
