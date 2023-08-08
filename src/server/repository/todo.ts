import { createTodo, readTodos, updateTodo } from '@db-crud-todo';
import { HttpNotFoundError } from '@server/infra/errors';

interface Todo {
  id: string;
  content: string;
  date: string;
  done: boolean;
}

interface TodoRepositoryGetParams {
  page?: number;
  limit?: number;
}

interface TodoRepositoryGetOutput {
  todos: Todo[];
  totalTodos: number;
  pages: number;
}

function get({
  page,
  limit,
}: TodoRepositoryGetParams = {}): TodoRepositoryGetOutput {
  const currentPage = page || 1;
  const currentLimit = limit || 10;
  const allTodos = readTodos();
  const startIndex = (currentPage - 1) * currentLimit;
  const endIndex = currentPage * currentLimit;
  const paginatedTodos = allTodos.slice(startIndex, endIndex);
  const totalPages = Math.ceil(allTodos.length / currentLimit);
  return {
    totalTodos: allTodos.length,
    todos: paginatedTodos,
    pages: totalPages,
  };
}

async function createByContent(content: string): Promise<Todo> {
  const newTodo = createTodo(content);
  return newTodo;
}

async function deleteById(id: string) {
  const todos = readTodos();

  const todo = todos.find((todo) => todo.id === id);

  if (!todo) {
    throw new HttpNotFoundError(`TODO with id ${id} not found`);
  }

  updateTodo(todo.id, {
    deleted: true,
  });

  return;
}

async function toggleDone(id: string): Promise<Todo> {
  const todos = readTodos();

  const todo = todos.find((todo) => todo.id === id);

  if (!todo) {
    throw new HttpNotFoundError(`TODO with id ${id} not found`);
  }

  const todoById = updateTodo(todo.id, {
    done: !todo.done,
  });

  return todoById;
}

export const todoRepository = {
  get,
  createByContent,
  deleteById,
  toggleDone,
};
