import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  BarChart2,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle,
  Sparkles,
  Handshake,
  MessageSquare,
  Menu,
  X,
  ExternalLink,
  Store,
  CreditCard,
} from 'lucide-react';
import { api } from '../../services/api';
import { formatRupiah, formatDate } from '../../utils/format';

interface AdminStats {
  todaySalesRevenue: number;
  totalSalesRevenue: number;
  totalOrdersCount: number;
  pendingOrdersCount: number;
  paidOrdersCount: number;
  categoriesCount: number;
  productsCount: number;
  topProducts: any[];
  recentOrders: any[];
}

export const AdminLayout: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/produk', label: 'Produk', icon: Package },
    { to: '/admin/titip', label: 'Titip Jajanan', icon: Handshake },
    { to: '/admin/banner', label: 'Banner Beranda', icon: Sparkles },
    { to: '/admin/pembayaran', label: 'Pengaturan Pembayaran', icon: CreditCard },
    { to: '/admin/ulasan', label: 'Ulasan Pembeli', icon: MessageSquare },
    { to: '/admin/pesanan', label: 'Pesanan', icon: ClipboardList },
    { to: '/admin/laporan', label: 'Laporan', icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col lg:flex-row">
      {/* Top Mobile Bar */}
      <header className="lg:hidden bg-warung-950 text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-40 border-b border-warung-800 shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -ml-1 text-stone-200 hover:text-white hover:bg-warung-850 rounded-xl transition-all"
            aria-label="Toggle Admin Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div>
            <div className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <Store className="w-4 h-4 text-amber-400" />
              <span>Warung Lenira</span>
            </div>
            <div className="text-[10px] text-amber-400 font-bold">Admin Panel</div>
          </div>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-300 hover:text-white bg-warung-850 hover:bg-warung-800 px-3 py-1.5 rounded-xl border border-warung-700 transition-all"
        >
          <span>Toko</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-stone-950/60 backdrop-blur-xs z-40 animate-fade-in"
        />
      )}

      {/* Sidebar (Desktop Fixed & Mobile Sliding Drawer) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-warung-950 text-white flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-warung-800 flex items-center justify-between">
          <div>
            <div className="text-base font-black tracking-tight text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-black text-xs">
                WL
              </span>
              Warung Lenira
            </div>
            <div className="text-[11px] text-stone-400 font-semibold mt-0.5">Admin Management</div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 text-stone-400 hover:text-white hover:bg-warung-800 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-amber-400 text-stone-950 shadow-md font-extrabold'
                    : 'text-stone-300 hover:bg-warung-900 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-warung-800">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-warung-900 hover:bg-warung-850 text-stone-300 hover:text-white text-xs font-bold rounded-xl border border-warung-750 transition-all"
          >
            <Store className="w-3.5 h-3.5 text-amber-400" />
            <span>Lihat Website Toko</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        <div className="bg-white border-b border-stone-200/80 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
          <h1 className="text-lg sm:text-2xl font-black text-stone-900 tracking-tight">{title}</h1>
        </div>
        <div className="p-4 sm:p-6 lg:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
};

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then((res) => {
      setStats(res.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-white rounded-2xl shadow-card border border-stone-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-stone-500">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
        </div>
      </div>
      <div className="text-2xl font-extrabold text-stone-800">{value}</div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(null).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-28 animate-pulse border border-stone-100" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard
          label="Pendapatan Hari Ini"
          value={formatRupiah(stats?.todaySalesRevenue)}
          icon={TrendingUp}
          color="bg-warung-100 text-warung-700"
        />
        <StatCard
          label="Total Pendapatan"
          value={formatRupiah(stats?.totalSalesRevenue)}
          icon={BarChart2}
          color="bg-amber-100 text-amber-700"
        />
        <StatCard
          label="Pesanan Pending"
          value={stats?.pendingOrdersCount || 0}
          icon={Clock}
          color="bg-orange-100 text-orange-600"
        />
        <StatCard
          label="Pesanan Berhasil"
          value={stats?.paidOrdersCount || 0}
          icon={CheckCircle}
          color="bg-emerald-100 text-emerald-700"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-card border border-stone-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-stone-800">Pesanan Terbaru</h2>
            <Link to="/admin/pesanan" className="text-sm text-warung-700 hover:underline flex items-center gap-1">
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.recentOrders?.slice(0, 6).map((order: any) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                <div>
                  <div className="text-sm font-semibold text-stone-700">{order.orderNumber}</div>
                  <div className="text-xs text-stone-400">{order.customerName} • {formatDate(order.createdAt)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-warung-800">{formatRupiah(order.totalAmount)}</div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    order.paymentStatus === 'PAID'
                      ? 'bg-emerald-100 text-emerald-700'
                      : order.paymentStatus === 'PENDING'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-card border border-stone-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-stone-800">Produk Terlaris</h2>
            <Link to="/admin/produk" className="text-sm text-warung-700 hover:underline flex items-center gap-1">
              Kelola <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.topProducts?.map((product: any, idx: number) => (
              <div key={product.id} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  idx === 0 ? 'bg-amber-400 text-amber-900'
                    : idx === 1 ? 'bg-stone-300 text-stone-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {idx + 1}
                </span>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-10 h-10 rounded-xl object-cover border border-stone-100 flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=80&q=60'; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-stone-700 line-clamp-1">{product.name}</div>
                  <div className="text-xs text-stone-400">Terjual {product.soldCount}× • Stok {product.stock}</div>
                </div>
                <div className="text-sm font-bold text-warung-800">{formatRupiah(product.price)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
