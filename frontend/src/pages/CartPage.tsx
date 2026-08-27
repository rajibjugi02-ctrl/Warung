import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Minus, Plus, Tag, X, ArrowRight, Store } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { formatRupiah } from '../utils/format';
import { api } from '../services/api';
import { EmptyState } from '../components/common/Skeletons';

const CartPage: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    deliveryFee,
    discountAmount,
    totalAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { showToast } = useToast();
  const [couponInput, setCouponInput] = React.useState('');
  const [couponLoading, setCouponLoading] = React.useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      showToast('Masukkan kode kupon terlebih dahulu.', 'error');
      return;
    }
    setCouponLoading(true);
    try {
      const res = await api.post('/coupons/validate', {
        code: couponInput.trim().toUpperCase(),
        subtotal,
      });
      if (res.data.success) {
        applyCoupon(res.data.data);
        setCouponInput('');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Kupon tidak valid.', 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
        <EmptyState
          title="Keranjang Masih Kosong"
          description="Yuk pesan jajanan enak dan camilan favoritmu di Warung Lenira!"
          icon="🍿"
          action={
            <Link
              to="/produk"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-warung-800 hover:bg-warung-900 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-md active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              Mulai Belanja Sekarang
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 pb-20 lg:pb-12 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">Keranjang Belanja</h1>
          <button
            onClick={clearCart}
            className="text-xs sm:text-sm text-rose-600 hover:text-rose-700 font-bold transition-colors flex items-center gap-1 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Kosongkan Keranjang
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-3">
            {cart.map((item) => {
              const { product, quantity, selectedVariant } = item;
              const itemKey = selectedVariant ? `${product.id}-${selectedVariant.id || selectedVariant.name}` : product.id;
              const displayPrice = selectedVariant
                ? (selectedVariant.discountPrice ?? selectedVariant.price)
                : (product.discountPrice ?? product.price);
              const availableStock = selectedVariant ? selectedVariant.stock : product.stock;

              return (
                <div
                  key={itemKey}
                  className="bg-white rounded-3xl p-4 sm:p-5 shadow-subtle border border-stone-200/80 hover:border-warung-300 transition-all flex gap-4 items-center"
                >
                  {/* Image */}
                  <Link to={`/produk/${product.slug || product.id}`} className="flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border border-stone-100"
                      style={{ width: 76, height: 76 }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=200&auto=format&fit=crop&q=60';
                      }}
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/produk/${product.slug || product.id}`}>
                      <h3 className="font-extrabold text-stone-900 text-xs sm:text-sm leading-snug line-clamp-1 hover:text-warung-800 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="text-[11px] font-medium text-stone-400">{product.category?.name || 'Sembako & Jajanan'}</p>
                      {selectedVariant && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {selectedVariant.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2.5 gap-2 flex-wrap">
                      <div className="font-black text-warung-900 text-sm sm:text-base">
                        {formatRupiah(displayPrice * quantity)}
                        <span className="text-[10px] text-stone-400 font-normal ml-1.5">
                          (@ {formatRupiah(displayPrice)})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(itemKey, quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-xs transition-all text-stone-700 active:scale-90"
                          aria-label="Kurangi jumlah"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-black text-stone-900 text-xs sm:text-sm">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(itemKey, quantity + 1)}
                          disabled={quantity >= availableStock}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-xs transition-all text-stone-700 disabled:opacity-30 active:scale-90"
                          aria-label="Tambah jumlah"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(itemKey)}
                    className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all flex-shrink-0"
                    aria-label="Hapus dari keranjang"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-card border border-stone-200/80 p-6 space-y-5 sticky top-24">
              <h2 className="font-extrabold text-stone-900 text-base">Ringkasan Pesanan</h2>

              {/* Metode Pengambilan */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-3">
                <Store className="w-4 h-4 text-emerald-800 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-extrabold text-emerald-950">Ambil Langsung di Lokasi Warung</div>
                  <p className="text-emerald-800/90 text-[11px] mt-0.5 leading-relaxed">
                    Pesanan disiapkan oleh warung, Anda tinggal datang dan mengambil ke lokasi tanpa antre. (Gratis / Rp 0)
                  </p>
                </div>
              </div>

              {/* Coupon */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-warung-50 border border-warung-200 rounded-2xl px-3.5 py-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-warung-800">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{appliedCoupon.code}</span>
                      <span className="text-emerald-700 font-normal">(-{formatRupiah(appliedCoupon.discountAmount)})</span>
                    </div>
                    <button onClick={removeCoupon} className="text-rose-500 hover:text-rose-700 transition-colors p-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Kode kupon diskon"
                      className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-warung-500 focus:bg-white transition-all uppercase"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="px-4 py-2.5 bg-warung-800 hover:bg-warung-900 text-white text-xs font-bold rounded-2xl transition-all disabled:opacity-60 shadow-xs active:scale-95"
                    >
                      {couponLoading ? '...' : 'Gunakan'}
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} produk)</span>
                  <span className="font-semibold text-stone-800">{formatRupiah(subtotal)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Biaya Antar</span>
                    <span className="font-semibold text-stone-800">{formatRupiah(deliveryFee)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Kupon Diskon</span>
                    <span>- {formatRupiah(discountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-stone-100 pt-3 flex justify-between font-black text-base text-stone-900">
                  <span>Total Tagihan</span>
                  <span className="text-warung-900 text-lg">{formatRupiah(totalAmount)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full flex items-center justify-center gap-2 py-4 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-sm rounded-2xl transition-all shadow-md active:scale-95"
              >
                Lanjut ke Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/produk"
                className="block text-center text-xs text-warung-800 hover:text-warung-900 font-bold transition-colors"
              >
                + Tambah Jajanan Lainnya
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
