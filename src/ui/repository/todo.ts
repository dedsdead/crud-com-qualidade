import { z as schema } from 'zod';
import { Todo, TodoSchema } from '@ui/schema/todo';

interface TodoRepositoryGetParams {
    page: number;
    limit: number;
}

interface TodoRepositoryGetOutput {
    todos: Todo[];
    totalTodos: number;
    pages: number;
}

function get({
    page,
    limit,
}: TodoRepositoryGetParams): Promise<TodoRepositoryGetOutput> {
    return fetch(
        `http://localhost:3000/api/todos?page=${page}&limit=${limit}`
    ).then(async (resp) => {
        const todosText = await resp.text();
        const responseParsed = parseTodosServer(JSON.parse(todosText));
        return {
            totalTodos: responseParsed.total,
            todos: responseParsed.todos,
            pages: responseParsed.pages,
        };
    });
}

function parseTodosServer(responseBody: unknown): {
    total: number;
    pages: number;
    todos: Array<Todo>;
} {
    if (
        responseBody !== null &&
        typeof responseBody === 'object' &&
        'todos' in responseBody &&
        'total' in responseBody &&
        'pages' in responseBody &&
        Array.isArray(responseBody.todos)
    ) {
        return {
            total: Number(responseBody.total),
            pages: Number(responseBody.pages),
            todos: responseBody.todos.map((todo: unknown) => {
                if (todo === null && typeof todo !== 'object') {
                    throw new Error('Invalid todo from API');
                }
                const { id, content, date, done } = todo as {
                    id: string;
                    content: string;
                    date: string;
                    done: string;
                };
                return {
                    id,
                    content,
                    date: date,
                    done: String(done).toLowerCase() === 'true',
                };
            }),
        };
    }

    return {
        pages: 1,
        total: 0,
        todos: [],
    };
}

async function create(content: string): Promise<Todo> {
    return fetch('http://localhost:3000/api/todos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content,
        }),
    }).then(async (resp) => {
        const todoResponse = await resp.json();
        const todoSchema = schema.object({
            todo: TodoSchema,
        });
        const todoParsed = todoSchema.safeParse(todoResponse);
        if (!todoParsed.success) {
            throw new Error('Invalid todo from API');
        }

        return todoParsed.data.todo;
    });
}

async function toggleDone(todoId: string): Promise<Todo> {
    return fetch(`http://localhost:3000/api/todos/${todoId}/toggle-done`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(async (resp) => {
        const todoResponse = await resp.json();
        const todoSchema = schema.object({
            todo: TodoSchema,
        });
        const todoParsed = todoSchema.safeParse(todoResponse);
        if (!todoParsed.success) {
            throw new Error('Invalid todo from API');
        }
        return todoParsed.data.todo;
    });
}

async function deleteById(todoId: string) {
    return fetch(`http://localhost:3000/api/todos/${todoId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export const todoRepository = {
    get,
    create,
    toggleDone,
    deleteById,
};
