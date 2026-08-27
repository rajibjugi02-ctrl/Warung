import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Trash2, Search, Filter, Sparkles, User, Package } from 'lucide-react';
import { AdminLayout } from './AdminDashboardPage';
import { api } from '../../services/api';
import { formatDate } from '../../utils/format';
import { useToast } from '../../contexts/ToastContext';

interface ReviewItem {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    image: string;
    price: number;
    unit: string;
    rating: number;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [avgRating, setAvgRating] = useState(5.0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'ALL'>('ALL');
  const { showToast } = useToast();

  const fetchReviews = async () => {
    try {
      const res = await api.get('/admin/reviews');
      if (res.data.success) {
        setReviews(res.data.data.reviews || []);
        setTotalReviews(res.data.data.totalReviews || 0);
        setAvgRating(res.data.data.avgRating || 5.0);
      }
    } catch {
      showToast('Gagal memuat daftar ulasan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus ulasan ini? Rating produk terkait akan otomatis dihitung ulang.')) return;
    setDeletingId(id);
    try {
      await new Promise((r) => setTimeout(r, 340));
      await api.delete(`/admin/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setTotalReviews((prev) => Math.max(0, prev - 1));
      showToast('Ulasan berhasil dihapus.', 'success');
    } catch (err: any) {
      setDeletingId(null);
      showToast(err.response?.data?.message || 'Gagal menghapus ulasan.', 'error');
    }
  };

  const filtered = reviews.filter((r) => {
    const matchSearch =
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase()) ||
      r.product?.name.toLowerCase().includes(search.toLowerCase());
    const matchRating = ratingFilter === 'ALL' || r.rating === ratingFilter;
    return matchSearch && matchRating;
  });

  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;

  return (
    <AdminLayout title="Ulasan & Komentar Pembeli">
      <div className="space-y-6 max-w-6xl">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl shadow-card border border-stone-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-black border border-amber-200 shadow-2xs">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-stone-900">{avgRating.toFixed(1)} ★</div>
              <div className="text-xs text-stone-500 font-medium">Rata-rata Rating Toko</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-card border border-stone-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-warung-50 text-warung-800 flex items-center justify-center font-black border border-warung-200 shadow-2xs">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-stone-900">{totalReviews}</div>
              <div className="text-xs text-stone-500 font-medium">Total Ulasan Masuk</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-card border border-stone-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black border border-emerald-200 shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-700">{fiveStarCount}</div>
              <div className="text-xs text-stone-500 font-medium">Ulasan Bintang 5 ⭐⭐⭐⭐⭐</div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-3xl shadow-card border border-stone-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama pembeli, komentar, atau nama produk..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-warung-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-stone-400 font-bold flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {(['ALL', 5, 4, 3, 2, 1] as const).map((r) => (
              <button
                key={String(r)}
                onClick={() => setRatingFilter(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  ratingFilter === r
                    ? 'bg-warung-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {r === 'ALL' ? 'Semua' : `${r} ★`}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-3xl shadow-card border border-stone-200/80 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-extrabold text-stone-900 text-sm sm:text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-warung-700" />
              Daftar Ulasan & Komentar Pembeli ({filtered.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 space-y-4">
              {Array(3).fill(null).map((_, i) => (
                <div key={i} className="h-20 bg-stone-50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs">
              <span className="text-3xl block mb-2">💬</span>
              Belum ada ulasan yang sesuai dengan pencarian atau filter Anda.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {filtered.map((rev) => (
                <div
                  key={rev.id}
                  className={`p-5 sm:p-6 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                    deletingId === rev.id ? 'animate-delete-row bg-rose-50' : 'hover:bg-cream-50/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Product Thumbnail */}
                    {rev.product ? (
                      <img
                        src={rev.product.image}
                        alt={rev.product.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-stone-200 shadow-2xs flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&q=60';
                        }}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 flex-shrink-0">
                        <Package className="w-6 h-6" />
                      </div>
                    )}

                    {/* Review Body */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-stone-900 text-sm flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-stone-400" />
                          {rev.userName}
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="text-xs font-bold text-warung-800 bg-warung-50 px-2 py-0.5 rounded-md border border-warung-200">
                          {rev.product?.name || 'Produk Warung'}
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="text-[11px] text-stone-400">{formatDate(rev.createdAt)}</span>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1 text-amber-400 text-sm">
                        {Array(rev.rating).fill(null).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                        <span className="text-xs font-bold text-stone-600 ml-1">({rev.rating}/5)</span>
                      </div>

                      {/* Comment text */}
                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-stone-50/80 p-3 rounded-2xl border border-stone-100">
                        "{rev.comment}"
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleDelete(rev.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all border border-rose-200"
                      title="Hapus Ulasan Ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReviewsPage;
