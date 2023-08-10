import { Todo, TodoSchema } from '@server/schema/todo';
import { supabase } from '@server/infra/db/supabase';

interface TodoRepositoryGetParams {
  page?: number;
  limit?: number;
}

interface TodoRepositoryGetOutput {
  todos: Todo[];
  totalTodos: number;
  pages: number;
}

async function get({
  page,
  limit,
}: TodoRepositoryGetParams = {}): Promise<TodoRepositoryGetOutput> {
  const currentPage = page || 1;
  const currentLimit = limit || 10;
  const startIndex = (currentPage - 1) * currentLimit;
  const endIndex = currentPage * currentLimit - 1;
  const { data, count, error } = await supabase()
    .from('todos')
    .select('*', { count: 'exact' })
    .eq('deleted', false)
    .order('date', { ascending: false })
    .range(startIndex, endIndex);
  if (error) throw new Error('Failed to fetch data');

  const parsedData = TodoSchema.array().safeParse(data);

  if (!parsedData.success) {
    throw parsedData.error;
  }

  const todos = parsedData.data;
  const totalTodos = count || todos.length;
  const pages = Math.ceil(totalTodos / currentLimit);

  return {
    todos,
    totalTodos,
    pages,
  };
}

async function getTodoById(id: string): Promise<Todo> {
  const { data, error } = await supabase()
    .from('todos')
    .select()
    .eq('id', id)
    .single();

  if (error) throw new Error('Failed to get todo by id');

  const parsedData = TodoSchema.safeParse(data);
  if (!parsedData.success) throw new Error('Failed to parse searched todo');

  return parsedData.data;
}

async function createByContent(content: string): Promise<Todo> {
  const { data, error } = await supabase()
    .from('todos')
    .insert({ content: content })
    .select()
    .single();

  if (error) throw new Error('Failed to insert todo in database');

  const parsedData = TodoSchema.parse(data);
  return parsedData;
}

async function deleteById(id: string) {
  const todo = await getTodoById(id);

  const { error } = await supabase()
    .from('todos')
    .update({ deleted: true })
    .eq('id', todo.id);

  if (error) throw new Error('Failed to delete todo');

  return;
}

async function toggleDone(id: string): Promise<Todo> {
  const todo = await getTodoById(id);

  const { data, error } = await supabase()
    .from('todos')
    .update({ done: !todo.done })
    .eq('id', todo.id)
    .select()
    .single();

  if (error) throw new Error('Failed to toggle todo');

  const parsedData = TodoSchema.parse(data);
  return parsedData;
}

export const todoRepository = {
  get,
  createByContent,
  deleteById,
  toggleDone,
};
