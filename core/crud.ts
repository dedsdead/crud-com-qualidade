import fs from "fs"; //ES6
import { v4 as uuid } from 'uuid';

const DB_FILEPATH = "./core/db";

type UUID = string;

interface Todo {
    id: UUID;
    content: string;
    date: string;
    done: boolean;
    deleted: boolean;
} 

const todos: Array<Todo> = [];

console.log("[CRUD]");

function writeTodos() {
    fs.writeFileSync(DB_FILEPATH, JSON.stringify({
        todos,
    }, null, 2));
}

function createTodo(content: string): Todo {
    const todo: Todo = {
        id: uuid(),
        content: content,
        date: new Date().toISOString(),
        done: false,
        deleted: false,
    };

    Object.defineProperty(todo, "id", {
        writable: false
    })

    todos.push(todo);

    writeTodos();

    return todo;
}

function readTodos(): Array<Todo> {
    const dbString = fs.readFileSync(DB_FILEPATH, "utf-8");

    let todos: Array<Todo>;

    const db = JSON.parse(dbString || "{}");

    if (!db.todos) {
        return [];
    }

    todos = db.todos;
    
    return todos.filter(todo => todo.deleted === false);

}

function updateTodo(id:UUID, partialTodo: Partial<Todo>): Todo {
    let modifiedTodo;

    todos.forEach((currentTodo) => {
        const toUpdate = currentTodo.id === id;
        if (toUpdate) {
            try {
                modifiedTodo = Object.assign(currentTodo, partialTodo);
                writeTodos();
            } catch (error) {
                console.log(error);
            }
        }
    });

    if (!modifiedTodo) {
        throw new Error("Invalid ID entry!");
    }

    return modifiedTodo;
    
}

function updateContentById(id: UUID, content: string): Todo {
    return updateTodo(id, {
        content,
    });
}

function deleteTodoById(id:UUID) {
    updateTodo(id, {
        deleted: true,
    });
}

// [SIMULATION]
const todo = createTodo("Primeira TODO");
const todo2 = createTodo("Segunda TODO");
updateContentById(todo2.id, "Segunda TODO modificada!");
createTodo("Terceira TODO");
deleteTodoById(todo.id);
console.log(readTodos());