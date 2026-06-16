import { useState, type FC } from 'react';
import { Button } from '../../components/commons/Button';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../../components/commons/Accordion';
import { MENU } from '../../constants/menuitemstemp';
import { Check, PenSquare } from 'pixelarticons/react';
import { TrashCan, X } from '../../assets/icons/MenuIcons';

export const Menu: FC = () => {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  return (
    <div className="border-text m-6 flex h-fit flex-col border-4">
      <div className="bg-tertiary flex w-full justify-center gap-2.5 px-6 py-4 text-xl">
        Cardápio
      </div>

      <Accordion>
        {MENU.ITEMS.map((item, idx) => {
          const isEditing = editingIdx === idx;

          return (
            <AccordionItem key={`menuitem-${item.label.trim().toLowerCase()}-${idx}`}>
              <div className="grid">
                {isEditing ? (
                  <div className="bg-secondary border-text/30 z-50 col-start-1 row-start-1 flex w-full items-center justify-between gap-2.5 overflow-hidden rounded-none border-t-4 px-6 py-3 text-xl font-medium whitespace-nowrap [&_svg]:size-10 [&_svg]:shrink-0">
                    <div className="inline-flex items-center gap-2.5">
                      <item.icon />
                      <input
                        id={`name-input-${item.label.trim().toLowerCase()}-${idx}`}
                        type="text"
                        defaultValue={`${item.label}`}
                        className="border-text/30 w-[10ch] border-4 px-2"
                      />
                    </div>
                    <div className="inline-flex items-center gap-2.5">
                      <span>R$</span>
                      <input
                        id={`price-input-${item.label.trim().toLowerCase()}-${idx}`}
                        type="text"
                        defaultValue={`${item.price.toFixed(2)}`}
                        className="border-text/30 w-[6ch] border-4 px-2 text-end"
                      />
                    </div>
                  </div>
                ) : (
                  <AccordionTrigger
                    render={
                      <Button
                        size="lg"
                        variant="ghost"
                        className="bg-secondary border-text/30 col-start-1 row-start-1 w-full justify-between rounded-none border-t-4 px-6 py-8"
                        disabled={editingIdx !== null}
                      >
                        <div className="inline-flex items-center gap-2.5">
                          <item.icon />
                          <span>{item.label}</span>
                        </div>
                        <span>{`R$${item.price.toFixed(2)}`}</span>
                      </Button>
                    }
                  />
                )}
              </div>

              <AccordionContent>
                <div className="flex items-center gap-2.5">
                  {isEditing ? (
                    <div className="flex flex-col gap-2.5">
                      <Button
                        size="lg"
                        variant="primary"
                        className="w-40 justify-start p-2"
                        onClick={() => (isEditing ? setEditingIdx(null) : setEditingIdx(idx))}
                      >
                        <Check />
                        <span>Salvar</span>
                      </Button>

                      <Button
                        size="lg"
                        variant="primary"
                        className="w-40 justify-start p-2"
                        onClick={() => (isEditing ? setEditingIdx(null) : setEditingIdx(idx))}
                      >
                        <X />
                        <span>Cancelar</span>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="lg"
                      variant="primary"
                      className="p-2"
                      onClick={() => (isEditing ? setEditingIdx(null) : setEditingIdx(idx))}
                    >
                      <PenSquare />
                      <span>Editar</span>
                    </Button>
                  )}
                  <Button size="lg" variant="primary" className="p-2">
                    <TrashCan />
                    <span>Excluir</span>
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};
