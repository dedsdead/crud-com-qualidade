import { todoRepository } from '@ui/repository/todo';
import { z as schema } from 'zod';

interface TodoControllerGetParams {
    page: number;
}

interface TodoControllerCreateParams {
    content?: string;
    onError: (customMessage?: string) => void;
    onSuccess: () => void;
}

interface TodoControllerToggleDoneParams {
    id?: string;
    updateTodosOnScreen: () => void;
}

async function get(params: TodoControllerGetParams) {
    return todoRepository.get({
        page: params.page,
        limit: 2,
    });
}

async function create({
    content,
    onError,
    onSuccess,
}: TodoControllerCreateParams) {
    const parsedParams = schema.string().nonempty().safeParse(content);
    if (!parsedParams.success) {
        onError();
        return;
    }
    todoRepository
        .create(parsedParams.data)
        .then(() => {
            onSuccess();
        })
        .catch(() => {
            onError();
        });
}

function toggleDone({
    id,
    updateTodosOnScreen,
}: TodoControllerToggleDoneParams) {
    const parsedParams = schema.string().nonempty().safeParse(id);
    if (!parsedParams.success) {
        throw new Error('Invalid ID');
    }
    todoRepository
        .toggleDone(parsedParams.data)
        .then(() => {
            updateTodosOnScreen();
        })
        .catch((error) => {
            throw new Error(error);
        });
}

function deleteById(id: string) {
    const parsedParams = schema.string().nonempty().safeParse(id);
    if (!parsedParams.success) {
        throw new Error('Invalid ID');
    }
    todoRepository.deleteById(parsedParams.data);
}

function filterTodosByContent<Todo>(
    search: string,
    todos: Array<Todo & { content: string }>
): Array<Todo> {
    const filteredTodos = todos.filter((todo) => {
        return todo.content.toLowerCase().includes(search);
    });

    return filteredTodos;
}

export const todoController = {
    get,
    create,
    toggleDone,
    deleteById,
    filterTodosByContent,
};
