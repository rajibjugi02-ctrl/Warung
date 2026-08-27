import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Printer, Phone, Package, Store, ClipboardCheck, Star, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { Order } from '../types';
import { formatRupiah, generateWhatsAppLink } from '../utils/format';
import { PageSkeleton } from '../components/common/Skeletons';

const ORDER_TIMELINE = [
  { status: 'PENDING', label: 'Pesanan Dibuat', icon: ClipboardCheck, description: 'Pesanan diterima oleh sistem Warung Lenira.' },
  { status: 'PAID_PAYMENT', label: 'Pembayaran Berhasil', icon: CheckCircle2, description: 'Pembayaran telah dikonfirmasi lunas.' },
  { status: 'PROCESSING', label: 'Pesanan Diproses', icon: Package, description: 'Warung sedang menyiapkan & mengemas produk Anda.' },
  { status: 'READY', label: 'Siap Diambil di Warung', icon: Store, description: 'Pesanan sudah dikemas dan siap Anda ambil langsung di Warung Lenira.' },
  { status: 'COMPLETED', label: 'Pesanan Selesai', icon: Star, description: 'Pesanan telah diambil. Terima kasih telah berbelanja di Warung Lenira!' },
];

const getTimelineIndex = (orderStatus: string, paymentStatus: string): number => {
  if (orderStatus === 'COMPLETED') return 4;
  if (orderStatus === 'READY') return 3;
  if (orderStatus === 'PROCESSING') return 2;
  if (paymentStatus === 'PAID') return 1;
  return 0;
};

