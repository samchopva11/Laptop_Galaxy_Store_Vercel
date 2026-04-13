import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, User, MapPin, CreditCard, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // State cho Confirm Modal
  const [confirmReturn, setConfirmReturn] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !user.isAdmin) {
      navigate('/');
      return;
    }

    const fetchOrder = async () => {
      try {
        const { data } = await axiosInstance.get(`/api/orders/${id}`);
        setOrder(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, user, navigate, authLoading]);

  const handleReturnOrder = () => {
    setConfirmReturn(true);
  };

  const confirmReturnAction = async () => {
    try {
      await axiosInstance.put(`/api/orders/${id}/status`, { status: 'Trả hàng' });
      showToast('Đã xác nhận trả hàng và hoàn kho thành công!');
      // Tải lại dữ liệu đơn hàng
      const { data } = await axiosInstance.get(`/api/orders/${id}`);
      setOrder(data);
    } catch (error) {
      showToast(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  if (authLoading || loading) return <div className="text-center py-20 neon-text">Đang giải mã tín hiệu đơn hàng... 🛰️</div>;
  if (!order) return <div className="text-center py-20 text-red-400">Không tìm thấy dữ liệu đơn hàng này.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header & Quay lại */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold">Quay lại</span>
        </button>
        <div className="text-right">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Chi Tiết Đơn Hàng</h2>
          <p className="text-xs text-gray-500 font-mono">ID: {order._id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột Trái: Thông tin chính */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trạng thái & Sản phẩm */}
          <div className="galaxy-card p-6 rounded-2xl border border-white/5 bg-black/40">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-pink-500" />
                <h3 className="text-lg font-bold">Danh sách kiện hàng</h3>
              </div>
              <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg ${order.status === 'Đã giao' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                order.status === 'Đã hủy' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  order.status === 'Trả hàng' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                    'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                }`}>
                {order.status === 'Đã giao' ? <CheckCircle className="w-3 h-3" /> :
                  order.status === 'Đã hủy' ? <XCircle className="w-3 h-3" /> :
                    order.status === 'Trả hàng' ? <ArrowLeft className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {order.status}
              </span>
            </div>

            <div className="space-y-4">
              {order.orderItems.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-pink-500/20">
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg shadow-xl" />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-100 mb-1">{item.name}</h4>
                    <p className="text-xs text-gray-400 mb-2">Đơn giá: {item.price.toLocaleString()}₫</p>
                    <div className="flex items-center gap-2">
                      <span className="text-pink-500 font-black">x{item.qty}</span>
                      <span className="text-xs text-gray-500">|</span>
                      <span className="text-[var(--color-neon-blue)] font-bold">{(item.price * item.qty).toLocaleString()}₫</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cột Phải: Thông tin khách hàng & Tổng tiền */}
        <div className="space-y-6">
          {/* Khách hàng */}
          <div className="galaxy-card p-6 rounded-2xl border border-white/5 bg-black/40">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold">Khách Hàng</h3>
            </div>
            <div className="space-y-1">
              <p className="text-white font-bold">{order.user?.name || 'Unknown'}</p>
              <p className="text-sm text-gray-400">{order.user?.email || 'N/A'}</p>
            </div>
          </div>

          {/* Giao hàng */}
          <div className="galaxy-card p-6 rounded-2xl border border-white/5 bg-black/40">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-5 h-5 text-red-400" />
              <h3 className="font-bold">Địa Chỉ Giao Hàng</h3>
            </div>
            <div className="text-sm text-gray-300 leading-relaxed">
              <p className="font-medium text-white mb-1">{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}</p>
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
                  <span className="text-gray-400">Trạng thái thanh toán</span>
                  <span className={order.isPaid ? 'text-green-400 font-bold' : 'text-orange-400 font-bold'}>
                    {order.isPaid ? 'Đã thanh toán' : 'Thanh toán khi nhận'}
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

          {/* Nút hành động đặc biệt: Trả hàng (Chỉ hiện khi đã giao) */}
          {order.status === 'Đã giao' && (
            <button
              onClick={handleReturnOrder}
              className="w-full bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white border border-orange-500/30 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-900/10"
            >
              Xác nhận Trả hàng & Hoàn kho
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmReturn}
        onClose={() => setConfirmReturn(false)}
        onConfirm={confirmReturnAction}
        title="Xác Nhận Trả Hàng"
        message="Bạn có chắc chắn muốn xác nhận trả hàng cho đơn này?"
      />
    </div>
  );
};

export default AdminOrderDetail;
