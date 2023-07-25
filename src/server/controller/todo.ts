import { HttpNotFoundError } from "@server/infra/errors";
import { todoRepository } from "@server/repository/todo";
import { NextApiRequest, NextApiResponse } from "next";
import { z as schema } from "zod";

const createTodoBodySchema = schema.object({
    content: schema.string(),
});

const todoByIdQuerySchema = schema.object({
    id: schema.string().uuid().nonempty(),
});

async function get(req: NextApiRequest, res: NextApiResponse) {
    const query = req.query;

    const page = Number(query.page);
    const limit = Number(query.limit);

    if (query.page && isNaN(page)) {
        res.status(400).json({
            error: { message: "Page must be a numer" },
        });
        return;
    }

    if (query.limit && isNaN(limit)) {
        res.status(400).json({
            error: { message: "Limit must be a numer" },
        });
        return;
    }

    const serverOutput = todoRepository.get({
        page,
        limit,
    });
    res.status(200).json({
        total: serverOutput.totalTodos,
        pages: serverOutput.pages,
        todos: serverOutput.todos,
    });
}

async function create(req: NextApiRequest, res: NextApiResponse) {
    const body = createTodoBodySchema.safeParse(req.body);
    if (!body.success) {
        res.status(400).json({
            error: {
                message: "You need to provide a valid content",
                description: body.error.issues,
            },
        });
        return;
    }
    const newTodo = await todoRepository.createByContent(body.data.content);

    res.status(201).json({
        todo: newTodo,
    });
}

async function deleteById(req: NextApiRequest, res: NextApiResponse) {
    const query = todoByIdQuerySchema.safeParse(req.query);
    if (!query.success) {
        return res.status(400).json({
            error: {
                message: "You must provide a valid ID",
                description: query.error.issues,
            },
        });
    }
    try {
        await todoRepository.deleteById(query.data.id);
        res.status(204).end();
    } catch (error) {
        if (error instanceof HttpNotFoundError) {
            return res.status(error.status).json({
                error: {
                    message: error.message,
                },
            });
        }

        res.status(500).json({
            error: {
                message: "Internal server error",
            },
        });
    }
}

async function toggleDone(req: NextApiRequest, res: NextApiResponse) {
    const query = todoByIdQuerySchema.safeParse(req.query);
    if (!query.success) {
        return res.status(400).json({
            error: {
                message: "You must provide a valid ID",
                description: query.error.issues,
            },
        });
    }
    const todoId = query.data.id;
    try {
        const updatedTodo = await todoRepository.toggleDone(todoId);
        res.status(200).json({
            todo: updatedTodo,
        });
    } catch (error) {
        if (error instanceof HttpNotFoundError) {
            return res.status(error.status).json({
                error: {
                    message: error.message,
                },
            });
        }

        res.status(500).json({
            error: {
                message: "Internal server error",
            },
        });
    }
}

export const todoController = {
    get,
    create,
    deleteById,
    toggleDone,
};
