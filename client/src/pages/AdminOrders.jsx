import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { formatDisplayPrice, parseNumericPrice } from '../utils/priceFormatter';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';

const AdminOrders = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);

  // States cho Tìm kiếm, Phân trang & Sắp xếp
  const [searchTerm, setSearchTerm] = useState('');
  const [minTotal, setMinTotal] = useState('');
  const [maxTotal, setMaxTotal] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const itemsPerPage = 5;

  // State cho Confirm Modal
  const [confirmCancel, setConfirmCancel] = useState({ isOpen: false, id: null });

  useEffect(() => {
    if (loading) return;

    if (!user || !user.isAdmin) {
      navigate('/');
      return;
    }

    const fetchOrders = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/orders', config);
        setOrders(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchOrders();
  }, [user, navigate]);

  const updateStatus = async (id, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/orders/${id}/status`, { status }, config);
      setOrders(orders.map(o => o._id === id ? { ...o, status } : o));
      showToast(`Cập nhật trạng thái: ${status} thành công! 🛸`);
    } catch (error) {
      showToast('Lỗi khi cập nhật trạng thái đơn hàng');
    }
  };

  const handleCancelOrder = (id) => {
    setConfirmCancel({ isOpen: true, id });
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

  // Logic Xử lý: Lọc Đang xử lý -> Tìm kiếm -> Sắp xếp -> Phân trang
  const filteredOrders = orders.filter(order => {
    const isActive = order.status !== 'Đã giao' && order.status !== 'Đã hủy';
    const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user?.name && order.user.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Lọc theo tổng tiền
    const min = Number(parseNumericPrice(minTotal)) || 0;
    const max = Number(parseNumericPrice(maxTotal)) || Infinity;
    const matchesPrice = order.totalPrice >= min && order.totalPrice <= max;

    return isActive && matchesSearch && matchesPrice;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    // Handle nested total field if needed or specific logic
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

  if (loading) return <div className="min-h-screen flex items-center justify-center neon-text">Đang kết nối trạm chỉ huy... 🛰️</div>;

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-8 text-pink-400">Đơn Hàng Đang Xử Lý</h2>

      {/* Chỉ số tóm tắt */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="galaxy-card p-4 rounded-xl border border-white/5 bg-indigo-500/10 min-w-[200px] flex-1">
          <p className="text-xs text-indigo-300 font-bold uppercase tracking-widest mb-1">Cần Xử Lý</p>
          <p className="text-2xl font-black text-white">{orders.filter(o => o.status === 'Chưa xử lý').length}</p>
        </div>
        <div className="galaxy-card p-4 rounded-xl border border-white/5 bg-yellow-500/10 min-w-[200px] flex-1">
          <p className="text-xs text-yellow-300 font-bold uppercase tracking-widest mb-1">Đang Giao Hàng</p>
          <p className="text-2xl font-black text-white">{orders.filter(o => o.status === 'Đang giao').length}</p>
        </div>
      </div>

      <div className="galaxy-card p-6 rounded-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-white/10 pb-4">
          <h3 className="text-xl font-bold">Danh sách Đơn Hàng</h3>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Lọc Giá */}
            <div className="flex items-center gap-1">
              <input
                type="text"
                placeholder="Tổng tiền từ..."
                value={minTotal}
                onChange={(e) => { setMinTotal(formatDisplayPrice(e.target.value)); setCurrentPage(1); }}
                className="w-32 bg-white/10 border border-white/10 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-pink-500"
              />
              <span className="text-gray-500">-</span>
              <input
                type="text"
                placeholder="đến..."
                value={maxTotal}
                onChange={(e) => { setMaxTotal(formatDisplayPrice(e.target.value)); setCurrentPage(1); }}
                className="w-32 bg-white/10 border border-white/10 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-pink-500"
              />
            </div>

            {/* Thanh Tìm Kiếm */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Tìm ID đơn hoặc tên khách..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full bg-white/10 border border-white/10 rounded-full py-2 px-4 pl-10 text-sm focus:outline-none focus:border-pink-500 transition-all font-medium"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>

            {(searchTerm || minTotal || maxTotal) && (
              <button
                onClick={() => { setSearchTerm(''); setMinTotal(''); setMaxTotal(''); setCurrentPage(1); }}
                className="text-xs text-red-400 hover:text-red-300 font-bold"
              >
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 border-b border-white/10 text-xs uppercase tracking-wider">
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
                <tr key={order._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3 text-sm">{order._id}</td>
                  <td className="p-3">{order.user?.name || 'Unknown'}</td>
                  <td className="p-3">{order.createdAt.substring(0, 10)}</td>
                  <td className="p-3 text-[var(--color-neon-blue)]">{order.totalPrice.toLocaleString()}₫</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'Đã giao' ? 'bg-green-500/20 text-green-300' :
                        order.status === 'Đã hủy' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-300'
                      }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2 text-center items-center">
                      <Link to={`/admin/orders/${order._id}`} className="bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 px-2 py-1 rounded text-xs transition-colors">Chi tiết</Link>
                      <button onClick={() => updateStatus(order._id, 'Đang giao')} className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 px-2 py-1 space-x-1 rounded text-xs transition-colors">Giao</button>
                      <button onClick={() => updateStatus(order._id, 'Đã giao')} className="bg-green-500/20 hover:bg-green-500/40 text-green-300 px-2 py-1 rounded text-xs transition-colors">Xong</button>
                      <button onClick={() => handleCancelOrder(order._id)} className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-2 py-1 rounded text-xs transition-colors">Hủy</button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500 italic">Không có tín hiệu đơn hàng nào khớp với tìm kiếm.</td>
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
        isOpen={confirmCancel.isOpen}
        onClose={() => setConfirmCancel({ isOpen: false, id: null })}
        onConfirm={() => updateStatus(confirmCancel.id, 'Đã hủy')}
        title="Hủy Đơn Hàng"
        message="Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này sẽ được ghi nhật ký và không thể hoàn tác."
      />
    </div>
  );
};

export default AdminOrders;
