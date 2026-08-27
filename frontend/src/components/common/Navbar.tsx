import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Store,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const navLinks = [
  { label: 'Beranda', to: '/' },
  { label: 'Semua Produk', to: '/produk' },
  { label: 'Titip Jajanan', to: '/penitipan' },
  { label: 'Tentang Kami', to: '/tentang' },
  { label: 'Kontak', to: '/kontak' },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [cartAnimate, setCartAnimate] = useState(false);

  const { totalItems } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll detection for enhanced navbar elevation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cart badge animation on item change
  useEffect(() => {
    if (totalItems > 0) {
      setCartAnimate(true);
      const timer = setTimeout(() => setCartAnimate(false), 400);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/produk?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-soft border-b border-stone-200/80'
            : 'bg-white border-b border-stone-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-10 h-10 bg-warung-800 group-hover:bg-warung-900 rounded-xl flex items-center justify-center text-white shadow-sm transition-colors">
                <Store className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-warung-900 text-base leading-tight">
                  Warung Lenira
                </span>
                <span className="text-[11px] font-medium text-stone-500 leading-tight">
                  Sembako & Jajanan Harian
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive =
                  link.to === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3.5 py-2 text-sm font-semibold rounded-xl transition-all duration-150 ${
                      isActive
                        ? 'bg-warung-50 text-warung-800'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Search Toggle */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2.5 rounded-xl transition-colors ${
                  showSearch
                    ? 'bg-warung-50 text-warung-800'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
                aria-label="Cari produk"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Cart Button */}
              <Link
                to="/keranjang"
                className="relative p-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-colors"
                aria-label="Keranjang belanja"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${
                      cartAnimate ? 'animate-cart-pop' : ''
                    }`}
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>

              {/* User Account / Auth */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200/80 rounded-xl text-sm font-semibold text-stone-700 transition-colors"
                  >
                    <div className="w-6 h-6 bg-warung-700 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline max-w-[100px] truncate text-xs">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-floating border border-stone-200/80 py-1.5 z-50 animate-scale-up">
                      <div className="px-4 py-2 border-b border-stone-100">
                        <div className="text-xs font-bold text-stone-800 truncate">{user.name}</div>
                        <div className="text-[11px] text-stone-400 truncate">{user.email}</div>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-warung-800 hover:bg-warung-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-warung-600" />
                          Dashboard Admin
                        </Link>
                      )}

                      <Link
                        to="/pesanan/track"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center justify-between px-4 py-2.5 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        <span>Cek Pesanan</span>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                      </Link>

                      <hr className="my-1 border-stone-100" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Keluar
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-warung-800 hover:bg-warung-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
                >
                  <User className="w-3.5 h-3.5" />
                  Masuk / Daftar
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-colors"
                aria-label="Buka menu"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Quick Search Dropdown Bar */}
          {showSearch && (
            <div className="py-3 border-t border-stone-100 animate-fade-in">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari basreng, kue basah, keripik, sembako..."
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-warung-500 focus:bg-white transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-warung-800 hover:bg-warung-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex-shrink-0"
                >
                  Cari
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="lg:hidden border-t border-stone-200/80 bg-white px-4 py-3 space-y-1 animate-fade-in">
            {navLinks.map((link) => {
              const isActive =
                link.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                    isActive
                      ? 'bg-warung-50 text-warung-800'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-stone-300" />
                </Link>
              );
            })}

            <hr className="border-stone-100 my-2" />

            {!user ? (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-warung-800 hover:bg-warung-900 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
              >
                <User className="w-4 h-4" />
                Masuk / Daftar Akun
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Keluar ({user.name.split(' ')[0]})
              </button>
            )}
          </div>
        )}
      </header>

      {/* Backdrop overlay for user dropdown */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
};

export default Navbar;
