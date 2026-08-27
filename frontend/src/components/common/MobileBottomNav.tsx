import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, Clock, User } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  const { user } = useAuth();

  // Hide on admin routes or checkout / payment to keep focused checkout experience
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/payment')) {
    return null;
  }

  const navItems = [
    {
      label: 'Beranda',
      to: '/',
      icon: Home,
      isActive: location.pathname === '/',
    },
    {
      label: 'Produk',
      to: '/produk',
      icon: ShoppingBag,
      isActive: location.pathname.startsWith('/produk') || location.pathname === '/jajanan',
    },
    {
      label: 'Keranjang',
      to: '/keranjang',
      icon: ShoppingCart,
      isActive: location.pathname === '/keranjang' || location.pathname === '/checkout',
      badge: totalItems,
    },
    {
      label: 'Lacak',
      to: '/pesanan/track',
      icon: Clock,
      isActive: location.pathname.startsWith('/pesanan'),
    },
    {
      label: user ? 'Profil' : 'Masuk',
      to: user ? '/login' : '/login',
      icon: User,
      isActive: location.pathname === '/login' || location.pathname === '/register',
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 relative ${
                item.isActive
                  ? 'text-warung-800 font-bold scale-105'
                  : 'text-stone-500 hover:text-stone-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${item.isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-cart-pop">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">
                {item.label}
              </span>
              {item.isActive && (
                <span className="w-1.5 h-1.5 bg-warung-700 rounded-full mt-0.5 animate-scale-up" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
