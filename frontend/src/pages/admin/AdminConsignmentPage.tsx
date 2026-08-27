import React, { useState, useEffect, useRef } from 'react';
import {
  Handshake,
  Plus,
  Phone,
  MapPin,
  Edit2,
  Trash2,
  X,
  Sparkles,
  MessageCircle,
  Package,
  UserCheck,
  Upload,
  Image as ImageIcon,
  RefreshCw,
} from 'lucide-react';
import { AdminLayout } from './AdminDashboardPage';
import { api } from '../../services/api';
import { formatRupiah } from '../../utils/format';
import { useToast } from '../../contexts/ToastContext';

const QUICK_UNITS = ['porsi', 'mika', 'box', 'pcs', 'bungkus', 'cup', 'botol', 'toples'];

interface Maker {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  bio: string | null;
  isActive: boolean;
  products?: any[];
  _count?: { products: number };
}

const AdminConsignmentPage: React.FC = () => {
  const [makers, setMakers] = useState<Maker[]>([]);
  const [consignmentProducts, setConsignmentProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Maker Modal States
  const [showMakerModal, setShowMakerModal] = useState(false);
  const [editMaker, setEditMaker] = useState<Maker | null>(null);
  const [makerForm, setMakerForm] = useState({ name: '', phone: '', address: '', bio: '' });

  // Product Modal States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const blankProductForm = {
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    stock: '20',
    isUnlimitedStock: false,
    image: '',
    unit: 'porsi',
    categoryId: '',
    consignmentMakerId: '',
    isActive: true,
    isConsignment: true,
  };
  const [productForm, setProductForm] = useState<any>(blankProductForm);

  const { showToast } = useToast();

  const fetchData = async () => {
    try {
      const [makersRes, consRes, catsRes] = await Promise.all([
        api.get('/admin/consignments/makers'),
        api.get('/consignments'),
        api.get('/categories'),
      ]);
      setMakers(makersRes.data.data || []);
      setConsignmentProducts(consRes.data.data?.products || []);
      setCategories(catsRes.data.data || []);
    } catch {
      showToast('Gagal memuat data titipan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- MAKER HANDLERS ---
  const openCreateMaker = () => {
    setEditMaker(null);
    setMakerForm({ name: '', phone: '', address: '', bio: '' });
    setShowMakerModal(true);
  };

  const openEditMaker = (maker: Maker) => {
    setEditMaker(maker);
    setMakerForm({
      name: maker.name,
      phone: maker.phone,
      address: maker.address || '',
      bio: maker.bio || '',
    });
    setShowMakerModal(true);
  };

  const handleSaveMaker = async () => {
    if (!makerForm.name || !makerForm.phone) {
      showToast('Nama mitra dan nomor HP wajib diisi.', 'error');
      return;
    }

    try {
      if (editMaker) {
        await api.put(`/admin/consignments/makers/${editMaker.id}`, makerForm);
        showToast('Data mitra titipan berhasil diperbarui!', 'success');
      } else {
        await api.post('/admin/consignments/makers', makerForm);
        showToast('Mitra titipan baru berhasil didaftarkan!', 'success');
      }
      setShowMakerModal(false);
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan data mitra.', 'error');
    }
  };

  const handleDeleteMaker = async (id: string) => {
    if (!confirm('Hapus data mitra ini?')) return;
    try {
      await api.delete(`/admin/consignments/makers/${id}`);
      showToast('Mitra titipan berhasil dihapus.', 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menghapus mitra.', 'error');
    }
  };

  // --- PRODUCT HANDLERS ---
  const openCreateProduct = (defaultMakerId?: string) => {
    setEditProduct(null);
    const jajananCat = categories.find((c) => c.slug === 'jajanan') || categories[0];
    setProductForm({
      ...blankProductForm,
      categoryId: jajananCat?.id || '',
      consignmentMakerId: defaultMakerId || makers[0]?.id || '',
    });
    setShowProductModal(true);
  };

  const openEditProduct = (product: any) => {
    setEditProduct(product);
    const isUnlimited = product.stock >= 999;
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      discountPrice: product.discountPrice ? String(product.discountPrice) : '',
      stock: isUnlimited ? '20' : String(product.stock),
      isUnlimitedStock: isUnlimited,
      image: product.image,
      unit: product.unit || 'porsi',
      categoryId: product.categoryId,
      consignmentMakerId: product.consignmentMakerId || '',
      isActive: product.isActive,
      isConsignment: true,
    });
    setShowProductModal(true);
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showToast('Ukuran foto terlalu besar. Maksimal 8MB.', 'error');
      return;
    }

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await api.post('/admin/upload', {
            image: base64Data,
            name: productForm.name || 'jajanan-titipan',
          });
          if (res.data.success && res.data.data?.url) {
            setProductForm((prev: any) => ({ ...prev, image: res.data.data.url }));
            showToast('Foto jajanan berhasil diunggah! 📸', 'success');
          }
        } catch {
          setProductForm((prev: any) => ({ ...prev, image: base64Data }));
          showToast('Foto berhasil dimuat.', 'info');
        } finally {
          setUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      showToast('Gagal memproses file foto.', 'error');
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.consignmentMakerId) {
      showToast('Nama jajanan, harga, dan nama pembuat mitra wajib diisi.', 'error');
      return;
    }

    const finalStock = productForm.isUnlimitedStock ? 9999 : (Number(productForm.stock) || 0);

    const payload = {
      name: productForm.name,
      description: productForm.description,
      price: Number(productForm.price),
      discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : null,
      stock: finalStock,
      image: productForm.image || 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80',
      unit: productForm.unit || 'porsi',
      categoryId: productForm.categoryId || categories[0]?.id,
      isActive: Boolean(productForm.isActive),
      isConsignment: true,
      consignmentMakerId: productForm.consignmentMakerId,
    };

    try {
      if (editProduct) {
        await api.put(`/admin/products/${editProduct.id}`, payload);
        showToast('Data jajanan titipan berhasil diperbarui!', 'success');
      } else {
        await api.post('/admin/products', payload);
        showToast('Jajanan titipan baru berhasil ditambahkan!', 'success');
      }
      setShowProductModal(false);
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan jajanan titipan.', 'error');
    }
  };

  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const handleDeleteProduct = async (id: string, name?: string) => {
    if (!confirm(`Hapus jajanan titipan ${name ? `"${name}"` : ''} dari katalog toko?`)) return;
    setDeletingProductId(id);
    try {
      await new Promise((r) => setTimeout(r, 340));
      await api.delete(`/admin/products/${id}`);
      setConsignmentProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('Jajanan titipan berhasil dihapus.', 'success');
    } catch (err: any) {
      setDeletingProductId(null);
      showToast(err.response?.data?.message || 'Gagal menghapus produk.', 'error');
    }
  };

  return (
    <AdminLayout title="Manajemen Titip Jajanan & Mitra">
      <div className="space-y-8 max-w-6xl">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-card border border-stone-200/80">
          <div>
            <h2 className="font-extrabold text-stone-900 text-base sm:text-lg flex items-center gap-2">
              <Handshake className="w-5 h-5 text-amber-600" />
              Kelola Jajanan Titipan & Mitra Pembuat
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Khusus mengelola produk titipan dari ibu-ibu/warga sekitar, terpisah dari produk warung utama.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={openCreateMaker}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-2xl transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-stone-500" />
              + Daftarkan Mitra Baru
            </button>
            <button
              onClick={() => openCreateProduct()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-warung-800 hover:bg-warung-900 text-white text-xs sm:text-sm font-bold rounded-2xl transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              + Tambah Jajanan Titipan
            </button>
          </div>
        </div>

        {/* 1. Mitra Cards Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              1. Daftar Mitra Pembuat Jajanan ({makers.length})
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array(3).fill(null).map((_, i) => (
                <div key={i} className="h-44 bg-white rounded-3xl animate-pulse border border-stone-100" />
              ))}
            </div>
          ) : makers.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-stone-200/80 text-stone-500">
              <span className="text-3xl block mb-2">🤝</span>
              Belum ada data mitra. Klik <strong>+ Daftarkan Mitra Baru</strong> untuk menambahkan pembuat jajanan.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {makers.map((m) => {
                const count = consignmentProducts.filter((p) => p.consignmentMakerId === m.id).length;
                const cleanPhone = m.phone.replace(/[^0-9]/g, '');
                const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
                const waUrl = `https://wa.me/${waNumber}?text=Halo%20${encodeURIComponent(m.name)},%20dari%20Warung%20Lenira%20mengenai%20titipan%20jajanan.`;

                return (
                  <div
                    key={m.id}
                    className="bg-white rounded-3xl p-5 shadow-card border border-stone-200/80 flex flex-col justify-between hover:border-amber-300 transition-all space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center font-black border border-amber-200 shadow-2xs">
                            <UserCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-stone-900 text-sm line-clamp-1">{m.name}</h3>
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-block">
                              {count} Jajanan Dititipkan
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditMaker(m)}
                            className="p-1.5 text-stone-500 hover:text-warung-800 hover:bg-stone-100 rounded-lg transition-colors"
                            title="Edit Data Mitra"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMaker(m.id)}
                            className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Mitra"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {m.bio && (
                        <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-2.5 rounded-xl border border-stone-100 mb-2.5">
                          "{m.bio}"
                        </p>
                      )}

                      <div className="space-y-1.5 text-xs text-stone-500">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-stone-400" />
                          <span>{m.phone}</span>
                        </div>
                        {m.address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{m.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => openCreateProduct(m.id)}
                        className="flex-1 inline-flex items-center justify-center gap-1 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold rounded-xl transition-all shadow-2xs active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-700" />
                        + Titipkan Jajanan
                      </button>
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-2xs active:scale-95"
                        title="Chat WhatsApp Mitra"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Consignment Products Table */}
        <div className="bg-white rounded-3xl shadow-card border border-stone-200/80 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                <Package className="w-4 h-4 text-warung-700" />
                2. Daftar Semua Produk Jajanan Titipan Aktif ({consignmentProducts.length})
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Kue basah, gorengan, snack, atau jajanan yang dititipkan oleh mitra.
              </p>
            </div>
            <button
              onClick={() => openCreateProduct()}
              className="inline-flex items-center gap-1 px-4 py-2 bg-warung-800 hover:bg-warung-900 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              + Tambah Jajanan
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200/80">
                <tr>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Jajanan Titipan</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Mitra Pembuat</th>
                  <th className="px-4 py-3.5 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">Harga</th>
                  <th className="px-4 py-3.5 text-center text-xs font-bold text-stone-500 uppercase tracking-wider">Stok</th>
                  <th className="px-4 py-3.5 text-center text-xs font-bold text-stone-500 uppercase tracking-wider">Terjual</th>
                  <th className="px-4 py-3.5 text-center text-xs font-bold text-stone-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {consignmentProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-stone-400 text-xs">
                      <span className="text-3xl block mb-2">🧁</span>
                      Belum ada jajanan titipan. Klik <strong>+ Tambah Jajanan Titipan</strong> di atas untuk memasukkan kue/snack titipan dari warga.
                    </td>
                  </tr>
                ) : (
                  consignmentProducts.map((p) => (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        deletingProductId === p.id ? 'animate-delete-row bg-rose-50' : 'hover:bg-cream-50/60'
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-11 h-11 rounded-xl object-cover border border-stone-200 shadow-2xs flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=80&q=60';
                            }}
                          />
                          <div>
                            <div className="font-extrabold text-stone-900 text-xs sm:text-sm line-clamp-1">{p.name}</div>
                            <span className="text-[11px] text-stone-400 font-semibold">per {p.unit}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-stone-800 text-xs">
                        <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg">
                          {p.consignmentMaker?.name || 'Mitra Titipan'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-black text-warung-900 text-xs sm:text-sm">
                        {formatRupiah(p.discountPrice ?? p.price)}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-xs text-stone-800">
                        {p.stock >= 999 ? 'Tersedia' : p.stock}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-xs text-emerald-700">
                        {p.soldCount}×
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditProduct(p)}
                            className="p-2 text-stone-600 hover:text-warung-800 hover:bg-warung-50 rounded-xl transition-all"
                            title="Edit Jajanan Titipan"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            disabled={deletingProductId === p.id}
                            className="p-2 text-stone-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-40"
                            title="Hapus Jajanan"
                          >
                            <Trash2 className={`w-4 h-4 ${deletingProductId === p.id ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= MODAL TAMBAH / EDIT MITRA ================= */}
      {showMakerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-floating border border-stone-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 bg-stone-50">
              <h2 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                {editMaker ? 'Edit Data Mitra' : 'Daftarkan Mitra Pembuat Baru'}
              </h2>
              <button
                onClick={() => setShowMakerModal(false)}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Nama Mitra / Pembuat <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={makerForm.name}
                  onChange={(e) => setMakerForm({ ...makerForm, name: e.target.value })}
                  placeholder="misal: Bu Siti (Kue Basah & Risoles)"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-warung-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Nomor HP / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={makerForm.phone}
                  onChange={(e) => setMakerForm({ ...makerForm, phone: e.target.value })}
                  placeholder="misal: 081298765432"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-warung-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Alamat Rumah / Lokasi
                </label>
                <input
                  type="text"
                  value={makerForm.address}
                  onChange={(e) => setMakerForm({ ...makerForm, address: e.target.value })}
                  placeholder="misal: RT 02 RW 04, Gg. Kenanga"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-warung-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Catatan Keahlian / Spesialisasi Jajanan
                </label>
                <textarea
                  rows={2}
                  value={makerForm.bio}
                  onChange={(e) => setMakerForm({ ...makerForm, bio: e.target.value })}
                  placeholder="misal: Spesialis risoles ragout lumer dan lemper ayam pulen..."
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-warung-500 resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-stone-100 flex gap-3 bg-stone-50">
              <button
                onClick={() => setShowMakerModal(false)}
                className="flex-1 py-2.5 bg-white border border-stone-200 text-stone-700 font-bold text-xs rounded-xl hover:bg-stone-100"
              >
                Batal
              </button>
              <button
                onClick={handleSaveMaker}
                className="flex-1 py-2.5 bg-warung-800 hover:bg-warung-900 text-white font-extrabold text-xs rounded-xl shadow-md active:scale-95"
              >
                {editMaker ? 'Simpan Perubahan' : 'Tambah Mitra'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL TAMBAH / EDIT JAJANAN TITIPAN ================= */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-stone-900/60 backdrop-blur-sm p-4 pt-6 sm:pt-10 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-floating border border-stone-100 overflow-hidden my-auto mb-10">
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 bg-amber-50/80">
              <h2 className="font-extrabold text-stone-900 text-base sm:text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                {editProduct ? 'Edit Jajanan Titipan' : 'Tambah Jajanan Titipan Baru'}
              </h2>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Mitra Pembuat Dropdown */}
              <div className="bg-amber-50/90 p-4 rounded-2xl border border-amber-200/90 space-y-1.5">
                <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider">
                  Pembuat Jajanan (Mitra) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={productForm.consignmentMakerId}
                  onChange={(e) => setProductForm({ ...productForm, consignmentMakerId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-amber-300 rounded-xl text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Pilih Mitra Pembuat --</option>
                  {makers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Foto Jajanan */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Foto Jajanan <span className="text-stone-400 font-normal">(Upload File Gambar)</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleProductImageUpload}
                  className="hidden"
                />

                {productForm.image ? (
                  <div className="flex items-center gap-4 p-3 bg-stone-50 border border-stone-200 rounded-2xl">
                    <img
                      src={productForm.image}
                      alt="Preview"
                      className="w-18 h-18 rounded-xl object-cover border border-stone-200 shadow-2xs flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block mb-1">
                        ✓ Foto Terpasang
                      </span>
                      <div className="flex gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-bold text-warung-800 hover:underline inline-flex items-center gap-1"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Ganti Foto
                        </button>
                        <span className="text-stone-300">•</span>
                        <button
                          type="button"
                          onClick={() => setProductForm({ ...productForm, image: '' })}
                          className="text-xs font-bold text-rose-600 hover:underline"
                        >
                          Hapus Foto
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-300 hover:border-warung-500 bg-cream-50/60 hover:bg-warung-50/30 rounded-2xl p-5 text-center cursor-pointer transition-all group"
                  >
                    {uploadingImage ? (
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="w-7 h-7 text-warung-700 animate-spin" />
                        <span className="text-xs font-bold text-warung-800">Mengunggah foto...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-xs border border-stone-200 flex items-center justify-center text-stone-500 group-hover:text-warung-700">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-warung-800 group-hover:underline">
                          Klik untuk upload foto jajanan
                        </span>
                        <p className="text-[10px] text-stone-400">Format JPG, PNG, WEBP (Maksimal 8MB)</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Nama Jajanan */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Nama Jajanan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Contoh: Risoles Ragout Ayam Lumer (Isi 3)"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-warung-500"
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Deskripsi / Rasa Jajanan
                </label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Jelaskan rasa, kelezatan, dan isian jajanan..."
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-warung-500 resize-none"
                />
              </div>

              {/* Harga & Satuan */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Harga Jual (Rp) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="15000"
                      className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-warung-500"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Harga Diskon (Rp)
                    </label>
                    <input
                      type="number"
                      value={productForm.discountPrice}
                      onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })}
                      placeholder="Opsional"
                      className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-warung-500"
                      min={0}
                    />
                  </div>
                </div>

                {/* Teks Satuan */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Satuan Jajanan
                  </label>
                  <input
                    type="text"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    placeholder="porsi / mika / box / pcs"
                    className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {QUICK_UNITS.map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setProductForm({ ...productForm, unit: u })}
                        className={`text-[11px] px-2.5 py-0.5 rounded-lg border font-semibold ${
                          productForm.unit === u
                            ? 'bg-warung-800 text-white border-warung-800'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stok Setting */}
                <div className="pt-2 border-t border-stone-200">
                  <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isUnlimitedStock}
                      onChange={(e) => setProductForm({ ...productForm, isUnlimitedStock: e.target.checked })}
                      className="w-4 h-4 text-warung-700 rounded border-stone-300 focus:ring-warung-500"
                    />
                    <span>Stok Selalu Tersedia Setiap Hari (Ready Stock)</span>
                  </label>
                  {!productForm.isUnlimitedStock && (
                    <div className="mt-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Jumlah Stok Hari Ini
                      </label>
                      <input
                        type="number"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        placeholder="20"
                        className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-sm font-bold"
                        min={0}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-stone-100 flex gap-3 bg-stone-50">
              <button
                onClick={() => setShowProductModal(false)}
                className="flex-1 py-3 bg-white border border-stone-200 text-stone-700 font-bold text-xs rounded-2xl hover:bg-stone-100"
              >
                Batal
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={uploadingImage}
                className="flex-1 py-3 bg-warung-800 hover:bg-warung-900 text-white font-extrabold text-xs rounded-2xl shadow-md active:scale-95 disabled:opacity-60"
              >
                {editProduct ? 'Simpan Perubahan' : 'Tambah Jajanan Titipan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminConsignmentPage;
