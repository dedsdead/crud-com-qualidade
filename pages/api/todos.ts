import { todoController } from "@server/controller/todo";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        todoController.get(req, res);
        return;
    }

    if (req.method === "POST") {
        todoController.create(req, res);
        return;
    }

    res.status(405).json({
        error: {
            message: "Method not allowed",
        },
    });
}
