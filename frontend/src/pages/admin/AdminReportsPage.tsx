import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, ShoppingBag, Package } from 'lucide-react';
import { AdminLayout } from './AdminDashboardPage';
import { api } from '../../services/api';
import { Order } from '../../types';
import { formatRupiah, formatDate } from '../../utils/format';

const AdminReportsPage: React.FC = () => {
  const [data, setData] = useState<{ totalRevenue: number; totalOrders: number; totalItemsSold: number; orders: Order[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/reports/sales').then((res) => {
      setData(res.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const exportCSV = () => {
    if (!data) return;
    const headers = ['No. Pesanan', 'Nama Pelanggan', 'Tanggal', 'Total', 'Status Bayar', 'Status Pesanan'];
    const rows = data.orders.map((o) => [
      o.orderNumber, o.customerName, formatDate(o.createdAt), o.totalAmount, o.paymentStatus, o.orderStatus,
    ]);
    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-penjualan-lenira-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout title="Laporan Penjualan">
      <div className="flex justify-end mb-5">
        <button
          onClick={exportCSV}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-warung-700 hover:bg-warung-800 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Pendapatan', value: formatRupiah(data?.totalRevenue), icon: TrendingUp, color: 'bg-warung-100 text-warung-700' },
          { label: 'Total Pesanan Berhasil', value: data?.totalOrders || 0, icon: ShoppingBag, color: 'bg-amber-100 text-amber-700' },
          { label: 'Total Item Terjual', value: data?.totalItemsSold || 0, icon: Package, color: 'bg-blue-100 text-blue-700' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl shadow-card border border-stone-100 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                </div>
                <span className="text-sm text-stone-500">{card.label}</span>
              </div>
              <div className="text-2xl font-extrabold text-stone-800">{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-2xl shadow-card border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                {['No. Pesanan', 'Nama', 'Tanggal', 'Total', 'Bayar', 'Pesanan'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {loading ? (
                Array(5).fill(null).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array(6).fill(null).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-stone-100 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : (
                data?.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-stone-700">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-stone-600">{order.customerName}</td>
                    <td className="px-4 py-3 text-stone-500 text-xs">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 font-bold text-warung-800">{formatRupiah(order.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-stone-600">{order.orderStatus}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReportsPage;
