export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'ADMIN';
  avatar?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  order: number;
  _count?: {
    products: number;
  };
}

export interface ConsignmentMaker {
  id: string;
  name: string;
  phone: string;
  address?: string;
  bio?: string;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "1 Liter", "1 Kilogram (Kg)", "Karung 5 Kg"
  unit: string; // "liter", "kg", "karung", etc.
  price: number;
  discountPrice?: number | null;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  soldCount: number;
  rating: number;
  reviewCount: number;
  image: string;
  galleryImages?: string | null;
  unit: string;
  variants?: string | ProductVariant[] | null;
  isActive: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isConsignment: boolean;
  consignmentMakerId?: string | null;
  categoryId: string;
  category?: Category;
  consignmentMaker?: ConsignmentMaker | null;
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string | null;
  variantName?: string | null;
  price: number;
  quantity: number;
  subtotal: number;
  product?: Product;
}

export interface Payment {
  id: string;
  orderId: string;
  transactionId: string;
  method: 'QRIS' | 'BCA_VA' | 'BRI_VA' | 'BNI_VA' | 'BSI_VA' | 'CASH' | 'GOPAY' | 'SHOPEEPAY';
  amount: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
  qrisString?: string | null;
  qrisImageUrl?: string | null;
  vaNumber?: string | null;
  bankName?: string | null;
  paymentUrl?: string | null;
  expiredAt: string;
  paidAt?: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  deliveryType: 'PICKUP' | 'DELIVERY';
  deliveryAddress?: string | null;
  deliveryFee: number;
  notes?: string | null;
  couponCode?: string | null;
  discountAmount: number;
  subtotal: number;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'REFUNDED';
  orderStatus: 'PENDING' | 'PROCESSING' | 'READY' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payments?: Payment[];
}
