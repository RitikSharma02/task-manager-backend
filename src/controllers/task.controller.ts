import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { z } from 'zod';

const createTaskSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
});

const updateTaskSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
});

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const { page = '1', limit = '10', status, search } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = { userId };
        if (status) where.status = status;
        if (search) where.title = { contains: search as string }; // SQLite contains is case-sensitive usually, but for simple implementation this works.

        const [tasks, total] = await Promise.all([
            prisma.task.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.task.count({ where }),
        ]);

        res.json({
            data: tasks,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        next(error);
    }
};

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const { title, description } = createTaskSchema.parse(req.body);

        const task = await prisma.task.create({
            data: {
                title,
                description,
                userId,
            },
        });

        res.status(201).json(task);
    } catch (error) {
        next(error);
    }
};

export const getTaskById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;

        const task = await prisma.task.findFirst({
            where: { id, userId },
        });

        if (!task) return res.status(404).json({ message: 'Task not found' });

        res.json(task);
    } catch (error) {
        next(error);
    }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;
        const data = updateTaskSchema.parse(req.body);

        const task = await prisma.task.findFirst({ where: { id, userId } });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const updatedTask = await prisma.task.update({
            where: { id },
            data,
        });

        res.json(updatedTask);
    } catch (error) {
        next(error);
    }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;

        const task = await prisma.task.findFirst({ where: { id, userId } });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        await prisma.task.delete({ where: { id } });

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const toggleTaskStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;

        const task = await prisma.task.findFirst({ where: { id, userId } });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
        const updatedTask = await prisma.task.update({
            where: { id },
            data: { status: newStatus },
        });

        res.json(updatedTask);
    } catch (error) {
        next(error);
    }
};