const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.data);
      } catch {
        // handle 404
      } finally {
        setLoading(false);
      }
    };
    if (id) fetch();
  }, [id]);

  if (loading) return <PageSkeleton />;
  if (!order) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-3xl border border-stone-200 shadow-card max-w-md w-full">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Pesanan Tidak Ditemukan</h2>
          <p className="text-xs text-stone-500 mb-6">Nomor pesanan yang dicari tidak ditemukan atau tautan salah.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-warung-800 text-white font-bold text-xs rounded-2xl shadow-sm hover:bg-warung-900 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    );
  }

  const timelineIndex = getTimelineIndex(order.orderStatus, order.paymentStatus);
  const waMsg = `Halo Warung Lenira, saya ingin menanyakan status pesanan saya dengan nomor ${order.orderNumber}. Terima kasih!`;
  const waLink = generateWhatsAppLink('62895333691222', waMsg);
  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-cream-50 pb-20 lg:pb-12 print:bg-white animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Top Back Navigation Pill */}
        <div className="mb-6 print:hidden">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-cream-100 border border-stone-200 text-stone-700 hover:text-stone-950 font-bold text-xs rounded-full shadow-subtle hover:shadow-card transition-all duration-200 group active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-stone-500 group-hover:text-warung-800 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">Pelacakan Pesanan</h1>
            <p className="text-stone-500 text-xs sm:text-sm mt-0.5 font-medium">Nomor: <strong className="text-warung-900">{order.orderNumber}</strong></p>
          </div>
          <div className="flex gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 hover:border-warung-300 text-stone-700 text-xs font-bold rounded-2xl transition-all shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Cetak Invoice
            </button>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl transition-all shadow-sm active:scale-95"
            >
              <Phone className="w-4 h-4" />
              Hubungi Warung
            </a>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-3xl shadow-card border border-stone-200/80 p-6 sm:p-8 mb-6">
          <h2 className="font-extrabold text-stone-900 mb-6 text-base sm:text-lg">Status Pengerjaan</h2>
          <div className="space-y-0">
            {ORDER_TIMELINE.map((step, idx) => {
              const Icon = step.icon;
              const isDone = idx < timelineIndex;
              const isActive = idx === timelineIndex;

              return (
                <div key={step.status} className="flex gap-4">
                  {/* Icon column */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        isDone
                          ? 'bg-warung-800 text-white shadow-xs'
                          : isActive
                          ? 'bg-amber-400 text-stone-950 shadow-md ring-4 ring-amber-100 scale-105'
                          : 'bg-stone-100 text-stone-400'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 stroke-[2.5px]" />
                      ) : (
                        <Icon className="w-5 h-5 stroke-[2.5px]" />
                      )}
                    </div>
                    {idx < ORDER_TIMELINE.length - 1 && (
                      <div
                        className={`w-0.5 flex-1 my-1.5 min-h-[2rem] rounded-full transition-colors duration-300 ${
                          isDone ? 'bg-warung-700' : 'bg-stone-200'
                        }`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`pb-8 ${idx === ORDER_TIMELINE.length - 1 ? 'pb-0' : ''}`}>
                    <div
                      className={`font-extrabold text-sm ${
                        isDone || isActive ? 'text-stone-900' : 'text-stone-400'
                      }`}
                    >
                      {step.label}
                    </div>
                    <div
                      className={`text-xs mt-0.5 leading-relaxed ${
                        isDone || isActive ? 'text-stone-600' : 'text-stone-400'
                      }`}
                    >
                      {step.description}
                    </div>
                    {isActive && (
                      <span className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-extrabold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                        Status Terkini
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Invoice */}
        <div className="bg-white rounded-3xl shadow-card border border-stone-200/80 p-6 sm:p-8 mb-6">
          <h2 className="font-extrabold text-stone-900 mb-4 text-base sm:text-lg">Rincian Menu</h2>

          {/* Items */}
          <div className="space-y-3 mb-5">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-2 rounded-2xl hover:bg-stone-50 transition-colors">
                <img
                  src={item.productImage || 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=80&auto=format&fit=crop&q=60'}
                  alt={item.productName}
                  className="w-14 h-14 rounded-2xl object-cover border border-stone-100 flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=80&q=60'; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-stone-900 text-xs sm:text-sm line-clamp-1">{item.productName}</div>
                  <div className="text-xs text-stone-400 mt-0.5">{formatRupiah(item.price)} × {item.quantity}</div>
                </div>
                <div className="font-black text-stone-900 text-xs sm:text-sm">{formatRupiah(item.subtotal)}</div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-stone-100 pt-4 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span className="font-semibold text-stone-800">{formatRupiah(order.subtotal)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-stone-600">
                <span>Biaya Antar</span>
                <span className="font-semibold text-stone-800">{formatRupiah(order.deliveryFee)}</span>
              </div>
            )}
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Diskon Kupon</span>
                <span>- {formatRupiah(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-base text-stone-900 pt-3 border-t border-stone-100">
              <span>Total Tagihan</span>
              <span className="text-warung-900 text-lg">{formatRupiah(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-3xl shadow-card border border-stone-200/80 p-6 sm:p-8">
          <h2 className="font-extrabold text-stone-900 mb-4 text-base sm:text-lg">Informasi Pengiriman</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Nama Pembeli</div>
              <div className="font-extrabold text-stone-900">{order.customerName}</div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Nomor WhatsApp</div>
              <div className="font-extrabold text-stone-900">{order.customerPhone}</div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Metode Pengambilan</div>
              <div className="font-bold text-warung-800">
                {order.deliveryType === 'PICKUP' ? '🏪 Ambil Langsung di Warung' : '🛵 Diantar ke Rumah'}
              </div>
            </div>
            {order.deliveryAddress && (
              <div className="sm:col-span-2">
                <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Alamat Pengantaran</div>
                <div className="font-medium text-stone-800 leading-relaxed">{order.deliveryAddress}</div>
              </div>
            )}
            {order.notes && (
              <div className="sm:col-span-2">
                <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Catatan Pesanan</div>
                <div className="font-medium text-stone-700 bg-stone-50 p-3 rounded-2xl border border-stone-100">{order.notes}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
