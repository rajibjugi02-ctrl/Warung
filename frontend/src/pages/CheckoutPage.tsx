import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  Store,
  MessageSquare,
  CreditCard,
  Check,
  ChevronRight,
  Smartphone,
  Building2,
  Wallet,
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { formatRupiah } from '../utils/format';

type PaymentMethod = 'QRIS' | 'BCA_VA' | 'BRI_VA' | 'BSI_VA' | 'MANDIRI_VA' | 'GOPAY' | 'SHOPEEPAY';

const paymentOptions = [
  { value: 'QRIS', label: 'QRIS (Semua E-Wallet & Bank)', description: 'Scan QR pakai GoPay, OVO, DANA, ShopeePay, BCA, BRImo, dll.', icon: Smartphone, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { value: 'BRI_VA', label: 'Bank BRI', description: 'Transfer Rekening BRI Ibu Leni (7222 01008732533)', icon: Building2, color: 'text-sky-700 bg-sky-50 border-sky-200' },
  { value: 'BSI_VA', label: 'Bank BSI (Bank Syariah Indonesia)', description: 'Transfer Rekening BSI Ibu Leni (7367355818)', icon: Building2, color: 'text-teal-700 bg-teal-50 border-teal-200' },
  { value: 'BCA_VA', label: 'Bank BCA', description: 'Transfer Rekening BCA Ibu Leni (0954440491)', icon: Building2, color: 'text-blue-800 bg-blue-50 border-blue-200' },
  { value: 'MANDIRI_VA', label: 'Mandiri (Livin by Mandiri)', description: 'Transfer via ATM / Livin by Mandiri', icon: Building2, color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  { value: 'GOPAY', label: 'GoPay / Gojek', description: 'Bayar langsung lewat aplikasi GoPay', icon: Wallet, color: 'text-green-700 bg-green-50 border-green-200' },
];

const STEPS = [
  { id: 1, label: 'Data Pembeli', icon: User },
  { id: 2, label: 'Pengambilan', icon: Store },
  { id: 3, label: 'Pembayaran', icon: CreditCard },
];

const CheckoutPage: React.FC = () => {
  const { cart, subtotal, deliveryFee, discountAmount, totalAmount, appliedCoupon, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const deliveryType = 'PICKUP';

  // Form state
  const [form, setForm] = useState({
    customerName: user?.name || '',
    customerPhone: user?.phone || '',
    customerEmail: user?.email || '',
    deliveryAddress: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('QRIS');

  if (cart.length === 0) {
    navigate('/keranjang');
    return null;
  }

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!form.customerName.trim() || !form.customerPhone.trim()) {
        showToast('Nama dan nomor WhatsApp wajib diisi.', 'error');
        return;
      }
    }
    setStep((s) => Math.min(3, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitOrder = async () => {
    if (!paymentMethod) {
      showToast('Pilih metode pembayaran terlebih dahulu.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/orders', {
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail || undefined,
        deliveryType,
        deliveryAddress: form.deliveryAddress || undefined,
        deliveryFee,
        notes: form.notes || undefined,
        couponCode: appliedCoupon?.code || undefined,
        paymentMethod,
        items: cart.map((item) => ({
          productId: item.product.id,
          variantId: item.selectedVariant?.id || undefined,
          variantName: item.selectedVariant?.name || undefined,
          price: item.selectedVariant
            ? (item.selectedVariant.discountPrice ?? item.selectedVariant.price)
            : (item.product.discountPrice ?? item.product.price),
          quantity: item.quantity,
        })),
      });

      if (res.data.success) {
        const order = res.data.data.order;
        clearCart();
        showToast('Pesanan berhasil dibuat! Silakan selesaikan pembayaran.', 'success');
        navigate(`/payment/${order.id}`);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal membuat pesanan. Coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 pb-20 lg:pb-12 animate-fade-in">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-6">Checkout Pesanan</h1>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <React.Fragment key={s.id}>
                <div
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'bg-warung-800 text-white shadow-md'
                      : isDone
                      ? 'bg-warung-100 text-warung-800 font-bold'
                      : 'bg-white text-stone-400 border border-stone-200'
                  }`}
                >
                  {isDone ? (
                    <Check className="w-4 h-4 text-warung-800 stroke-[3px]" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                  <span className="text-xs sm:text-sm font-bold whitespace-nowrap">{s.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-stone-300 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-card border border-stone-200/80 p-6 sm:p-8">
              {/* Step 1: Customer Info */}
              {step === 1 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                    <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-warung-700" />
                      Informasi Pembeli
                    </h2>
                    <span className="text-xs text-stone-400 font-medium">Langkah 1 dari 3</span>
                  </div>

                  {!user && (
                    <div className="bg-amber-50 border border-amber-200/80 rounded-2xl px-4 py-3 text-xs sm:text-sm text-amber-800 flex items-center gap-2">
                      <span>💡</span>
                      <div>
                        Anda checkout sebagai <strong>Tamu</strong>.{' '}
                        <Link to="/login" className="underline font-bold text-amber-900 hover:text-stone-900">
                          Masuk / Login
                        </Link>{' '}
                        untuk menyimpan riwayat transaksi.
                      </div>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Nama Lengkap <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          value={form.customerName}
                          onChange={(e) => updateForm('customerName', e.target.value)}
                          placeholder="Masukkan nama lengkap"
                          className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-warung-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Nomor WhatsApp <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="tel"
                          value={form.customerPhone}
                          onChange={(e) => updateForm('customerPhone', e.target.value)}
                          placeholder="Contoh: 08123456789"
                          className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-warung-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Email (Opsional untuk bukti pembayaran)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="email"
                        value={form.customerEmail}
                        onChange={(e) => updateForm('customerEmail', e.target.value)}
                        placeholder="email@contoh.com"
                        className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-warung-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Catatan Tambahan untuk Warung (Opsional)
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                      <textarea
                        rows={3}
                        value={form.notes}
                        onChange={(e) => updateForm('notes', e.target.value)}
                        placeholder="Misal: jangan terlalu pedas, bungkus terpisah, dll."
                        className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-warung-500 focus:bg-white transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Delivery */}
              {step === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                    <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                      <Store className="w-5 h-5 text-warung-700" />
                      Pengambilan Pesanan di Warung
                    </h2>
                    <span className="text-xs text-stone-400 font-medium">Langkah 2 dari 3</span>
                  </div>

                  {/* Info Card Pickup */}
                  <div className="bg-warung-50/80 border-2 border-warung-200 rounded-3xl p-6 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-warung-200 text-warung-800 flex items-center justify-center text-2xl shadow-xs flex-shrink-0">
                        🏪
                      </div>
                      <div className="flex-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase mb-1">
                          ✓ Ambil Langsung di Lokasi (Rp 0 / Gratis)
                        </div>
                        <h3 className="font-extrabold text-stone-900 text-base">Datang & Ambil ke Warung Lenira</h3>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                          Pesanan akan disiapkan oleh kami. Setelah pembayaran selesai, Anda tinggal datang ke lokasi warung untuk mengambil paket pesanan tanpa harus mengantre.
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-warung-200/80 grid sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-3.5 rounded-2xl border border-warung-200/60">
                        <span className="font-bold text-stone-900 block mb-1">📍 Alamat Lokasi Warung:</span>
                        <p className="text-stone-600 leading-relaxed">
                          CQ38+457, Padasuka, Ciomas, Bogor Regency, Jawa Barat 16610
                        </p>
                      </div>
                      <div className="bg-white p-3.5 rounded-2xl border border-warung-200/60">
                        <span className="font-bold text-stone-900 block mb-1">🕒 Jam Operasional Warung:</span>
                        <p className="text-stone-600 leading-relaxed">
                          Buka Setiap Hari: 07.00 – 22.00 WIB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Catatan / Perkiraan Waktu Mengambil <span className="text-stone-400 font-normal">(Opsional)</span>
                    </label>
                    <input
                      type="text"
                      value={form.notes}
                      onChange={(e) => updateForm('notes', e.target.value)}
                      placeholder="misal: Diambil sore ini sekitar jam 16.30..."
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-warung-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                    <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-warung-700" />
                      Pilih Metode Pembayaran
                    </h2>
                    <span className="text-xs text-stone-400 font-medium">Langkah 3 dari 3</span>
                  </div>

                  <div className="space-y-3">
                    {paymentOptions.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = paymentMethod === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setPaymentMethod(opt.value as PaymentMethod)}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                            isSelected
                              ? 'border-warung-700 bg-warung-50/60 shadow-xs'
                              : 'border-stone-200 hover:border-stone-300 bg-white'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${opt.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-extrabold text-stone-900 text-sm">{opt.label}</div>
                            <div className="text-xs text-stone-500 mt-0.5">{opt.description}</div>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 bg-warung-800 rounded-full flex items-center justify-center flex-shrink-0 shadow-xs">
                              <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-stone-100">
                {step > 1 && (
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    className="px-6 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm rounded-2xl transition-all"
                  >
                    Kembali
                  </button>
                )}
                {step < 3 ? (
                  <button
                    onClick={handleNextStep}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-warung-800 hover:bg-warung-900 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-md active:scale-95"
                  >
                    Lanjutkan ke Pengiriman
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitOrder}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-sm rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 active:scale-95"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />
                        Memproses Pesanan...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Bayar Sekarang — {formatRupiah(totalAmount)}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-card border border-stone-200/80 p-6 sticky top-24">
              <h3 className="font-extrabold text-stone-900 text-base mb-4">Ringkasan Pesanan</h3>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
                {cart.map(({ product, quantity, selectedVariant }) => {
                  const itemKey = selectedVariant ? `${product.id}-${selectedVariant.id || selectedVariant.name}` : product.id;
                  const itemPrice = selectedVariant
                    ? (selectedVariant.discountPrice ?? selectedVariant.price)
                    : (product.discountPrice ?? product.price);
                  return (
                    <div key={itemKey} className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-11 h-11 rounded-xl object-cover border border-stone-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-stone-800 font-bold line-clamp-1">{product.name}</div>
                        <div className="text-[11px] text-stone-400">
                          {selectedVariant ? (
                            <span className="text-amber-800 font-bold">{selectedVariant.name} • </span>
                          ) : null}
                          × {quantity} {selectedVariant ? selectedVariant.unit : product.unit}
                        </div>
                      </div>
                      <div className="text-xs font-extrabold text-stone-900 flex-shrink-0">
                        {formatRupiah(itemPrice * quantity)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <hr className="border-stone-100 mb-4" />
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} item)</span>
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
                <div className="flex justify-between font-black text-base text-stone-900 pt-3 border-t border-stone-100">
                  <span>Total Bayar</span>
                  <span className="text-warung-900 text-lg">{formatRupiah(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
