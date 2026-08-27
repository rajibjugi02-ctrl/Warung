import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const getConsignments = async (_req: Request, res: Response) => {
  try {
    const consignmentProducts = await prisma.product.findMany({
      where: {
        isConsignment: true,
        isActive: true,
      },
      include: {
        category: true,
        consignmentMaker: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const makers = await prisma.consignmentMaker.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return sendSuccess(res, 'Daftar produk titipan berhasil dimuat.', {
      products: consignmentProducts,
      makers,
    });
  } catch (error: any) {
    return sendError(res, 'Gagal memuat data produk titipan.', error.message, 500);
  }
};

export const getMakers = async (_req: Request, res: Response) => {
  try {
    const makers = await prisma.consignmentMaker.findMany({
      include: {
        products: true,
      },
      orderBy: { name: 'asc' },
    });

    return sendSuccess(res, 'Daftar mitra titipan berhasil dimuat.', makers);
  } catch (error: any) {
    return sendError(res, 'Gagal memuat mitra titipan.', error.message, 500);
  }
};

export const createMaker = async (req: Request, res: Response) => {
  try {
    const { name, phone, address, bio } = req.body;

    if (!name || !phone) {
      return sendError(res, 'Nama dan nomor kontak mitra wajib diisi.', null, 400);
    }

    const maker = await prisma.consignmentMaker.create({
      data: {
        name,
        phone,
        address: address || null,
        bio: bio || null,
      },
    });

    return sendSuccess(res, 'Mitra titipan baru berhasil didaftarkan.', maker, 201);
  } catch (error: any) {
    return sendError(res, 'Gagal mendaftarkan mitra titipan.', error.message, 500);
  }
};

export const updateMaker = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, address, bio, isActive } = req.body;

    const updated = await prisma.consignmentMaker.update({
      where: { id },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        address: address !== undefined ? address : undefined,
        bio: bio !== undefined ? bio : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    return sendSuccess(res, 'Data mitra titipan berhasil diperbarui.', updated);
  } catch (error: any) {
    return sendError(res, 'Gagal memperbarui mitra titipan.', error.message, 500);
  }
};

export const deleteMaker = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.consignmentMaker.delete({
      where: { id },
    });
    return sendSuccess(res, 'Mitra titipan berhasil dihapus.');
  } catch (error: any) {
    return sendError(res, 'Gagal menghapus mitra titipan.', error.message, 500);
  }
};

