import type { FC } from 'react';
import { Loader as LoadingIcon } from 'pixelarticons/react';

export const Loader: FC = () => {
  return (
    <div className="text-accent flex h-[calc(100vh-84px)] w-full items-center justify-center overflow-hidden [&_svg]:size-14 [&_svg]:shrink-0">
      <LoadingIcon />
    </div>
  );
};
