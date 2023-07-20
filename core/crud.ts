import fs from "fs"; //ES6

const DB_FILEPATH = "./db";

interface Todo {
    content: string;
    date: string;
    done: boolean;
}

const todos: Array<Todo> = [];

console.log("[CRUD]");

function createTODO(content: string) {
    const todo: Todo = {
        content: content,
        date: new Date().toISOString(),
        done: false,
    };

    todos.push(todo);

    fs.writeFileSync(DB_FILEPATH, JSON.stringify({
        todos,
    }, null, 2));

    return todo;
}

function readTODO(): Array<Todo> {
    const dbString = fs.readFileSync(DB_FILEPATH, "utf-8");
    const db = JSON.parse(dbString || "{}");
    if (!db.todos) {
        return [];
    }
    return db.todos;
}

// [SIMULATION]
createTODO("Primeira TODO");
createTODO("Segunda TODO");
console.log(readTODO());