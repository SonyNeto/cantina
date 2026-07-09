import z from 'zod';

const priceSchema = z
  .string()
  .trim()
  .min(1, 'Informe o preço')
  .transform((value) => Number(value.replace(',', '.')))
  .refine((value) => Number.isFinite(value), 'Informe um preço válido')
  .refine((value) => value > 0, 'O preço deve ser maior que zero');

export const menuItemSchema = z.object({
  label: z.string().trim().min(1, 'Informe o nome do item'),
  price: priceSchema,
});
