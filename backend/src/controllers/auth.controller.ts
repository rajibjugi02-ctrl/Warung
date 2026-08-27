import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { signToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().min(8, 'Nomor WhatsApp minimal 8 digit'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  address: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const register = async (req: Request, res: Response) => {
  try {
    const validated = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return sendError(res, 'Email sudah terdaftar. Silakan gunakan email lain atau login.', null, 400);
    }

    const passwordHash = await bcrypt.hash(validated.password, 10);

    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        passwordHash,
        role: 'CUSTOMER',
        addresses: validated.address
          ? {
              create: {
                recipientName: validated.name,
                phone: validated.phone,
                street: validated.address,
                isPrimary: true,
              },
            }
          : undefined,
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return sendSuccess(
      res,
      'Pendaftaran akun berhasil!',
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
      201
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return sendError(res, error.errors[0].message, error.errors, 400);
    }
    return sendError(res, 'Terjadi kesalahan saat mendaftar akun.', error.message, 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validated = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (!user) {
      return sendError(res, 'Email atau password salah.', null, 401);
    }

    const isMatch = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Email atau password salah.', null, 401);
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return sendSuccess(res, 'Login berhasil. Selamat datang kembali!', {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return sendError(res, error.errors[0].message, error.errors, 400);
    }
    return sendError(res, 'Terjadi kesalahan saat login.', error.message, 500);
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', null, 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        addresses: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            items: true,
            payments: true,
          },
        },
      },
    });

    if (!user) {
      return sendError(res, 'Pengguna tidak ditemukan.', null, 404);
    }

    const { passwordHash, ...safeUser } = user;
    return sendSuccess(res, 'Profil berhasil dimuat.', safeUser);
  } catch (error: any) {
    return sendError(res, 'Gagal memuat profil pengguna.', error.message, 500);
  }
};
