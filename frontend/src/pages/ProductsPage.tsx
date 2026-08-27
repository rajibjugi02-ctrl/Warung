import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { api } from '../services/api';
import { Product, Category } from '../types';
import ProductCard from '../components/product/ProductCard';
import { ProductSkeleton } from '../components/common/Skeletons';

const sortOptions = [
  { value: 'createdAt', label: 'Terbaru' },
  { value: 'popularity', label: 'Terpopuler' },
  { value: 'price_asc', label: 'Harga Terendah' },
  { value: 'price_desc', label: 'Harga Tertinggi' },
  { value: 'rating', label: 'Rating Tertinggi' },
];

interface ProductsPageProps {
  snackOnly?: boolean;
}

const ProductsPage: React.FC<ProductsPageProps> = ({ snackOnly = false }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sortBy') || 'createdAt';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentIsNew = searchParams.get('isNewArrival') === 'true';

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentSearch) params.set('search', currentSearch);
      if (currentCategory) params.set('category', currentCategory);
      if (currentSort) params.set('sortBy', currentSort);
      if (currentIsNew) params.set('isNewArrival', 'true');
      if (snackOnly && !currentCategory) params.set('category', 'jajanan');
      params.set('page', String(currentPage));
      params.set('limit', '12');

      const res = await api.get(`/products?${params.toString()}`);
      const data = res.data.data;
      setProducts(data.products || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentSearch, currentCategory, currentSort, currentPage, currentIsNew, snackOnly]);

  useEffect(() => {
    api.get('/categories').then((res) => {
      setCategories(res.data.data || []);
    });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchInput);
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(currentSearch || currentCategory || currentSort !== 'createdAt' || currentIsNew);

  return (
    <div className="min-h-screen bg-cream-50 pb-16">
      {/* Top Filter & Search Header */}
      <div className="bg-white border-b border-stone-200/80 sticky top-16 z-30 shadow-subtle backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={snackOnly ? 'Cari basreng, keripik, kue...' : 'Cari produk jajanan & sembako...'}
                  className="w-full pl-10 pr-9 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-warung-500 focus:bg-white transition-all"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      updateParam('search', '');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-warung-800 hover:bg-warung-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex-shrink-0 active:scale-95"
              >
                Cari
              </button>
            </form>

            {/* Sort & Quick Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-stone-400 hidden sm:inline">Urutkan:</span>
              <select
                value={currentSort}
                onChange={(e) => updateParam('sortBy', e.target.value)}
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-warung-500 transition-all cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Chips Horizontal Scroll */}
          <div className="flex items-center gap-1.5 pt-3 overflow-x-auto no-scrollbar">
            <button
              onClick={() => updateParam('category', '')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                !currentCategory
                  ? 'bg-warung-800 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              }`}
            >
              Semua Menu
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateParam('category', cat.slug)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                  currentCategory === cat.slug
                    ? 'bg-warung-800 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Catalog Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Results Header & Active Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="text-xs sm:text-sm text-stone-500 font-medium">
            Menampilkan <span className="font-bold text-stone-900">{products.length}</span> dari{' '}
            <span className="font-bold text-stone-900">{total}</span> produk
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {currentSearch && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-stone-200 text-stone-700 text-xs rounded-md shadow-2xs">
                  Pencarian: "{currentSearch}"
                  <button onClick={() => updateParam('search', '')} className="text-stone-400 hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {currentCategory && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-stone-200 text-stone-700 text-xs rounded-md shadow-2xs">
                  Kategori: {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
                  <button onClick={() => updateParam('category', '')} className="text-stone-400 hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 underline ml-1"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array(8).fill(null).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200/80 p-8 shadow-card">
            <span className="text-5xl mb-3 block">🔍</span>
            <h3 className="text-lg font-bold text-stone-800 mb-1">Produk Tidak Ditemukan</h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mb-6">
              Maaf, kami tidak dapat menemukan produk yang sesuai dengan filter atau kata kunci Anda.
            </p>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 bg-warung-800 hover:bg-warung-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              Tampilkan Semua Produk
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-fade-in">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => updateParam('page', String(currentPage - 1))}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 px-3.5 py-2 bg-white border border-stone-200 text-stone-700 text-xs font-bold rounded-xl hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Sebelumnya
            </button>

            <span className="text-xs text-stone-500 font-semibold px-3">
              Halaman {currentPage} dari {totalPages}
            </span>

            <button
              onClick={() => updateParam('page', String(currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 px-3.5 py-2 bg-white border border-stone-200 text-stone-700 text-xs font-bold rounded-xl hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Berikutnya
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
