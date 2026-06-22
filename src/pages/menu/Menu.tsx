import { useState, type FC } from 'react';
import { Button } from '../../components/commons/Button';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../../components/commons/Accordion';
import { MENU } from '../../constants/canteen/menuitemstemp';
import { Check, PenSquare, Plus } from 'pixelarticons/react';
import { TrashCan, X } from '../../assets/icons/MenuIcons';

export const Menu: FC = () => {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  return (
    <div className="border-text m-6 flex h-fit flex-col overflow-hidden border-4">
      <div className="bg-tertiary grid w-full place-items-center gap-2.5 px-6 py-4 text-xl">
        <span className="text-center">Cardápio</span>
      </div>

      <Accordion>
        {MENU.ITEMS.map((item, idx) => {
          const isEditing = editingIdx === idx;

          return (
            <AccordionItem key={`menuitem-${item.label.trim().toLowerCase()}-${idx}`}>
              <div className="grid">
                {isEditing ? (
                  <div className="bg-hover/30 border-text/40 z-50 col-start-1 row-start-1 flex w-full items-center justify-between gap-2.5 overflow-hidden rounded-none border-t-4 px-4 py-3 text-xl font-medium whitespace-nowrap [&_svg]:size-10 [&_svg]:shrink-0">
                    <div className="inline-flex items-center gap-2.5">
                      <item.icon />
                      <input
                        id={`name-input-${item.label.trim().toLowerCase()}-${idx}`}
                        type="text"
                        defaultValue={`${item.label}`}
                        className="border-text/40 w-[12ch] border-4 px-2"
                      />
                    </div>
                    <div className="inline-flex items-center gap-1">
                      <span>R$</span>
                      <input
                        id={`price-input-${item.label.trim().toLowerCase()}-${idx}`}
                        type="number"
                        defaultValue={`${item.price.toFixed(2)}`}
                        className="border-text/40 w-[6ch] border-4 px-2 text-end"
                      />
                    </div>
                  </div>
                ) : (
                  <AccordionTrigger
                    render={
                      <Button
                        size="lg"
                        variant="ghost"
                        className="bg-primary border-text/40 col-start-1 row-start-1 w-full justify-between rounded-none border-t-4 px-4 py-8"
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
      {editingIdx !== -1 ? (
        <Button
          size="lg"
          className="border-text/40 !h-full !w-full justify-center gap-2.5 rounded-none border-t-4 px-4 py-3 text-xl"
          variant="ghost"
          disabled={editingIdx !== null}
          onClick={() => setEditingIdx(-1)}
        >
          <Plus />
          Adicionar item
        </Button>
      ) : (
        <div className="bg-hover/30 border-text/40 z-50 flex w-full items-center justify-between gap-2.5 overflow-hidden rounded-none border-t-4 px-6 py-3 text-xl font-medium whitespace-nowrap">
          <div>
            <input
              id={`add-item-name`}
              type="text"
              placeholder="Nome do Item"
              className="border-text/40 w-[12ch] border-4 px-2"
            />
          </div>
          <div className="inline-flex items-center gap-1">
            <span>R$</span>
            <input
              id={`add-item-price`}
              type="number"
              placeholder="Preço"
              className="border-text/40 w-[6ch] border-4 px-2 text-end"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Button variant="primary" size="sm" onClick={() => setEditingIdx(null)}>
              <Check />
            </Button>
            <Button variant="primary" size="sm" onClick={() => setEditingIdx(null)}>
              <X />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
