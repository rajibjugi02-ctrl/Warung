import React, { useState, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  Package,
  Store,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { AdminLayout } from './AdminDashboardPage';
import { api } from '../../services/api';
import { Order } from '../../types';
import { formatRupiah, formatDate, generateWhatsAppLink } from '../../utils/format';
import { useToast } from '../../contexts/ToastContext';

const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Menunggu', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { value: 'PROCESSING', label: 'Sedang Diproses', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { value: 'READY', label: 'Siap Diambil di Warung', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  { value: 'COMPLETED', label: 'Selesai', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { value: 'CANCELLED', label: 'Dibatalkan', color: 'bg-rose-50 text-rose-800 border-rose-200' },
];

const PAYMENT_STATUSES = [
  { value: 'PENDING', label: 'Belum Bayar', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { value: 'PAID', label: 'Lunas (QRIS/VA)', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { value: 'FAILED', label: 'Gagal', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  { value: 'EXPIRED', label: 'Kadaluarsa', color: 'bg-stone-100 text-stone-700 border-stone-200' },
];

const getBadgeStyle = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'PENDING':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'PROCESSING':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'READY':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'COMPLETED':
      return 'bg-warung-50 text-warung-800 border-warung-200';
    case 'FAILED':
    case 'CANCELLED':
    case 'EXPIRED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-stone-50 text-stone-600 border-stone-200';
  }
};

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [filterOrder, setFilterOrder] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterPayment) params.set('paymentStatus', filterPayment);
      if (filterOrder) params.set('status', filterOrder);
      const res = await api.get(`/admin/orders?${params.toString()}`);
      setOrders(res.data.data || []);
    } catch {
      showToast('Gagal memuat daftar pesanan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterPayment, filterOrder]);

  const handleStatusChange = async (orderId: string, type: 'orderStatus' | 'paymentStatus', value: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { [type]: value });
      showToast(`Status berhasil diubah menjadi ${value}.`, 'success');
      fetchOrders();
    } catch {
      showToast('Gagal memperbarui status pesanan.', 'error');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q)
    );
  });

  return (
    <AdminLayout title="Manajemen Pesanan Masuk">
      <div className="space-y-5 max-w-6xl">
        {/* Top Filter & Search Controls */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-card border border-stone-200/80 space-y-3.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari no. pesanan, nama pembeli, atau no. WhatsApp..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-warung-500"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-warung-500"
            >
              <option value="">Semua Status Pembayaran</option>
              {PAYMENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label} ({s.value})
                </option>
              ))}
            </select>

            <select
              value={filterOrder}
              onChange={(e) => setFilterOrder(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-warung-500"
            >
              <option value="">Semua Status Pesanan</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label} ({s.value})
                </option>
              ))}
            </select>

            <div className="hidden lg:flex items-center justify-end text-xs font-bold text-stone-500 pr-1">
              Ditemukan: <strong className="text-stone-900 ml-1">{filteredOrders.length}</strong> pesanan
            </div>
          </div>
        </div>

        {/* Orders List / Cards */}
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {Array(4).fill(null).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl h-28 animate-pulse border border-stone-100" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-stone-200/80 text-stone-500">
              <span className="text-4xl block mb-2">📭</span>
              <p className="font-extrabold text-stone-800 text-sm">Tidak ada pesanan yang sesuai</p>
              <p className="text-xs text-stone-400 mt-1">Coba ubah kata kunci pencarian atau filter status Anda.</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isExp = expanded === order.id;
              const waLink = generateWhatsAppLink(
                order.customerPhone,
                `Halo ${order.customerName}, pesanan Anda (${order.orderNumber}) di Warung Lenira sedang disiapkan. Ada yang bisa kami bantu? 😊`
              );

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl shadow-card border border-stone-200/80 overflow-hidden transition-all duration-200 hover:border-warung-300"
                >
                  {/* Order Main Card Header (Clickable & Fully Mobile Responsive) */}
                  <div
                    onClick={() => setExpanded(isExp ? null : order.id)}
                    className="p-4 sm:p-5 cursor-pointer hover:bg-cream-50/50 transition-colors"
                  >
                    {/* Top line: Order number & Date & Toggle */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-xs sm:text-sm text-stone-900 bg-stone-100 px-2.5 py-1 rounded-xl">
                          {order.orderNumber}
                        </span>
                        <span className="text-[11px] text-stone-400 font-semibold">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-bold text-warung-800 hidden sm:inline">
                          {isExp ? 'Tutup Detail' : 'Buka Detail'}
                        </span>
                        <div
                          className={`w-7 h-7 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 transition-transform ${
                            isExp ? 'rotate-180 bg-warung-100 text-warung-800' : ''
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Middle: Customer Name & Phone */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <div className="font-extrabold text-stone-900 text-sm sm:text-base">
                          {order.customerName}
                        </div>
                        <div className="text-xs text-stone-500 font-medium">
                          WhatsApp: <span className="font-bold text-stone-700">{order.customerPhone}</span>
                        </div>
                      </div>

                      {/* Total Amount */}
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-bold">
                          Total Tagihan
                        </span>
                        <span className="font-black text-warung-900 text-base sm:text-lg">
                          {formatRupiah(order.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Bottom: Status Badges */}
                    <div className="flex items-center gap-2 flex-wrap pt-2.5 border-t border-stone-100">
                      <span className={`text-[11px] font-extrabold px-3 py-1 rounded-xl border ${getBadgeStyle(order.paymentStatus)}`}>
                        Bayar: {order.paymentStatus}
                      </span>
                      <span className={`text-[11px] font-extrabold px-3 py-1 rounded-xl border ${getBadgeStyle(order.orderStatus)}`}>
                        Status: {order.orderStatus}
                      </span>
                      <span className="text-[11px] font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-xl ml-auto flex items-center gap-1">
                        <Store className="w-3 h-3 text-stone-400" />
                        Ambil di Warung
                      </span>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExp && (
                    <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-stone-100 bg-stone-50/50 space-y-5 animate-fade-in">
                      {/* 1. Ordered Products List */}
                      <div>
                        <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-stone-400" />
                          <span>Daftar Produk yang Dipesan ({order.items.length} item)</span>
                        </div>

                        <div className="bg-white rounded-2xl border border-stone-200/80 divide-y divide-stone-100 overflow-hidden shadow-2xs">
                          {order.items.map((item) => (
                            <div key={item.id} className="p-3.5 flex items-center gap-3">
                              <img
                                src={
                                  item.productImage ||
                                  'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=100&q=60'
                                }
                                alt={item.productName}
                                className="w-12 h-12 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=100&q=60';
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-extrabold text-stone-900 text-xs sm:text-sm line-clamp-1">
                                  {item.productName}
                                </div>
                                {item.variantName && (
                                  <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold inline-block my-0.5">
                                    {item.variantName}
                                  </span>
                                )}
                                <div className="text-xs text-stone-500 font-medium">
                                  {formatRupiah(item.price)} × <strong className="text-stone-900">{item.quantity}</strong>
                                </div>
                              </div>
                              <div className="font-black text-stone-900 text-xs sm:text-sm text-right flex-shrink-0">
                                {formatRupiah(item.subtotal)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Notes if any */}
                      {order.notes && (
                        <div className="bg-amber-50/80 border border-amber-200/80 p-3.5 rounded-2xl text-xs">
                          <strong className="text-amber-950 font-bold block mb-0.5">📝 Catatan Pembeli:</strong>
                          <p className="text-amber-900">{order.notes}</p>
                        </div>
                      )}

                      {/* 2. Status Updates Control Form */}
                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 space-y-3 shadow-2xs">
                        <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                          Update Status Pesanan
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-stone-600 mb-1">
                              Status Pembayaran
                            </label>
                            <select
                              value={order.paymentStatus}
                              onChange={(e) => handleStatusChange(order.id, 'paymentStatus', e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-warung-500"
                            >
                              {PAYMENT_STATUSES.map((s) => (
                                <option key={s.value} value={s.value}>
                                  {s.label} ({s.value})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-stone-600 mb-1">
                              Status Pesanan
                            </label>
                            <select
                              value={order.orderStatus}
                              onChange={(e) => handleStatusChange(order.id, 'orderStatus', e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-warung-500"
                            >
                              {ORDER_STATUSES.map((s) => (
                                <option key={s.value} value={s.value}>
                                  {s.label} ({s.value})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* 3. Action Buttons (WhatsApp, etc.) */}
                      <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-95 flex-1"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Hubungi Pembeli via WhatsApp</span>
                        </a>

                        <a
                          href={`/pesanan/${order.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold text-xs rounded-xl transition-all"
                        >
                          <span>Halaman Lacak Pesanan</span>
                          <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrdersPage;
