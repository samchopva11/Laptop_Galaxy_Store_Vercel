import { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Calendar,
  ArrowUpDown,
  ChevronRight,
  Package,
  CreditCard,
  MapPin,
  Clock,
  DollarSign
} from 'lucide-react';
import { formatDisplayPrice, parseNumericPrice } from '../utils/priceFormatter';
import Pagination from '../components/Pagination';

const MyOrders = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' or 'asc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login?redirect=myorders');
      return;
    }
    const fetchMyOrders = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/orders/myorders', config);
        setOrders(data);
      } catch (error) {
        console.error('Lỗi truyền tin:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, [user, navigate, authLoading]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, minPrice, maxPrice, day, month, year, sortOrder]);

  // Filtering Logic
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Search by ID
    if (searchTerm) {
      result = result.filter(order =>
        order._id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by Status
    if (statusFilter !== 'Tất cả') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Filter by Price
    if (minPrice || maxPrice) {
      const min = Number(parseNumericPrice(minPrice)) || 0;
      const max = Number(parseNumericPrice(maxPrice)) || Infinity;
      result = result.filter(order => order.totalPrice >= min && order.totalPrice <= max);
    }

    // Filter by Date
    if (day || month || year) {
      result = result.filter(order => {
        const date = new Date(order.createdAt);
        const d = date.getDate().toString();
        const m = (date.getMonth() + 1).toString();
        const y = date.getFullYear().toString();

        return (!day || d === day) && (!month || m === month) && (!year || y === year);
      });
    }

    // Sorting
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [orders, searchTerm, statusFilter, minPrice, maxPrice, day, month, year, sortOrder]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('Tất cả');
    setMinPrice('');
    setMaxPrice('');
    setDay('');
    setMonth('');
    setYear('');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  if (authLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Đang nhận diện danh tính phi hành gia... 🛰️</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 min-h-[70vh]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-pink-500/10 rounded-lg"><Package className="w-5 h-5 text-pink-400" /></div>
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Trạm rà soát hàng hóa</span>
          </div>
          <h2 className="text-4xl font-black neon-text uppercase tracking-tighter">Nhật Ký Vận Chuyển</h2>
        </div>
        <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
          <div className="text-right">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Tổng đơn hàng</p>
            <p className="text-2xl font-black text-white">{orders.length}</p>
          </div>
          <div className="w-px h-10 bg-white/10"></div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Tổng Đơn Khi Dùng Lọc</p>
            <p className="text-2xl font-black text-[var(--color-neon-blue)]">{filteredOrders.length}</p>
          </div>
        </div>
      </div>

      {/* Control Station (Filters) */}
      <div className="galaxy-card p-6 rounded-3xl mb-12 border border-white/5 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Search ID */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[var(--color-neon-blue)] transition-colors" />
            <input
              type="text"
              placeholder="Tìm mã chuyến..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[var(--color-neon-blue)] transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[var(--color-neon-blue)] transition-colors" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[var(--color-neon-blue)] transition-all appearance-none cursor-pointer"
            >
              <option value="Tất cả">Tất cả Trạng thái</option>
              <option value="Chờ xử lý">Chờ xử lý</option>
              <option value="Đang giao">Đang giao</option>
              <option value="Đã giao">Đã giao</option>
              <option value="Đã hủy">Đã hủy</option>
              <option value="Trả hàng">Trả hàng</option>
            </select>
          </div>

          {/* Price Filter */}
          <div className="flex items-center gap-2">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10"><DollarSign className="w-4 h-4 text-gray-400" /></div>
            <div className="grid grid-cols-2 gap-2 flex-grow">
              <input
                type="text"
                placeholder="Giá từ..."
                value={minPrice}
                onChange={(e) => setMinPrice(formatDisplayPrice(e.target.value))}
                className="bg-[#1a1a2e] border border-white/10 rounded-xl py-3 px-3 text-xs focus:outline-none focus:border-[var(--color-neon-blue)]"
              />
              <input
                type="text"
                placeholder="Đến..."
                value={maxPrice}
                onChange={(e) => setMaxPrice(formatDisplayPrice(e.target.value))}
                className="bg-[#1a1a2e] border border-white/10 rounded-xl py-3 px-3 text-xs focus:outline-none focus:border-[var(--color-neon-blue)]"
              />
            </div>
          </div>

          {/* Date Selector */}
          <div className="lg:col-span-2 flex items-center gap-2">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10"><Calendar className="w-4 h-4 text-gray-400" /></div>
            <div className="grid grid-cols-3 gap-2 flex-grow">
              <select value={day} onChange={e => setDay(e.target.value)} className="bg-[#1a1a2e] border border-white/10 rounded-xl py-3 px-3 text-xs focus:outline-none focus:border-[var(--color-neon-blue)]">
                <option value="">Ngày</option>
                {[...Array(31)].map((_, i) => (
                  <option key={i + 1} value={(i + 1).toString()}>{i + 1}</option>
                ))}
              </select>
              <select value={month} onChange={e => setMonth(e.target.value)} className="bg-[#1a1a2e] border border-white/10 rounded-xl py-3 px-3 text-xs focus:outline-none focus:border-[var(--color-neon-blue)]">
                <option value="">Tháng</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={(i + 1).toString()}>{i + 1}</option>
                ))}
              </select>
              <input
                type="number" placeholder="Năm..."
                value={year} onChange={e => setYear(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-xs focus:outline-none focus:border-[var(--color-neon-blue)]"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
          >
            <ArrowUpDown className="w-4 h-4" />
            Sắp xếp: {sortOrder === 'desc' ? 'Mới nhất' : 'Cũ nhất'}
          </button>
          <button
            onClick={resetFilters}
            className="text-xs font-bold text-[var(--color-neon-blue)] hover:underline"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--color-neon-blue)]/20 border-t-[var(--color-neon-blue)] rounded-full animate-spin"></div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Đang quét tầng sóng không gian...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Không tìm thấy dữ liệu phù hợp với bộ lọc hiện tại.</p>
          <button onClick={resetFilters} className="mt-4 text-[var(--color-neon-blue)] hover:underline font-bold">Quay lại đầy đủ</button>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((order) => (
            <div key={order._id} className="galaxy-card p-6 rounded-3xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 group hover:border-white/20 transition-all">
              <div className="flex items-start gap-6">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:border-[var(--color-neon-blue)]/30 transition-colors">
                  <Package className="w-8 h-8 text-[var(--color-neon-blue)]" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400 font-bold">MÃ CHUYẾN</span>
                    <p className="text-sm font-mono text-gray-300 font-bold tracking-tighter line-clamp-1">{order._id}</p>
                  </div>
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span className="font-bold text-white text-base">{(order.totalPrice || 0).toLocaleString()}₫</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{order.shippingAddress?.city || 'Trái Đất'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-6 w-full lg:w-auto">
                <div className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 border ${order.status === 'Đã giao' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                  order.status === 'Đã hủy' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    order.status === 'Chờ xử lý' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                      'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${order.status === 'Đã giao' ? 'bg-green-400' :
                    order.status === 'Đã hủy' ? 'bg-red-400' :
                      'bg-yellow-400'
                    }`}></div>
                  {order.status}
                </div>

                <Link to={`/orders/${order._id}`} className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest group-hover:text-[var(--color-neon-blue)] transition-colors cursor-pointer hover:text-white">
                  <span>Chi tiết hành trình</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination component */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredOrders.length / itemsPerPage)}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
};

export default MyOrders;
