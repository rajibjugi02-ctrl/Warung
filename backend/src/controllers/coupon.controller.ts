import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return sendError(res, 'Kode kupon wajib diisi.', null, 400);
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: String(code).toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      return sendError(res, 'Kupon diskon tidak valid atau sudah tidak aktif.', null, 404);
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return sendError(res, 'Masa berlaku kupon diskon telah habis.', null, 400);
    }

    const currentSubtotal = Number(subtotal) || 0;
    if (currentSubtotal < coupon.minOrder) {
      return sendError(
        res,
        `Minimal belanja untuk menggunakan kupon ini adalah Rp ${coupon.minOrder.toLocaleString('id-ID')}`,
        null,
        400
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENT') {
      discountAmount = (currentSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    return sendSuccess(res, 'Kupon berhasil digunakan!', {
      code: coupon.code,
      description: coupon.description,
      discountAmount,
    });
  } catch (error: any) {
    return sendError(res, 'Gagal memvalidasi kupon.', error.message, 500);
  }
};
