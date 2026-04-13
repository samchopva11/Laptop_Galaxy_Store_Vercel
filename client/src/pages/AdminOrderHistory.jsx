import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Pagination from '../components/Pagination';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const AdminOrderHistory = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);

  // State cho Confirm Modal
  const [confirmReturn, setConfirmReturn] = useState({ isOpen: false, orderId: null });

  // States cho Tìm kiếm, Phân trang & Sắp xếp
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const itemsPerPage = 6;

  useEffect(() => {
    if (loading) return;

    if (!user || !user.isAdmin) {
      navigate('/');
      return;
    }

    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const { data } = await axiosInstance.get('/api/orders');
      setOrders(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReturnOrder = (orderId) => {
    setConfirmReturn({ isOpen: true, orderId });
  };

  const executeReturnOrder = async () => {
    const orderId = confirmReturn.orderId;
    try {
      await axiosInstance.put(`/api/orders/${orderId}/status`, { status: 'Trả hàng' });
      showToast('Đã xác nhận trả hàng và hoàn kho thành công!');
      setConfirmReturn({ isOpen: false, orderId: null });
      fetchOrders(); // Tải lại danh sách
    } catch (error) {
      showToast(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Logic Xử lý: Lọc Đã Giao/Hủy -> Tìm kiếm -> Sắp xếp -> Phân trang
  const filteredOrders = orders.filter(order => {
    const isHistory = order.status === 'Đã giao' || order.status === 'Đã hủy' || order.status === 'Trả hàng';
    const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user?.name && order.user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return isHistory && matchesSearch;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'user') {
      aVal = a.user?.name || '';
      bVal = b.user?.name || '';
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div className="min-h-screen flex items-center justify-center neon-text">Đang truy xuất kho lưu trữ dữ liệu... 🛰️</div>;

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-8 text-pink-400">Lịch Sử Đơn Hàng</h2>

      {/* Chỉ số tóm tắt (Cho lịch sử) */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="galaxy-card p-4 rounded-xl border border-white/5 bg-green-500/10 min-w-[200px] flex-1">
          <p className="text-xs text-green-300 font-bold uppercase tracking-widest mb-1">Tổng Số Đơn Đã Giao</p>
          <p className="text-2xl font-black text-white">{orders.filter(o => o.status === 'Đã giao').length}</p>
        </div>
        <div className="galaxy-card p-4 rounded-xl border border-white/5 bg-red-500/10 min-w-[150px] flex-1">
          <p className="text-xs text-red-300 font-bold uppercase tracking-widest mb-1">Tổng Số Đơn Hủy</p>
          <p className="text-2xl font-black text-white">{orders.filter(o => o.status === 'Đã hủy').length}</p>
        </div>
        <div className="galaxy-card p-4 rounded-xl border border-white/5 bg-orange-500/10 min-w-[150px] flex-1">
          <p className="text-xs text-orange-300 font-bold uppercase tracking-widest mb-1">Đơn Trả Hàng</p>
          <p className="text-2xl font-black text-white">{orders.filter(o => o.status === 'Trả hàng').length}</p>
        </div>
      </div>

      <div className="galaxy-card p-6 rounded-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-white/10 pb-4">
          <div className="flex items-baseline gap-3">
            <h3 className="text-xl font-bold">Danh sách Lưu Trữ</h3>
            <span className="text-xs text-gray-400">({filteredOrders.length} bản ghi)</span>
          </div>

          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Tìm ID đơn hoặc tên khách..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white/10 border border-white/10 rounded-full py-2 px-4 pl-10 text-xs focus:outline-none focus:border-pink-500 transition-all font-medium"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 border-b border-white/10 text-[10px] uppercase tracking-wider">
                <th className="p-3 cursor-pointer hover:text-pink-400 transition-colors" onClick={() => handleSort('_id')}>ID {sortField === '_id' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th className="p-3 cursor-pointer hover:text-pink-400 transition-colors" onClick={() => handleSort('user')}>Khách Hàng {sortField === 'user' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th className="p-3 cursor-pointer hover:text-pink-400 transition-colors" onClick={() => handleSort('createdAt')}>Ngày Đặt {sortField === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th className="p-3 cursor-pointer hover:text-pink-400 transition-colors" onClick={() => handleSort('totalPrice')}>Tổng Tiền {sortField === 'totalPrice' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th className="p-3 cursor-pointer hover:text-pink-400 transition-colors" onClick={() => handleSort('status')}>Trạng Thái {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th className="p-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((order) => (
                <tr key={order._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-3 text-[13px] font-mono text-gray-400">{order._id}</td>
                  <td className="p-3 text-sm font-bold">{order.user?.name || 'Unknown'}</td>
                  <td className="p-3 text-xs">{order.createdAt.substring(0, 10)}</td>
                  <td className="p-3 text-sm text-[var(--color-neon-blue)]">{order.totalPrice.toLocaleString()}₫</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${order.status === 'Đã giao' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                      order.status === 'Trả hàng' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/admin/orders/${order._id}`} className="bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 px-3 py-1 rounded text-xs transition-colors">
                        Chi tiết
                      </Link>
                      {order.status === 'Đã giao' && (
                        <button
                          onClick={() => handleReturnOrder(order._id)}
                          className="bg-orange-600/20 hover:bg-orange-600 hover:text-white text-orange-400 px-3 py-1 rounded text-xs transition-all border border-orange-500/30 font-bold"
                        >
                          Trả Hàng
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-500 italic">Kho lưu trữ chưa có thông tin nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      <ConfirmModal
        isOpen={confirmReturn.isOpen}
        onClose={() => setConfirmReturn({ isOpen: false, orderId: null })}
        onConfirm={executeReturnOrder}
        title="Xác Nhận Trả Hàng"
        message="Bạn có chắc chắn muốn xác nhận trả hàng cho đơn này?"
      />
    </div>
  );
};

export default AdminOrderHistory;
