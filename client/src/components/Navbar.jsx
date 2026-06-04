import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Laptop, LogOut } from 'lucide-react';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';
import { CartContext } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const location = useLocation();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="galaxy-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="relative w-10 h-10 overflow-hidden rounded-xl border border-[var(--color-primary-muted)]/30 group-hover:border-[var(--color-primary-bright)]/50 transition-all shadow-[0_0_15px_rgba(196,121,255,0.3)]">
                  <img src="/logo.png" alt="Galaxy Store Logo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <span className="text-xl font-black neon-text uppercase tracking-tighter">
                  Laptop Galaxy Store
                </span>
              </Link>
            </div>

            {/* Nav Links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link to="/" className={`px-3 py-2 rounded-md text-sm font-bold transition-all duration-300 ${isActive('/') ? 'text-[var(--color-primary-bright)] drop-shadow-[0_0_8px_var(--color-primary-bright)]' : 'hover:text-[var(--color-primary-bright)] text-gray-600'}`}>Trang chủ</Link>
                <Link to="/products" className={`px-3 py-2 rounded-md text-sm font-bold transition-all duration-300 ${isActive('/products') ? 'text-[var(--color-primary-bright)] drop-shadow-[0_0_8px_var(--color-primary-bright)]' : 'hover:text-[var(--color-primary-bright)] text-gray-600'}`}>Sản phẩm</Link>
                {user && (
                  <Link to="/myorders" className={`px-3 py-2 rounded-md text-sm font-bold transition-all duration-300 ${isActive('/myorders') ? 'text-[var(--color-primary-bright)] drop-shadow-[0_0_8px_var(--color-primary-bright)]' : 'hover:text-[var(--color-primary-bright)] text-gray-600'}`}>Đơn Hàng</Link>
                )}
                {user && user.isAdmin && (
                  <Link to="/admin" className={`px-3 py-2 rounded-md text-sm font-bold transition-all duration-300 ${isActive('/admin') ? 'text-[var(--color-primary-muted)] drop-shadow-[0_0_8px_var(--color-primary-muted)]' : 'text-[var(--color-primary-muted)] text-opacity-80 hover:text-[var(--color-primary-bright)]'}`}>Admin Area</Link>
                )}
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-4">
              <Link to="/cart" className={`flex items-center gap-2 transition-all duration-300 ${isActive('/cart') ? 'text-[var(--color-text-dark)] drop-shadow-[0_0_8px_rgba(42,27,56,0.3)]' : 'text-gray-600 hover:text-[var(--color-text-dark)]'}`}>
                <span className="text-sm font-bold">Giỏ hàng</span>
                <div className="relative">
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[var(--color-primary-bright)] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-[0_0_10px_var(--color-primary-bright)]">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>

              {user ? (
                <div className="flex items-center gap-3 ml-4">
                  <Link to="/profile" className={`flex flex-col items-end group transition-all duration-300 ${isActive('/profile') ? 'text-[var(--color-text-dark)]' : 'text-gray-600 hover:text-[var(--color-text-dark)]'}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-[var(--color-primary-bright)]">Hồ Sơ Phi Hành Gia</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold neon-text drop-shadow-[0_0_5px_var(--color-primary-bright)] hidden md:block">
                        {user.name}
                      </span>
                      {user.avatar ? (
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-[var(--color-primary-muted)]/30 group-hover:border-[var(--color-primary-bright)]/50 transition-all">
                          <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-primary-bright)] to-[var(--color-primary-muted)] flex items-center justify-center text-[10px] font-bold text-white border border-[var(--color-primary-muted)]/30 transition-all group-hover:scale-110">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={() => setIsLogoutConfirmOpen(true)}
                    className="p-2 bg-[var(--color-primary-muted)]/10 hover:bg-[var(--color-primary-muted)]/20 rounded-full transition-colors text-[var(--color-primary-bright)] group relative"
                  >
                    <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-[var(--color-primary-muted)]/30 text-[var(--color-text-dark)] shadow-md">Đăng Xuất</span>
                  </button>
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-3 neon-button px-4 py-2 rounded-xl text-xs font-bold transition-all hover:shadow-[0_0_15px_rgba(196,121,255,0.5)]">
                  <User className="w-5 h-5 text-white" />
                  <div className="flex flex-col text-left leading-none tracking-wide text-white">
                    <span className="mb-1">Đăng nhập</span>
                    <span className="w-full h-[1px] bg-white/50 block mb-1"></span>
                    <span>Đăng ký</span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={logout}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn thoát khỏi trạm không?"
        type="danger"
      />
    </>
  );
};

export default Navbar;
