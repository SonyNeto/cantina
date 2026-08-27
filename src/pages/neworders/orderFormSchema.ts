import { z } from 'zod';

export const orderFormSchema = z.object({
  studentId: z.string().trim().min(1, 'Selecione um aluno'),
  created_at: z.string().trim().min(1, 'Informe a data do pedido'),
  payment: z
    .number()
    .int('O pagamento deve ser informado em centavos')
    .nonnegative('O pagamento deve ser maior ou igual a zero'),
  keepChange: z.boolean(),
  details: z.string().trim().max(100, 'A observação deve ter no máximo 100 caracteres').optional(),
  items: z
    .array(
      z.object({
        id: z.string().trim().min(1).optional(),
        productId: z.string().trim().min(1, 'Selecione um item'),
        status: z.enum(['cooking', 'ready']).optional(),
      }),
    )
    .min(1, 'Adicione pelo menos um item ao pedido'),
});
