import z from 'zod';

const priceSchema = z
  .string()
  .trim()
  .min(1, 'Informe o preço')
  .transform((value) => Number(value.replace(',', '.')))
  .pipe(
    z
      .number()
      .finite('Informe um preço válido')
      .min(0.01, 'O preço deve ser maior que zero')
      .multipleOf(0.01, 'O preço não pode ter mais que duas casas decimais'),
  );

export const menuItemSchema = z.object({
  label: z.string().trim().min(1, 'Informe o nome do item'),
  price: priceSchema,
});
