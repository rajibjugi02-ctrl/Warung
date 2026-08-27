import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X, Check, Upload, Image as ImageIcon, RefreshCw, Layers, Sparkles, Infinity, Tag } from 'lucide-react';
import { AdminLayout } from './AdminDashboardPage';
import { api } from '../../services/api';
import { Product, Category, ProductVariant } from '../../types';
import { formatRupiah } from '../../utils/format';
import { useToast } from '../../contexts/ToastContext';

const QUICK_UNITS = ['kg', 'liter', 'karung', 'bungkus', 'porsi', 'botol', 'pcs', 'butir', 'ikat', 'mika', 'dus', 'cup'];

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [makers, setMakers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { showToast } = useToast();

  const blankForm = {
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    stock: '50',
    isUnlimitedStock: true, // Default: Selalu tersedia tanpa batas
    image: '',
    unit: 'kg',
    categoryId: '',
    isActive: true,
    isBestSeller: false,
    isNewArrival: true,
    isConsignment: false,
    consignmentMakerId: '',
    variants: [] as any[],
  };

  const [form, setForm] = useState<any>(blankForm);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/admin/products');
      setProducts(res.data.data || []);
    } catch {
      showToast('Gagal memuat produk.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    api.get('/categories').then((res) => setCategories(res.data.data || []));
    api.get('/admin/consignments/makers').then((res) => setMakers(res.data.data || []));
  }, []);

  const openEdit = (product: Product) => {
    setEditProduct(product);
    let parsedVariants: any[] = [];
    if (product.variants) {
      try {
        parsedVariants = typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants;
      } catch {
        parsedVariants = [];
      }
    }

    const isUnlimited = product.stock >= 999;

    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      discountPrice: product.discountPrice ? String(product.discountPrice) : '',
      stock: isUnlimited ? '50' : String(product.stock),
      isUnlimitedStock: isUnlimited,
      image: product.image,
      unit: product.unit || 'kg',
      categoryId: product.categoryId,
      isActive: product.isActive,
      isBestSeller: product.isBestSeller,
      isNewArrival: product.isNewArrival,
      isConsignment: Boolean(product.isConsignment),
      consignmentMakerId: product.consignmentMakerId || '',
      variants: parsedVariants || [],
    });
    setShowUrlInput(false);
    setShowModal(true);
  };

  const openCreate = () => {
    setEditProduct(null);
    setForm({ ...blankForm, categoryId: categories[0]?.id || '', variants: [] });
    setShowUrlInput(false);
    setShowModal(true);
  };

  const addVariant = () => {
    const defaultName = form.variants?.length === 0 ? 'per liter' : form.variants?.length === 1 ? 'karung 5 kg' : 'karung 25 kg';
    setForm({
      ...form,
      variants: [
        ...(form.variants || []),
        {
          id: Date.now().toString(),
          name: defaultName,
          unit: defaultName,
          price: form.price || '',
          discountPrice: '',
          stock: 999,
        },
      ],
    });
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const updated = [...(form.variants || [])];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, variants: updated });
  };

  const removeVariant = (index: number) => {
    const updated = [...(form.variants || [])];
    updated.splice(index, 1);
    setForm({ ...form, variants: updated });
  };

  // Handle file selection and upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            name: form.name || 'produk',
          });
          if (res.data.success && res.data.data?.url) {
            setForm((prev: any) => ({ ...prev, image: res.data.data.url }));
            showToast('Foto produk berhasil diunggah! 📸', 'success');
          }
        } catch {
          setForm((prev: any) => ({ ...prev, image: base64Data }));
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

  const handleSave = async () => {
    if (!form.name || !form.price || !form.categoryId) {
      showToast('Nama produk, harga utama, dan kategori wajib diisi.', 'error');
      return;
    }

    // Clean up variants format if present
    const cleanedVariants = (form.variants || []).filter((v: any) => v.name && v.price).map((v: any) => ({
      id: v.id || Date.now().toString(),
      name: v.name,
      unit: v.unit || v.name,
      price: Number(v.price),
      discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
      stock: form.isUnlimitedStock ? 999 : (Number(v.stock) || 50),
    }));

    const finalStock = form.isUnlimitedStock ? 9999 : (Number(form.stock) || 0);

    const payload = {
      ...form,
      stock: finalStock,
      variants: cleanedVariants.length > 0 ? cleanedVariants : null,
    };

    try {
      if (editProduct) {
        await api.put(`/admin/products/${editProduct.id}`, payload);
        showToast('Produk berhasil diperbarui!', 'success');
      } else {
        await api.post('/admin/products', payload);
        showToast('Produk baru berhasil ditambahkan!', 'success');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan produk.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      showToast('Produk berhasil dihapus.', 'success');
      fetchProducts();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menghapus produk.', 'error');
    }
  };

  const handleToggle = async (product: Product) => {
    try {
      await api.put(`/admin/products/${product.id}`, { isActive: !product.isActive });
      showToast(`Produk ${!product.isActive ? 'diaktifkan' : 'dinonaktifkan'}.`);
      fetchProducts();
    } catch {
      showToast('Gagal mengubah status produk.', 'error');
    }
  };

  return (
    <AdminLayout title="Manajemen Produk">
      {/* Header actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="text-xs sm:text-sm text-stone-500">
          Total: <strong className="text-stone-900 font-bold">{products.length}</strong> produk di katalog
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-warung-800 hover:bg-warung-900 text-white text-xs sm:text-sm font-bold rounded-2xl transition-all shadow-md active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk Baru
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-card border border-stone-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200/80">
              <tr>
                <th className="px-4 py-3.5 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Produk</th>
                <th className="px-4 py-3.5 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Kategori</th>
                <th className="px-4 py-3.5 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">Harga & Satuan</th>
                <th className="px-4 py-3.5 text-center text-xs font-bold text-stone-500 uppercase tracking-wider">Stok</th>
                <th className="px-4 py-3.5 text-center text-xs font-bold text-stone-500 uppercase tracking-wider">Terjual</th>
                <th className="px-4 py-3.5 text-center text-xs font-bold text-stone-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 text-center text-xs font-bold text-stone-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                Array(6).fill(null).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3.5"><div className="h-4 bg-stone-100 rounded w-48" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 bg-stone-100 rounded w-20" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 bg-stone-100 rounded w-16 ml-auto" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 bg-stone-100 rounded w-10 mx-auto" /></td>
                    <td className="px-4 py-3.5"><div className="h-4 bg-stone-100 rounded w-10 mx-auto" /></td>
                    <td className="px-4 py-3.5"><div className="h-6 bg-stone-100 rounded-full w-16 mx-auto" /></td>
                    <td className="px-4 py-3.5"><div className="h-6 bg-stone-100 rounded w-16 mx-auto" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone-500">
                    <span className="text-3xl block mb-2">🍱</span>
                    Belum ada produk. Silakan klik <strong>Tambah Produk Baru</strong> di atas.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  let variantsArr: ProductVariant[] = [];
                  if (product.variants) {
                    try {
                      variantsArr = typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants;
                    } catch {
                      variantsArr = [];
                    }
                  }

                  const isUnlimited = product.stock >= 999;

                  return (
                    <tr key={product.id} className="hover:bg-cream-50/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image || 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=80&auto=format&fit=crop&q=60'}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover border border-stone-200 shadow-2xs flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=80&q=60'; }}
                          />
                          <div>
                            <div className="font-extrabold text-stone-900 line-clamp-1">{product.name}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs text-stone-500 font-semibold bg-stone-100 px-2 py-0.5 rounded-md">
                                per {product.unit}
                              </span>
                              {variantsArr.length > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                                  <Layers className="w-2.5 h-2.5" />
                                  +{variantsArr.length} Opsi
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-stone-600 font-medium">{product.category?.name || '-'}</td>
                      <td className="px-4 py-3.5 text-right font-black text-warung-900">
                        {variantsArr.length > 0 ? (
                          <div>
                            <div>{formatRupiah(product.discountPrice ?? product.price)}</div>
                            <span className="text-[10px] text-stone-400 font-normal">
                              ({product.unit}, {variantsArr.map((v) => v.name).join(', ')})
                            </span>
                          </div>
                        ) : (
                          formatRupiah(product.discountPrice ?? product.price)
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {isUnlimited ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <Infinity className="w-3.5 h-3.5" />
                            Tersedia
                          </span>
                        ) : (
                          <span className={`font-bold ${product.stock === 0 ? 'text-rose-600' : product.stock < 5 ? 'text-amber-600' : 'text-stone-800'}`}>
                            {product.stock}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center text-stone-500 font-medium">{product.soldCount}</td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => handleToggle(product)}
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full transition-all ${
                            product.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                          }`}
                        >
                          {product.isActive ? <ToggleRight className="w-3.5 h-3.5 text-emerald-700" /> : <ToggleLeft className="w-3.5 h-3.5 text-stone-400" />}
                          {product.isActive ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEdit(product)}
                            className="p-2 text-stone-600 hover:text-warung-800 hover:bg-warung-50 rounded-xl transition-all"
                            title="Edit Produk"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-stone-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-stone-900/60 backdrop-blur-sm p-4 pt-6 sm:pt-10 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-floating border border-stone-100 overflow-hidden my-auto mb-10">
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 bg-stone-50/80">
              <h2 className="font-extrabold text-stone-900 text-base sm:text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-warung-600" />
                {editProduct ? 'Edit Data Produk' : 'Tambah Produk Baru'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition-all"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Product Photo Upload Section */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Foto Produk <span className="text-stone-400 font-normal">(Upload File Gambar)</span>
                </label>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {form.image ? (
                  <div className="flex items-center gap-4 p-3 bg-stone-50 border border-stone-200 rounded-2xl">
                    <img
                      src={form.image}
                      alt="Preview"
                      className="w-20 h-20 rounded-xl object-cover border border-stone-200 shadow-2xs flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block mb-1">
                        ✓ Foto Terpasang
                      </span>
                      <p className="text-[11px] text-stone-400 truncate max-w-xs">{form.image}</p>
                      <div className="flex gap-2 mt-2">
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
                          onClick={() => setForm({ ...form, image: '' })}
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
                    className="border-2 border-dashed border-stone-300 hover:border-warung-500 bg-cream-50/60 hover:bg-warung-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all group"
                  >
                    {uploadingImage ? (
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="w-8 h-8 text-warung-700 animate-spin" />
                        <span className="text-xs font-bold text-warung-800">Mengunggah foto...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-xs border border-stone-200 flex items-center justify-center text-stone-500 group-hover:text-warung-700 group-hover:scale-105 transition-all">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-warung-800 group-hover:underline">
                            Klik di sini untuk upload foto produk
                          </span>
                          <p className="text-[11px] text-stone-400 mt-0.5">Mendukung format JPG, PNG, WEBP (Maksimal 8MB)</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Option to toggle URL link if ever needed */}
                <div className="mt-1.5 text-right">
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[11px] text-stone-400 hover:text-stone-600 underline"
                  >
                    {showUrlInput ? 'Tutup input link URL' : 'Atau gunakan tautan link gambar web'}
                  </button>
                </div>

                {showUrlInput && (
                  <div className="mt-2 animate-fade-in">
                    <input
                      type="url"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-warung-500"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Nama Produk <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-warung-500 focus:bg-white transition-all"
                  placeholder="Contoh: Beras Raja Lele Premium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Deskripsi Produk
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-warung-500 focus:bg-white transition-all resize-none"
                  placeholder="Jelaskan rasa, kualitas, bahan baku, berat, dan keunggulan produk..."
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Kategori Menu <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-warung-500 focus:bg-white transition-all"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Primary Price & Custom Unit Text */}
              <div className="bg-stone-50/90 p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-3.5">
                <div className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-warung-700" />
                  Harga & Satuan Utama (Default)
                </div>

                {/* Custom Unit Text with Quick Chips */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Teks Satuan <span className="text-stone-400 font-normal">(Bisa ketik bebas, misal: kg, liter, karung, porsi...)</span>
                  </label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    placeholder="misal: kg / liter / porsi / bungkus"
                    className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-warung-500"
                  />
                  {/* Quick Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[11px] text-stone-400 self-center mr-1">Pilihan cepat:</span>
                    {QUICK_UNITS.map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setForm({ ...form, unit: u })}
                        className={`text-[11px] px-2.5 py-0.5 rounded-lg border font-semibold transition-all ${
                          form.unit?.toLowerCase() === u
                            ? 'bg-warung-800 text-white border-warung-800'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Harga Normal (Rp) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-warung-500"
                      placeholder="misal: 15000"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Harga Diskon (Rp)
                    </label>
                    <input
                      type="number"
                      value={form.discountPrice}
                      onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-warung-500"
                      placeholder="Opsional"
                      min={0}
                    />
                  </div>
                </div>

                {/* Stock Setting: Unlimited or Exact Number */}
                <div className="pt-2 border-t border-stone-200/70">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isUnlimitedStock}
                        onChange={(e) => setForm({ ...form, isUnlimitedStock: e.target.checked })}
                        className="w-4 h-4 text-warung-700 rounded border-stone-300 focus:ring-warung-500 cursor-pointer"
                      />
                      <span>Stok Selalu Tersedia (Tidak Perlu Batasan Stok)</span>
                    </label>
                  </div>
                  {!form.isUnlimitedStock && (
                    <div className="mt-2.5 animate-fade-in">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Jumlah Stok Tersedia
                      </label>
                      <input
                        type="number"
                        value={form.stock}
                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-warung-500"
                        placeholder="20"
                        min={0}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Extra Unit Choices (Varian Pilihan Lain) */}
              <div className="bg-amber-50/60 p-4 sm:p-5 rounded-2xl border border-amber-200/80">
                <div className="flex items-center justify-between mb-2.5">
                  <div>
                    <div className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-700" />
                      Pilihan Satuan Lainnya (Opsional)
                    </div>
                    <p className="text-[11px] text-amber-800/80 mt-0.5">
                      Contoh: Produk Beras harga utama per kg (Rp 15.000), tambahkan pilihan <strong>per liter</strong> (Rp 14.000) atau <strong>karung 5 kg</strong> (Rp 72.000).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95 flex-shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Tambah Pilihan
                  </button>
                </div>

                {form.variants && form.variants.length > 0 ? (
                  <div className="space-y-2.5 mt-3">
                    {form.variants.map((v: any, idx: number) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-amber-200/90 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-amber-900">
                            Pilihan #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeVariant(idx)}
                            className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline"
                          >
                            Hapus
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                              Teks Pilihan Satuan (Bebas) *
                            </label>
                            <input
                              type="text"
                              value={v.name}
                              onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                              placeholder="misal: per liter / karung 5 kg"
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                              Harga (Rp) *
                            </label>
                            <input
                              type="number"
                              value={v.price}
                              onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                              placeholder="14000"
                              min={0}
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-2.5 text-xs text-amber-800/70 font-medium">
                    Belum ada pilihan satuan tambahan. Klik <strong>+ Tambah Pilihan</strong> jika ingin pembeli bisa memilih satuan lain.
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { key: 'isActive', label: 'Produk Aktif' },
                  { key: 'isBestSeller', label: '🔥 Best Seller' },
                  { key: 'isNewArrival', label: '✨ Produk Baru' },
                  { key: 'isConsignment', label: '🤝 Titipan Mitra' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      const nextVal = !form[key];
                      setForm({
                        ...form,
                        [key]: nextVal,
                        // if turning off consignment, clear maker
                        consignmentMakerId: key === 'isConsignment' && !nextVal ? '' : form.consignmentMakerId,
                      });
                    }}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl border text-xs font-bold transition-all ${
                      form[key]
                        ? 'bg-warung-800 text-white border-warung-800 shadow-xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <span>{label}</span>
                    {form[key] ? <Check className="w-4 h-4 stroke-[3px]" /> : <X className="w-4 h-4 opacity-30" />}
                  </button>
                ))}
              </div>

              {/* Consignment Maker Dropdown (if isConsignment is checked) */}
              {form.isConsignment && (
                <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200/90 space-y-2 animate-fade-in">
                  <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider">
                    Pilih Pembuat Jajanan Titipan (Mitra) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.consignmentMakerId}
                    onChange={(e) => setForm({ ...form, consignmentMakerId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-amber-300 rounded-xl text-xs sm:text-sm font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">-- Pilih Mitra Pembuat (Ibu-Ibu / Produsen) --</option>
                    {makers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.phone})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-amber-800/80">
                    Jajanan ini akan otomatis terhubung ke laporan penjualan dan profil mitra tersebut.
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-stone-100 flex gap-3 bg-stone-50">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-white border border-stone-200 text-stone-700 font-bold text-xs rounded-2xl transition-all hover:bg-stone-100"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={uploadingImage}
                className="flex-1 py-3 bg-warung-800 hover:bg-warung-900 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-60"
              >
                {editProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProductsPage;
