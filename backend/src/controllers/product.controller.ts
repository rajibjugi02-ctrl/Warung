import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      isConsignment,
      isBestSeller,
      isNewArrival,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 12));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    if (category) {
      where.category = {
        slug: String(category),
      };
    }

    if (isConsignment === 'true') {
      where.isConsignment = true;
    }

    if (isBestSeller === 'true') {
      where.isBestSeller = true;
    }

    if (isNewArrival === 'true') {
      where.isNewArrival = true;
    }

    let orderBy: any = {};
    if (sortBy === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sortBy === 'popularity' || sortBy === 'sold') {
      orderBy = { soldCount: 'desc' };
    } else if (sortBy === 'rating') {
      orderBy = { rating: 'desc' };
    } else {
      orderBy = { createdAt: sortOrder === 'asc' ? 'asc' : 'desc' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          consignmentMaker: true,
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    return sendSuccess(res, 'Daftar produk berhasil dimuat.', {
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    return sendError(res, 'Gagal memuat produk.', error.message, 500);
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
        consignmentMaker: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      return sendError(res, 'Produk tidak ditemukan.', null, 404);
    }

    // Fetch related products from same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
      take: 4,
      include: {
        category: true,
      },
    });

    return sendSuccess(res, 'Detail produk berhasil dimuat.', {
      ...product,
      relatedProducts,
    });
  } catch (error: any) {
    return sendError(res, 'Gagal memuat detail produk.', error.message, 500);
  }
};

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    return sendSuccess(res, 'Daftar kategori berhasil dimuat.', categories);
  } catch (error: any) {
    return sendError(res, 'Gagal memuat kategori.', error.message, 500);
  }
};

export const addProductReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment, userName } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return sendError(res, 'Rating harus antara 1 dan 5 bintang.', null, 400);
    }

    if (!comment || comment.trim().length === 0) {
      return sendError(res, 'Ulasan komentar wajib diisi.', null, 400);
    }

    const nameToUse = req.user?.name || userName || 'Pelanggan Lenira';

    let validUserId: string | null = null;
    if (req.user?.userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { id: true },
      });
      if (userExists) {
        validUserId = userExists.id;
      }
    }

    const review = await prisma.review.create({
      data: {
        productId: id,
        userId: validUserId,
        userName: nameToUse,
        rating: Number(rating),
        comment,
      },
    });

    // Update product average rating
    const allReviews = await prisma.review.findMany({
      where: { productId: id },
      select: { rating: true },
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id },
      data: {
        rating: Number(avgRating.toFixed(1)),
        reviewCount: allReviews.length,
      },
    });

    return sendSuccess(res, 'Ulasan berhasil ditambahkan. Terima kasih atas feedback Anda!', review, 201);
  } catch (error: any) {
    return sendError(res, 'Gagal menambahkan ulasan.', error.message, 500);
  }
};
