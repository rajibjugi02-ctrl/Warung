import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { PaymentService } from '../services/payment.service';

const createOrderSchema = z.object({
  customerName: z.string().min(1, 'Nama pemesan wajib diisi'),
  customerPhone: z.string().min(6, 'Nomor WhatsApp wajib diisi'),
  customerEmail: z.string().optional().nullable(),
  deliveryType: z.enum(['PICKUP', 'DELIVERY']).default('PICKUP'),
  deliveryAddress: z.string().optional().nullable(),
  deliveryFee: z.number().default(0),
  notes: z.string().optional().nullable(),
  couponCode: z.string().optional().nullable(),
  paymentMethod: z.string().default('QRIS'),
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string().optional().nullable(),
        variantName: z.string().optional().nullable(),
        price: z.number().optional().nullable(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, 'Keranjang belanja tidak boleh kosong'),
});

export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validated = createOrderSchema.parse(req.body);

    // Fetch products to verify price and stock
    const productIds = validated.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length !== productIds.length) {
      return sendError(
        res,
        'Beberapa produk di keranjang Anda merupakan data sebelum migrasi database. Silakan klik ikon keranjang, hapus barang lama, dan pilih kembali produk dari katalog.',
        null,
        400
      );
    }

    // Check stock
    for (const item of validated.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;
      if (product.stock < item.quantity) {
        return sendError(
          res,
          `Stok produk "${product.name}" tidak mencukupi (sisa: ${product.stock}).`,
          null,
          400
        );
      }
    }

    // Calculate subtotal
    let subtotal = 0;
    const orderItemsData = validated.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const price = Number(item.price ?? (product.discountPrice ?? product.price));
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;

      return {
        productId: product.id,
        productName: item.variantName ? `${product.name} (${item.variantName})` : product.name,
        productImage: product.image,
        variantName: item.variantName || null,
        price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      };
    });

    // Calculate coupon discount
    let discountAmount = 0;
    if (validated.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: validated.couponCode.toUpperCase().trim() },
      });
      if (coupon && coupon.isActive && (!coupon.expiresAt || new Date() <= coupon.expiresAt)) {
        if (subtotal >= coupon.minOrder) {
          if (coupon.discountType === 'PERCENT') {
            discountAmount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
              discountAmount = coupon.maxDiscount;
            }
          } else {
            discountAmount = coupon.discountValue;
          }
        }
      }
    }

    const deliveryFee = validated.deliveryType === 'DELIVERY' ? Number(validated.deliveryFee || 5000) : 0;
    const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);

    // Generate Order Number: LEN-YYYYMMDD-XXXX
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `LEN-${todayStr}-${randomSuffix}`;

    // Create Order in DB
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: req.user?.userId || null,
        customerName: validated.customerName,
        customerPhone: validated.customerPhone,
        customerEmail: validated.customerEmail || null,
        deliveryType: validated.deliveryType,
        deliveryAddress: validated.deliveryAddress || null,
        deliveryFee,
        notes: validated.notes || null,
        couponCode: validated.couponCode || null,
        discountAmount,
        subtotal,
        totalAmount,
        paymentStatus: 'PENDING',
        orderStatus: 'PENDING',
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    // Create Payment transaction via PaymentService
    const payment = await PaymentService.createPayment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: totalAmount,
      customerName: validated.customerName,
      customerPhone: validated.customerPhone,
      customerEmail: validated.customerEmail || undefined,
      method: (validated.paymentMethod as any) || 'QRIS',
    });

    return sendSuccess(
      res,
      'Pesanan berhasil dibuat. Silakan selesaikan pembayaran.',
      {
        order,
        payment,
      },
      201
    );
  } catch (error: any) {
    console.error('❌ Error creating order:', error);
    if (error instanceof z.ZodError) {
      return sendError(res, error.errors[0].message, error.errors, 400);
    }
    return sendError(res, 'Gagal membuat pesanan.', error.message, 500);
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      return sendError(res, 'Pesanan tidak ditemukan.', null, 404);
    }

    return sendSuccess(res, 'Data pesanan berhasil dimuat.', order);
  } catch (error: any) {
    return sendError(res, 'Gagal memuat pesanan.', error.message, 500);
  }
};

export const getUserOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', null, 401);
    }

    const orders = await prisma.order.findMany({
      where: { userId: req.user.userId },
      include: {
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, 'Riwayat pesanan berhasil dimuat.', orders);
  } catch (error: any) {
    return sendError(res, 'Gagal memuat riwayat pesanan.', error.message, 500);
  }
};
