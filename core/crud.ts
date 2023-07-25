/* eslint-disable no-console */
import fs from "fs"; //ES6
import { v4 as uuid } from "uuid";

const DB_FILEPATH = "./core/db";

type UUID = string;

let todos: Array<Todo> = [];

interface Todo {
    id: UUID;
    content: string;
    date: string;
    done: boolean;
    deleted: boolean;
}

function writeTodos() {
    fs.writeFileSync(
        DB_FILEPATH,
        JSON.stringify(
            {
                todos,
            },
            null,
            2
        )
    );
}

export function createTodo(content: string): Todo {
    readTodos();

    const todo: Todo = {
        id: uuid(),
        content: content,
        date: new Date().toISOString(),
        done: false,
        deleted: false,
    };
    Object.defineProperty(todo, "id", {
        writable: false,
    });

    todos.unshift(todo);
    writeTodos();
    return todo;
}

export function readTodos(): Array<Todo> {
    const dbString = fs.readFileSync(DB_FILEPATH, "utf-8");
    const db = JSON.parse(dbString || "{}");
    if (!db.todos) {
        return [];
    }
    todos = db.todos as Array<Todo>;
    return todos.filter((todo) => todo.deleted === false);
}

export function updateTodo(id: UUID, partialTodo: Partial<Todo>): Todo {
    readTodos();
    let modifiedTodo;

    todos.forEach((currentTodo) => {
        const isToUpdate = currentTodo.id === id;
        if (isToUpdate) {
            modifiedTodo = Object.assign(currentTodo, partialTodo);
        }
    });

    if (!modifiedTodo) {
        throw new Error("Invalid ID entry!");
    }

    writeTodos();

    return modifiedTodo;
}

export function updateContentById(id: UUID, content: string): Todo {
    return updateTodo(id, {
        content,
    });
}
