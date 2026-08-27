import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Package, Handshake, Check } from 'lucide-react';
import { Product } from '../../types';
import { formatRupiah } from '../../utils/format';
import { useCart } from '../../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  let variantsList: any[] = [];
  if (product.variants) {
    try {
      variantsList = typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants;
    } catch {
      variantsList = [];
    }
  }

  const firstVariant = variantsList.length > 0 ? variantsList[0] : null;
  const displayPrice = firstVariant
    ? (firstVariant.discountPrice ?? firstVariant.price)
    : (product.discountPrice ?? product.price);
  const isOutOfStock = product.stock === 0 && (!firstVariant || firstVariant.stock === 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock && !justAdded) {
      addToCart(product, 1, firstVariant);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1200);
    }
  };

  return (
    <Link
      to={`/produk/${product.slug || product.id}`}
      className="group flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-stone-200/80 shadow-subtle hover:shadow-hover hover:border-warung-300 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden relative"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-stone-100 aspect-square w-full">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108 ${
            isOutOfStock ? 'opacity-50 grayscale' : ''
          }`}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&auto=format&fit=crop&q=60';
          }}
        />

        {/* Stock-out overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white/95 text-stone-800 text-[11px] font-extrabold px-3.5 py-1.5 rounded-full shadow-md">
              Stok Habis
            </span>
          </div>
        )}

        {/* Badges top left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.isBestSeller && (
            <span className="inline-flex items-center gap-1 bg-amber-500 text-stone-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg shadow-sm">
              🔥 Terlaris
            </span>
          )}
          {product.isNewArrival && !product.isBestSeller && (
            <span className="inline-flex items-center gap-1 bg-warung-800 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-lg shadow-sm">
              ✨ Baru
            </span>
          )}
          {product.isConsignment && (
            <span className="inline-flex items-center gap-1 bg-white/95 text-warung-900 border border-stone-200/80 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-xs backdrop-blur-sm">
              <Handshake className="w-3 h-3 text-amber-600" />
              Titipan
            </span>
          )}
        </div>

        {/* Discount badge top right */}
        {product.discountPrice && product.discountPrice < product.price && (
          <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
            <span className="bg-rose-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-lg shadow-sm">
              -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4">
        {/* Category & Rating */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] font-bold text-warung-700 bg-warung-50 px-2 py-0.5 rounded-md uppercase tracking-wider truncate">
            {product.category?.name || 'Jajanan'}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-stone-600 flex-shrink-0">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-bold text-stone-800">{product.rating.toFixed(1)}</span>
            <span className="text-stone-400 text-[10px]">({product.reviewCount})</span>
          </div>
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-stone-800 text-xs sm:text-sm leading-snug line-clamp-2 mb-2 group-hover:text-warung-800 transition-colors">
          {product.name}
        </h3>

        {/* Unit & Sold */}
        <div className="flex items-center gap-2 text-[11px] text-stone-400 mb-3 mt-auto flex-wrap">
          <span className="flex items-center gap-1">
            <Package className="w-3 h-3 text-stone-400" />
            {variantsList.length > 0 ? (
              <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 text-[10px]">
                {variantsList.length} Pilihan Satuan
              </span>
            ) : isOutOfStock ? (
              <span className="text-rose-500 font-bold">Habis</span>
            ) : (
              <span>Sisa {product.stock} {product.unit}</span>
            )}
          </span>
          {!isOutOfStock && product.soldCount > 0 && (
            <>
              <span className="text-stone-300">•</span>
              <span>Terjual {product.soldCount}</span>
            </>
          )}
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100">
          <div>
            <div className="font-extrabold text-warung-900 text-sm sm:text-base leading-none">
              {variantsList.length > 0 ? `Mulai ${formatRupiah(displayPrice)}` : formatRupiah(displayPrice)}
            </div>
            {product.discountPrice && product.discountPrice < product.price && (
              <div className="text-[10px] text-stone-400 line-through mt-0.5">
                {formatRupiah(product.price)}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || justAdded}
            className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 flex-shrink-0 active:scale-90 shadow-sm ${
              justAdded
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : isOutOfStock
                ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                : 'bg-warung-800 hover:bg-warung-900 text-white shadow-warung-900/20 hover:scale-105'
            }`}
            title={isOutOfStock ? 'Stok Habis' : justAdded ? 'Berhasil Ditambahkan' : 'Tambah ke Keranjang'}
          >
            {justAdded ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
