import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Trash2, Minus, Plus, Truck, CreditCard, ChevronRight } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const Cart = () => {
  const { cartItems, removeFromCart, updateCartQty, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Shipping Form States
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { product, name }

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!user) {
      showToast('Vui lòng đăng nhập để tiếp tục hành trình!');
      navigate('/login?redirect=cart');
      return;
    }

    if (!recipientName || !phoneNumber || !address || !city) {
      showToast('Hãy điền đầy đủ tọa độ giao hàng!');
      return;
    }

    if (cartItems.length === 0) return;

    try {
      setIsSubmitting(true);

      await axiosInstance.post('/api/orders', {
        orderItems: cartItems,
        shippingAddress: { 
          address: address,
          city: city, 
          phoneNumber: phoneNumber,
          name: recipientName
        },
        paymentMethod: 'COD',
        totalPrice: totalPrice,
      });

      showToast('Đơn hàng đã được phóng thành công!');
      clearCart();
      navigate('/myorders');
    } catch (error) {
      showToast('Lỗi truyền tin: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 py-10 min-h-[70vh]">
      <h2 className="text-3xl font-bold mb-8 neon-text">Giỏ Hàng Của Bạn</h2>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
          <p className="text-gray-400 mb-6">Giỏ hàng đang trống. Hãy chuẩn bị hành trang để khám phá vũ trụ nhé!</p>
          <button onClick={() => navigate('/products')} className="neon-button px-8 py-3 rounded-xl font-bold">Quay Lại Cửa Hàng</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Items & Shipping Form */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* List of Items */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                <span className="w-1.5 h-6 bg-[var(--color-neon-blue)] rounded-full"></span>
                Kiện hàng chuẩn bị xuất phát
              </h3>
              {cartItems.map((item) => (
                <div key={item.product} className="galaxy-card p-5 rounded-2xl flex items-center justify-between group transition-all hover:border-white/20">
                  <div className="flex items-center gap-5">
                    <div className="w-24 h-24 bg-black/40 rounded-xl flex items-center justify-center p-2 overflow-hidden border border-white/5">
                      <img src={item.image} alt={item.name} className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-bold text-lg text-white line-clamp-1">{item.name}</h3>
                      <p className="text-[var(--color-neon-purple)] font-black text-sm">{item.price.toLocaleString('vi-VN')}₫</p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-2 bg-black/20 w-fit rounded-lg px-2 py-1 border border-white/5">
                        <button
                          onClick={() => updateCartQty(item.product, item.qty - 1)}
                          className="p-1 hover:text-[var(--color-neon-blue)] transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                        <button
                          onClick={() => updateCartQty(item.product, item.qty + 1)}
                          className="p-1 hover:text-[var(--color-neon-blue)] transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Thành tiền</p>
                      <p className="text-xl font-black text-white">{(item.price * item.qty).toLocaleString('vi-VN')}₫</p>
                    </div>
                    <button
                      onClick={() => setItemToDelete({ product: item.product, name: item.name })}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all"
                      title="Xóa sản phẩm"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Shipping Information Form */}
            <div className="galaxy-card p-8 rounded-3xl border border-white/5">
              <h3 className="text-xl font-bold flex items-center gap-3 mb-8">
                <Truck className="w-6 h-6 text-[var(--color-neon-blue)]" />
                Tọa Độ Giao Hàng
              </h3>
              <form id="checkout-form" onSubmit={handleCheckout} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Người nhận tài liệu</label>
                  <input
                    type="text" placeholder="Tên phi hành gia..."
                    value={recipientName} onChange={e => setRecipientName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-[var(--color-neon-blue)] text-white transition-all"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Kênh liên lạc (SĐT)</label>
                  <input
                    type="tel" placeholder="09xx..."
                    value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-[var(--color-neon-blue)] text-white transition-all"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Địa chỉ Trạm nhận (Số nhà, Phố...)</label>
                  <input
                    type="text" placeholder="Số 123, Đường Milky Way..."
                    value={address} onChange={e => setAddress(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-[var(--color-neon-blue)] text-white transition-all"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Thành phố / Tỉnh</label>
                  <input
                    type="text" placeholder="Nhập thành phố..."
                    value={city} onChange={e => setCity(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-[var(--color-neon-blue)] text-white transition-all"
                    required
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Station Summary */}
          <div className="lg:col-span-1">
            <div className="galaxy-card p-8 rounded-3xl h-fit sticky top-24 border border-white/5 bg-gradient-to-b from-white/5 to-transparent">
              <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-[var(--color-neon-purple)]" />
                Tổng Kết Trạm
              </h3>

              <div className="flex flex-col gap-4 mb-8 text-gray-300">
                <div className="flex justify-between items-center text-sm">
                  <span>Số lượng kiện hàng:</span>
                  <span className="text-white font-bold">{cartItems.reduce((a, c) => a + c.qty, 0)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Phí vận chuyển vũ trụ:</span>
                  <span className="text-green-400 font-bold uppercase tracking-widest text-[10px]">Miễn Phí</span>
                </div>
                <div className="w-full h-px bg-white/10 my-2"></div>
                <div className="flex justify-between items-end">
                  <span className="text-base font-bold text-white uppercase tracking-tighter">Tổng năng lượng (VAT):</span>
                  <div className="text-right">
                    <p className="text-3xl font-black text-[var(--color-neon-purple)] leading-none">{totalPrice.toLocaleString('vi-VN')}₫</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-8 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5"></div>
                <p className="text-[10px] text-blue-300 leading-relaxed uppercase font-bold tracking-tight">
                  Tất cả đơn hàng của bạn sẽ được bảo hiểm không gian và hỗ trợ bảo trì trọn đời tại Galaxy Store.
                </p>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className={`w-full neon-button py-5 rounded-2xl font-black text-center flex items-center justify-center gap-2 transition-all hover:scale-105 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'ĐANG PHÓNG...' : (
                  <>XÁC NHẬN PHÓNG ĐƠN <ChevronRight className="w-5 h-5" /></>
                )}
              </button>

              <p className="text-[10px] text-gray-500 text-center mt-6 uppercase font-bold tracking-widest">Phương thức: Thanh toán khi nhận hàng (COD)</p>
            </div>
          </div>
        </div>
      )}
    </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={() => setItemToDelete(null)}
        >
          <div
            className="galaxy-card rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-2xl"
            style={{ animation: 'fadeInScale 0.2s ease' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
            </div>

            {/* Text */}
            <h3 className="text-xl font-black text-white text-center mb-2">Xóa Sản Phẩm?</h3>
            <p className="text-gray-400 text-center text-sm leading-relaxed mb-8">
              Bạn có chắc muốn xóa{' '}
              <span className="text-white font-bold">&ldquo;{itemToDelete.name}&rdquo;</span>{' '}
              khỏi giỏ hàng không?
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-3 rounded-xl font-bold border border-white/10 text-gray-300 hover:bg-white/5 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  removeFromCart(itemToDelete.product);
                  showToast(`Đã xóa "${itemToDelete.name}" khỏi giỏ hàng.`);
                  setItemToDelete(null);
                }}
                className="flex-1 py-3 rounded-xl font-bold bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 hover:text-red-200 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
};

export default Cart;
