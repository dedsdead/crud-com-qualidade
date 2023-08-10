import { todoController } from '@server/controller/todo';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    await todoController.get(req, res);
    return;
  }

  if (req.method === 'POST') {
    await todoController.create(req, res);
    return;
  }

  res.status(405).json({
    error: {
      message: 'Method not allowed',
    },
  });
}
