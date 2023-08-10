import { z as schema } from 'zod';

export const TodoSchema = schema.object({
  id: schema.string().uuid(),
  content: schema.string(),
  date: schema.coerce.date(),
  done: schema.boolean(),
});

export type Todo = schema.infer<typeof TodoSchema>;
