import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const getAdminStats = async (_req: Request, res: Response) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalOrdersCount,
      pendingOrdersCount,
      paidOrdersCount,
      todayOrders,
      allPaidOrders,
      topProducts,
      recentOrders,
      categoriesCount,
      productsCount,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { paymentStatus: 'PENDING' } }),
      prisma.order.count({ where: { paymentStatus: 'PAID' } }),
      prisma.order.findMany({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startOfToday },
        },
        select: { totalAmount: true },
      }),
      prisma.order.findMany({
        where: { paymentStatus: 'PAID' },
        select: { totalAmount: true },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: { soldCount: 'desc' },
        take: 5,
        include: { category: true },
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      prisma.category.count(),
      prisma.product.count({ where: { isActive: true } }),
    ]);

    const todaySalesRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalSalesRevenue = allPaidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return sendSuccess(res, 'Statistik admin berhasil dimuat.', {
      todaySalesRevenue,
      totalSalesRevenue,
      totalOrdersCount,
      pendingOrdersCount,
      paidOrdersCount,
      categoriesCount,
      productsCount,
      topProducts,
      recentOrders,
    });
  } catch (error: any) {
    return sendError(res, 'Gagal memuat statistik admin.', error.message, 500);
  }
};

export const getAdminProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        consignmentMaker: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, 'Daftar produk admin berhasil dimuat.', products);
  } catch (error: any) {
    return sendError(res, 'Gagal memuat produk.', error.message, 500);
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      stock,
      image,
      unit = 'kg',
      variants,
      categoryId,
      isActive = true,
      isBestSeller = false,
      isNewArrival = true,
      isConsignment = false,
      consignmentMakerId,
    } = req.body;

    if (!name || !price || !categoryId) {
      return sendError(res, 'Nama produk, harga, dan kategori wajib diisi.', null, 400);
    }

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const variantsJson = Array.isArray(variants)
      ? JSON.stringify(variants)
      : typeof variants === 'string'
      ? variants
      : null;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || '',
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        stock: Number(stock) || 0,
        image: image || 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80',
        unit: unit || 'kg',
        variants: variantsJson,
        categoryId,
        isActive: Boolean(isActive),
        isBestSeller: Boolean(isBestSeller),
        isNewArrival: Boolean(isNewArrival),
        isConsignment: Boolean(isConsignment),
        consignmentMakerId: isConsignment ? consignmentMakerId : null,
      },
      include: {
        category: true,
        consignmentMaker: true,
      },
    });

    return sendSuccess(res, 'Produk baru berhasil ditambahkan.', product, 201);
  } catch (error: any) {
    console.error('Error creating product:', error);
    return sendError(res, 'Gagal menambahkan produk baru.', error.message, 500);
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      discountPrice,
      stock,
      image,
      galleryImages,
      unit,
      variants,
      categoryId,
      isActive,
      isBestSeller,
      isNewArrival,
      isConsignment,
      consignmentMakerId,
    } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (discountPrice !== undefined) updateData.discountPrice = discountPrice ? Number(discountPrice) : null;
    if (stock !== undefined) updateData.stock = Number(stock);
    if (image !== undefined) updateData.image = image;
    if (galleryImages !== undefined) updateData.galleryImages = galleryImages;
    if (unit !== undefined) updateData.unit = unit;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (isBestSeller !== undefined) updateData.isBestSeller = Boolean(isBestSeller);
    if (isNewArrival !== undefined) updateData.isNewArrival = Boolean(isNewArrival);
    if (isConsignment !== undefined) {
      updateData.isConsignment = Boolean(isConsignment);
      updateData.consignmentMakerId = isConsignment ? consignmentMakerId : null;
    }

    if (variants !== undefined) {
      updateData.variants = Array.isArray(variants)
        ? JSON.stringify(variants)
        : typeof variants === 'string'
        ? variants
        : null;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        consignmentMaker: true,
      },
    });

    return sendSuccess(res, 'Data produk berhasil diperbarui.', updated);
  } catch (error: any) {
    console.error('Error updating product:', error);
    return sendError(res, 'Gagal memperbarui produk.', error.message, 500);
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.$transaction(async (tx) => {
      // 1. Delete associated reviews
      await tx.review.deleteMany({
        where: { productId: id },
      });

      // 2. Delete associated order items
      await tx.orderItem.deleteMany({
        where: { productId: id },
      });

      // 3. Delete the product
      await tx.product.delete({
        where: { id },
      });
    });

    return sendSuccess(res, 'Produk berhasil dihapus.');
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return sendError(res, 'Gagal menghapus produk.', error.message, 500);
  }
};

export const getAdminOrders = async (req: Request, res: Response) => {
  try {
    const { status, paymentStatus } = req.query;

    const where: any = {};
    if (status) where.orderStatus = String(status);
    if (paymentStatus) where.paymentStatus = String(paymentStatus);

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: { product: true },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, 'Daftar pesanan admin berhasil dimuat.', orders);
  } catch (error: any) {
    return sendError(res, 'Gagal memuat daftar pesanan.', error.message, 500);
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const updated = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: orderStatus || undefined,
        paymentStatus: paymentStatus || undefined,
      },
      include: {
        items: true,
      },
    });

    return sendSuccess(res, `Status pesanan berhasil diperbarui menjadi ${orderStatus || paymentStatus}.`, updated);
  } catch (error: any) {
    return sendError(res, 'Gagal memperbarui status pesanan.', error.message, 500);
  }
};

export const getSalesReport = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { paymentStatus: 'PAID' },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalItemsSold = orders.reduce(
      (sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0),
      0
    );

    return sendSuccess(res, 'Laporan penjualan berhasil dibuat.', {
      totalRevenue,
      totalOrders: orders.length,
      totalItemsSold,
      orders,
    });
  } catch (error: any) {
    return sendError(res, 'Gagal membuat laporan penjualan.', error.message, 500);
  }
};

export const getAdminReviews = async (_req: Request, res: Response) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            image: true,
            price: true,
            unit: true,
            rating: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 5.0;

    return sendSuccess(res, 'Daftar ulasan pembeli berhasil dimuat.', {
      totalReviews,
      avgRating: Number(avgRating.toFixed(1)),
      reviews,
    });
  } catch (error: any) {
    return sendError(res, 'Gagal memuat ulasan.', error.message, 500);
  }
};

export const deleteAdminReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return sendError(res, 'Ulasan tidak ditemukan.', null, 404);
    }

    const productId = review.productId;
    await prisma.review.delete({ where: { id } });

    // Recalculate product rating
    const remainingReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const newAvgRating = remainingReviews.length > 0
      ? remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length
      : 5.0;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Number(newAvgRating.toFixed(1)),
        reviewCount: remainingReviews.length,
      },
    });

    return sendSuccess(res, 'Ulasan pembeli berhasil dihapus.');
  } catch (error: any) {
    return sendError(res, 'Gagal menghapus ulasan.', error.message, 500);
  }
};

