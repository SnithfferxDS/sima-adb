import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  parents: z.array(z.string()).nullable(), // Allow null for parent_id
  active: z.boolean().default(true),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export function validateCategory(data: unknown) {
  try {
    return { data: categorySchema.parse(data), errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { data: null, errors: error.flatten().fieldErrors };
    }
    return { data: null, errors: { _form: ['An unexpected error occurred'] } };
  }
}

export const productTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  categories: z.array(z.number()).min(1, 'At least one category is required'),
});

export type ProductTypeFormData = z.infer<typeof productTypeSchema>;

export function validateProductType(data: unknown) {
  try {
    console.log(data);
    return { data: productTypeSchema.parse(data), errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { data: null, errors: error.flatten().fieldErrors };
    }
    return { data: null, errors: { _form: ['An unexpected error occurred'] } };
  }
}