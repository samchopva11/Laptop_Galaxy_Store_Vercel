import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, Tags, LogOut, ClipboardList, Home, History } from 'lucide-react';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Quản Lý Danh Mục', path: '/admin/categories', icon: <Tags className="w-5 h-5" /> },
    { name: 'Quản Lý Sản Phẩm', path: '/admin/products', icon: <ShoppingBag className="w-5 h-5" /> },
    { name: 'Quản Lý Đơn Hàng', path: '/admin/orders', icon: <ClipboardList className="w-5 h-5" /> },
    { name: 'Lịch sử Đơn hàng', path: '/admin/order-history', icon: <History className="w-5 h-5" /> },
    { name: 'Quản Lý Người Dùng', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { name: 'Về Trang Người Dùng', path: '/', icon: <Home className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 galaxy-card flex flex-col border-r border-white/10 shrink-0">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold neon-text uppercase tracking-wider">
            Admin Panel
          </h2>
        </div>

        <nav className="flex-grow p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${isActive
                  ? 'bg-pink-600/30 text-pink-300 border border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="px-4 py-2 mb-2 flex items-center gap-3">
            {user?.avatar ? (
              <div className="w-10 h-10 rounded-full overflow-hidden border border-pink-500/30">
                <img src={user.avatar} alt="Admin" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-sm font-bold text-white border border-pink-500/30">
                {user?.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] text-gray-500 uppercase tracking-widest leading-none mb-1">Chỉ huy trạm</span>
              <span className="block text-sm font-bold text-[var(--color-neon-blue)] truncate" title={user?.name}>
                {user?.name}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" /> Đăng Xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow overflow-y-auto p-8 relative">
        {/* Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-galaxy-dark)] to-[var(--color-galaxy-purple)] -z-10 opacity-50 pointer-events-none"></div>
        <Outlet />
      </main>

      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={() => { logout(); navigate('/'); }}
        title="Xác nhận đăng xuất Admin"
        message="Ngài Chỉ Huy có chắc chắn muốn rời khỏi bảng điều khiển trung tâm?"
        type="danger"
      />
    </div>
  );
};

export default AdminLayout;
