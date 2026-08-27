import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingCart,
  Star,
  Package,
  Minus,
  Plus,
  ArrowLeft,
  Handshake,
  ShieldCheck,
  Store,
  Check,
  MessageCircle,
  Sparkles,
  Send,
} from 'lucide-react';
import { api } from '../services/api';
import { Product } from '../types';
import { formatRupiah, formatDate } from '../utils/format';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ProductCard from '../components/product/ProductCard';
import { PageSkeleton } from '../components/common/Skeletons';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState<(Product & { relatedProducts?: Product[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  // Review Form States
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState(user?.name || '');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      showToast('Silakan tulis komentar atau ulasan Anda.', 'error');
      return;
    }
    if (!product) return;

    setSubmittingReview(true);
    try {
      await api.post(`/products/${product.id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
        userName: reviewName.trim() || user?.name || undefined,
      });
      showToast('Ulasan Anda berhasil dikirim! Terima kasih ✨', 'success');
      setReviewComment('');
      setShowReviewForm(false);
      // Reload product data to update reviews and rating
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal mengirim ulasan.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        const data = res.data.data;
        setProduct(data);
      } catch {
        navigate('/produk');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetch();
  }, [id, navigate]);

  if (loading) return <PageSkeleton />;
  if (!product) return null;

  let extraVariants: any[] = [];
  if (product.variants) {
    try {
      extraVariants = typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants;
    } catch {
      extraVariants = [];
    }
  }

  // Combined options: Default Base Unit + Extra Choices
  const allOptions = extraVariants.length > 0 ? [
    {
      id: 'base',
      name: `per ${product.unit}`,
      unit: product.unit,
      price: product.price,
      discountPrice: product.discountPrice,
      stock: product.stock,
    },
    ...extraVariants,
  ] : [];

  const currentOption = selectedVariant || (allOptions.length > 0 ? allOptions[0] : null);
  const currentStock = currentOption ? currentOption.stock : product.stock;
  const currentUnit = currentOption ? currentOption.unit : product.unit;
  const isUnlimited = currentStock >= 999;
  const isOutOfStock = currentStock === 0;
  const originalPrice = currentOption ? currentOption.price : product.price;
  const displayPrice = currentOption
    ? (currentOption.discountPrice ?? currentOption.price)
    : (product.discountPrice ?? product.price);
  const hasDiscount = currentOption
    ? (currentOption.discountPrice && currentOption.discountPrice < currentOption.price)
    : (product.discountPrice && product.discountPrice < product.price);

  const handleAddToCart = () => {
    if (isOutOfStock || justAdded) return;
    const variantToPass = currentOption?.id === 'base' ? null : currentOption;
    addToCart(product, quantity, variantToPass);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const variantToPass = currentOption?.id === 'base' ? null : currentOption;
    addToCart(product, quantity, variantToPass);
    navigate('/keranjang');
  };

  return (
    <div className="min-h-screen bg-cream-50 pb-24 lg:pb-16 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-stone-200/80 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1 text-warung-800 hover:text-warung-900 font-bold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>
            <span className="text-stone-300">/</span>
            <Link to="/produk" className="hover:text-stone-800 transition-colors">
              Katalog
            </Link>
            <span className="text-stone-300">/</span>
            <span className="text-stone-800 font-bold truncate max-w-[200px] sm:max-w-xs">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Product Image */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-stone-200/80 shadow-card">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80';
                }}
              />

              {isOutOfStock && (
                <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="bg-white text-stone-800 text-sm font-bold px-4 py-2 rounded-full shadow-md">
                    Stok Sedang Habis
                  </span>
                </div>
              )}

              {product.isBestSeller && (
                <div className="absolute top-4 left-4">
                  <span className="bg-amber-500 text-stone-900 text-xs font-extrabold px-3 py-1 rounded-lg shadow-sm">
                    🔥 Produk Terlaris
                  </span>
                </div>
              )}
            </div>

            {/* Value Badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 p-3 bg-white rounded-2xl border border-stone-200/70 text-xs text-stone-600">
                <ShieldCheck className="w-4 h-4 text-warung-600 flex-shrink-0" />
                <span>Higienis & Bahan Pilihan</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 bg-white rounded-2xl border border-stone-200/70 text-xs text-stone-600">
                <Store className="w-4 h-4 text-warung-600 flex-shrink-0" />
                <span>Siap Diambil Langsung di Warung</span>
              </div>
            </div>
          </div>

          {/* Right: Product Details & Purchase Form */}
          <div className="lg:col-span-6 space-y-6">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2.5">
                <span className="text-[11px] font-bold text-warung-800 bg-warung-50 px-2.5 py-1 rounded-md border border-warung-200/60 uppercase tracking-wider">
                  {product.category?.name || 'Katalog Warung'}
                </span>
                {product.isConsignment && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/70">
                    <Handshake className="w-3.5 h-3.5 text-amber-600" />
                    Produk Titipan Mitra
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-snug mb-3">
                {product.name}
              </h1>

              {/* Rating & Sold count */}
              <div className="flex items-center gap-3 text-xs text-stone-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-stone-900">{product.rating.toFixed(1)}</span>
                  <span className="text-stone-400">({product.reviewCount} ulasan)</span>
                </div>
                <span>•</span>
                <span>Terjual {product.soldCount} kali</span>
              </div>
            </div>

            {/* Variant Selector (if multi-unit options exist) */}
            {allOptions.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Pilih Satuan / Ukuran:
                  </span>
                  <span className="text-[11px] text-stone-400">
                    Tersedia {allOptions.length} pilihan satuan
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {allOptions.map((opt: any, idx: number) => {
                    const isSelected = currentOption ? (currentOption.id === opt.id || currentOption.name === opt.name) : idx === 0;
                    return (
                      <button
                        key={opt.id || idx}
                        type="button"
                        onClick={() => {
                          setSelectedVariant(opt);
                          setQuantity(1);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all relative ${
                          isSelected
                            ? 'border-warung-800 bg-warung-50/70 shadow-xs ring-2 ring-warung-700/20'
                            : 'border-stone-200 bg-stone-50/60 hover:bg-stone-50 hover:border-stone-300'
                        }`}
                      >
                        <div className="font-extrabold text-stone-900 text-xs sm:text-sm line-clamp-1 capitalize">
                          {opt.name}
                        </div>
                        <div className="text-xs font-black text-warung-900 mt-1">
                          {formatRupiah(opt.discountPrice ?? opt.price)}
                        </div>
                        {isSelected && (
                          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-warung-800" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price Box */}
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-stone-200/80 shadow-subtle flex flex-col gap-1">
              <span className="text-xs font-semibold text-stone-400">
                {currentOption ? `Harga ${currentOption.name}` : `Harga per ${product.unit}`}
              </span>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-extrabold text-warung-900">
                  {formatRupiah(displayPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-stone-400 line-through">
                    {formatRupiah(originalPrice)}
                  </span>
                )}
                {hasDiscount && (
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                    Diskon {Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-2">
                <Package className="w-3.5 h-3.5 text-stone-400" />
                {isOutOfStock ? (
                  <span className="text-rose-600 font-bold">Stok varian ini sedang habis</span>
                ) : isUnlimited ? (
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    ✓ Stok Selalu Tersedia (Ready Stock)
                  </span>
                ) : (
                  <span>
                    Stok tersisa: <strong className="text-stone-800">{currentStock} {currentUnit}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Deskripsi Produk
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed whitespace-pre-line bg-white p-4 rounded-2xl border border-stone-200/80">
                {product.description}
              </p>
            </div>

            {/* Mitra Details if Consignment */}
            {product.isConsignment && product.consignmentMaker && (
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <Handshake className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-bold text-amber-900">Diproduksi Oleh Mitra:</span>
                </div>
                <div className="text-sm font-bold text-stone-900">{product.consignmentMaker.name}</div>
                {product.consignmentMaker.bio && (
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">{product.consignmentMaker.bio}</p>
                )}
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            {!isOutOfStock && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-stone-700">Atur Jumlah:</span>
                  <div className="flex items-center bg-white border border-stone-200 rounded-xl p-1 shadow-2xs">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Kurang satu"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-extrabold text-stone-900 text-sm">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Tambah satu"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-xs text-stone-500 font-medium">
                    Total: <strong className="text-warung-900">{formatRupiah(displayPrice * quantity)}</strong>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={justAdded}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 shadow-sm active:scale-95 ${
                      justAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-warung-800 hover:bg-warung-900 text-white'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Ditambahkan ke Keranjang</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Tambah ke Keranjang</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-900 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95"
                  >
                    Beli Sekarang
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 pt-10 border-t border-stone-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold text-stone-900">
                  Ulasan & Testimoni Pembeli
                </h2>
                <span className="text-xs font-bold text-warung-800 bg-warung-50 px-2.5 py-1 rounded-full border border-warung-200">
                  {product.reviewCount} Ulasan
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Rata-rata kepuasan: <strong className="text-amber-500 font-extrabold">{product.rating.toFixed(1)} ★</strong> dari pembeli Warung Lenira.
              </p>
            </div>

            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-warung-800 hover:bg-warung-900 text-white text-xs font-bold rounded-2xl transition-all shadow-sm active:scale-95 flex-shrink-0"
            >
              <MessageCircle className="w-4 h-4 text-amber-400" />
              <span>{showReviewForm ? 'Tutup Formulir' : '+ Tulis Ulasan / Komentar'}</span>
            </button>
          </div>

          {/* Review Submission Form */}
          {showReviewForm && (
            <form
              onSubmit={handleSubmitReview}
              className="mb-8 bg-white rounded-3xl p-6 sm:p-7 border border-amber-300 shadow-card space-y-4 animate-fade-in"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Bagikan Pengalaman Anda tentang Produk Ini
                </h3>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="text-stone-400 hover:text-stone-600 text-xs font-bold"
                >
                  Batal
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                  Beri Bintang Rating:
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`text-2xl transition-transform hover:scale-125 ${
                        star <= reviewRating ? 'text-amber-400' : 'text-stone-200'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-600 ml-2">
                    {reviewRating === 5 && 'Sangat Puas! (5 Bintang)'}
                    {reviewRating === 4 && 'Puas (4 Bintang)'}
                    {reviewRating === 3 && 'Cukup (3 Bintang)'}
                    {reviewRating === 2 && 'Kurang Puas (2 Bintang)'}
                    {reviewRating === 1 && 'Kecewa (1 Bintang)'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                  Nama Anda <span className="text-stone-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="misal: Ibu Rina / Warga Ciomas"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-warung-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                  Ulasan / Komentar <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Ceritakan rasa, kualitas kemasan, atau kepuasan Anda belanja produk ini..."
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-warung-500 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs sm:text-sm font-extrabold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-60 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{submittingReview ? 'Mengirim...' : 'Kirim Ulasan'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Review List */}
          {product.reviews && product.reviews.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-subtle flex flex-col justify-between hover:border-stone-300 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-warung-100 text-warung-800 font-black rounded-xl flex items-center justify-center text-xs shadow-2xs">
                          {review.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-stone-900 block">{review.userName}</span>
                          <span className="text-[10px] text-stone-400">{formatDate(review.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400 text-sm">
                        {Array(review.rating).fill(null).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed bg-cream-50/70 p-3 rounded-2xl border border-stone-100/80">
                      "{review.comment}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 text-center border border-stone-200/80">
              <span className="text-3xl block mb-2">⭐</span>
              <p className="text-sm font-extrabold text-stone-900 mb-1">Belum ada ulasan untuk produk ini</p>
              <p className="text-xs text-stone-500 max-w-md mx-auto mb-4">
                Pernah membeli produk ini di Warung Lenira? Jadilah yang pertama memberikan penilaian dan komentar!
              </p>
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-5 py-2.5 bg-warung-800 hover:bg-warung-900 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                + Tulis Ulasan Pertama
              </button>
            </div>
          )}
        </div>

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-stone-200/80">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-extrabold text-stone-900">Jajanan Pilihan Lainnya</h2>
              <Link to="/produk" className="text-xs font-bold text-warung-800 hover:underline">
                Lihat Semua
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {product.relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar for Mobile Devices */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-3 z-30 shadow-floating flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] text-stone-400 font-semibold uppercase">Total Harga</span>
          <span className="font-extrabold text-warung-900 text-base leading-none">
            {formatRupiah(displayPrice * quantity)}
          </span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || justAdded}
            className={`p-3 rounded-xl transition-all shadow-sm active:scale-95 ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : isOutOfStock
                ? 'bg-stone-100 text-stone-300'
                : 'bg-warung-800 text-white'
            }`}
            aria-label="Keranjang"
          >
            {justAdded ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
          </button>
          {!isOutOfStock && (
            <button
              onClick={handleBuyNow}
              className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-stone-900 text-xs font-extrabold rounded-xl transition-all shadow-sm active:scale-95"
            >
              Beli Sekarang
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
