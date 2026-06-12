import type { FC } from 'react';
import { Cake } from 'pixelarticons/react'
import { Button } from '../../components/commons/Button';

export const Menu: FC = () => {
  return (
    <div className="flex flex-col m-6 h-fit border-4 border-text">
      <div className="flex text-xl justify-center bg-tertiary w-full py-4 px-6 border-b-4 border-text/30 gap-2.5">
        Cardápio
      </div>

      <Button size="lg" variant="ghost" className="justify-between rounded-none bg-secondary w-full py-8 px-8 border-b-4 border-text/30">
        <div className="inline-flex items-center gap-2.5">
          <Cake/>
          Bolo
        </div>

        <div>Preço: R$4,50</div>
      </Button>

    </div>
  );
};
