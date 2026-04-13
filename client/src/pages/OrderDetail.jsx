import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, MapPin, CreditCard, Package, Clock, CheckCircle, XCircle, Home } from 'lucide-react';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login?redirect=`/orders/${id}`');
      return;
    }

    const fetchOrder = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`http://localhost:5000/api/orders/${id}`, config);
        setOrder(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, user, navigate, authLoading]);

  if (authLoading || loading) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-[var(--color-neon-blue)]/20 border-t-[var(--color-neon-blue)] rounded-full animate-spin"></div>
      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Đang giải mã tín hiệu đơn hàng... 🛰️</p>
    </div>
  );

  if (!order) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-4">
      <XCircle className="w-16 h-16 text-red-500 mb-2" />
      <h2 className="text-2xl font-bold text-white">Không tìm thấy đơn hàng</h2>
      <p className="text-gray-400 max-w-md">Chúng tôi không thể tìm thấy dữ liệu cho chuyến hàng này trong hệ thống.</p>
      <Link to="/myorders" className="mt-4 text-[var(--color-neon-blue)] hover:underline font-bold flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
      </Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:-translate-x-1 transition-all" />
          </button>
          <div>
            <h2 className="text-3xl font-black neon-text uppercase tracking-tighter">Chi Tiết Hành Trình</h2>
          </div>
        </div>
        <div className="bg-white/5 px-6 py-4 rounded-3xl border border-white/5 flex flex-col items-end">
          <p className="text-[10px] neon-text font-bold uppercase tracking-widest mb-1">Mã đơn hàng</p>
          <p className="text-lg font-mono font-bold text-[var(--color-neon-blue)]">{order._id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items Section */}
          <div className="galaxy-card p-6 md:p-8 rounded-3xl border border-white/5 bg-black/20">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-pink-500" />
                <h3 className="text-xl font-bold uppercase tracking-tight">Kiện hàng vận chuyển</h3>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border shadow-lg ${order.status === 'Đã giao' ? 'bg-green-500/20 text-green-400 border-green-500/30 shadow-green-900/10' :
                order.status === 'Đã hủy' ? 'bg-red-500/20 text-red-400 border-red-500/30 shadow-red-900/10' :
                  'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 shadow-yellow-900/10'
                }`}>
                {order.status === 'Đã giao' ? <CheckCircle className="w-3 h-3" /> :
                  order.status === 'Đã hủy' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {order.status}
              </div>
            </div>

            <div className="space-y-6">
              {order.orderItems.map((item, index) => (
                <div key={index} className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl shadow-lg border border-white/5" />
                    <span className="absolute -top-2 -right-2 bg-pink-600 text-[10px] font-black w-6 h-6 rounded-lg flex items-center justify-center border-2 border-[#0f0c29]">
                      {item.qty}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-100 mb-1 truncate">{item.name}</h4>
                    <div className="flex items-center gap-4">
                      <p className="text-xs text-gray-500">Đơn giá: <span className="text-gray-300 font-bold">{item.price.toLocaleString()}₫</span></p>
                      <span className="text-[var(--color-neon-blue)] font-black">{(item.price * item.qty).toLocaleString()}₫</span>
                    </div>
                  </div>
                  <Link to={`/product/${item.product}`} className="p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-pink-500/20" title="Xem sản phẩm">
                    <ArrowLeft className="w-4 h-4 text-pink-400 rotate-180" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Order Info (Mobile) / Tracking Timeline */}
          <div className="galaxy-card p-8 rounded-3xl border border-white/5 bg-black/20">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
              <Clock className="w-5 h-5 text-indigo-400" />
              Tiến độ vận chuyển
            </h3>
            <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
              <div className="relative">
                <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                <div>
                  <p className="text-sm font-bold text-white mb-1">Đã khởi tạo đơn hàng</p>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                </div>
              </div>
              {order.status !== 'Chờ xử lý' && order.status !== 'Đã hủy' && (
                <div className="relative text-gray-400">
                  <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
                  <p className="text-sm font-bold">Xác nhận đơn & Đang bàn giao</p>
                </div>
              )}
              {order.status === 'Đã giao' && (
                <div className="relative">
                  <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                  <p className="text-sm font-bold text-white">Chuyến hàng đã hạ cánh thành công</p>
                </div>
              )}
              {order.status === 'Đã hủy' && (
                <div className="relative">
                  <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]"></div>
                  <p className="text-sm font-bold text-red-400">Hành trình đã bị hủy bỏ</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Space Info */}
        <div className="space-y-8">
          {/* Shipping Address */}
          <div className="galaxy-card p-6 rounded-3xl border border-white/5 bg-black/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-500/10 rounded-xl"><MapPin className="w-5 h-5 text-red-400" /></div>
              <h3 className="font-bold uppercase tracking-widest text-sm">Địa Chỉ Tiếp Nhận</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Tọa độ đích</p>
                <p className="text-sm text-gray-200 leading-relaxed font-medium">{order.shippingAddress.address}</p>
                <p className="text-sm text-gray-400">{order.shippingAddress.city}, {order.shippingAddress.country}</p>
              </div>
              {order.user && (
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Người nhận tin</p>
                  <p className="text-sm text-white font-bold">{order.user.name}</p>
                  <p className="text-xs text-gray-500">{order.user.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Summary & Payment */}
          <div className="galaxy-card p-6 rounded-3xl border border-pink-500/20 bg-gradient-to-br from-black/40 to-pink-900/10 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-green-500/10 rounded-xl"><CreditCard className="w-5 h-5 text-green-400" /></div>
                <h3 className="font-bold uppercase tracking-widest text-sm">Tổng Kết Trạm</h3>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Phương thức</span>
                  <span className="text-white font-bold">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Trạng thái phí</span>
                  <span className={order.isPaid ? 'text-green-400 font-bold' : 'text-orange-400 font-bold'}>
                    {order.isPaid ? 'Đã kích hoạt' : 'Thanh toán khi nhận'}
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <div className="flex flex-col items-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Giá trị nhiệm vụ cuối cùng</p>
                  <p className="text-4xl font-black text-white shadow-pink-500/20 drop-shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                    {order.totalPrice.toLocaleString()}₫
                  </p>
                </div>
              </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-pink-500/5 blur-3xl rounded-full"></div>
          </div>

          {/* Customer Support Helper */}
          <div className="p-6 rounded-3xl border border-dashed border-white/10 text-center">
            <p className="text-xs text-gray-500 mb-4">Mọi thắc mắc về chuyến hàng này?</p>
            <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-gray-300 transition-all">
              Liên hệ Trạm Chỉ Huy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
