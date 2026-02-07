import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import bcrypt from 'bcryptjs';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = registerSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword },
        });

        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const tokens = generateTokens(user);
        res.json(tokens);
    } catch (error) {
        next(error);
    }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ message: 'Refresh Token Required' });

        const payload = verifyRefreshToken(refreshToken) as { userId: string };
        const user = await prisma.user.findUnique({ where: { id: payload.userId } });

        if (!user) return res.status(403).json({ message: 'User not found' });

        const tokens = generateTokens(user);
        res.json(tokens);
    } catch (error) {
        return res.status(403).json({ message: 'Invalid Refresh Token' });
    }
};

export const logout = (req: Request, res: Response) => {
    // Stateless JWT: Logic would normally involve invalidating token in Redis or DB if mandated.
    // For basic JWT, client simply discards the token.
    res.json({ message: 'Logged out successfully' });
};
