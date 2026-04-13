import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { CartContext } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ShoppingCart, Minus, Plus } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addToCart } = useContext(CartContext);
  const { showToast } = useToast();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axiosInstance.get(`/api/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-400">Đang dò tìm tín hiệu...</div>;
  if (!product) return <div className="text-center py-20 text-red-400">Không tìm thấy vệ tinh này.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 min-h-[70vh]">
      <button
        onClick={() => navigate(-1)}
        className="text-[var(--color-neon-blue)] hover:text-white mb-8 inline-block transition-colors flex items-center gap-2"
      >
        &larr; Quay lại trang trước
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="galaxy-card rounded-2xl p-4 flex items-center justify-center overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-galaxy-dark)] to-transparent z-10 pointer-events-none"></div>
          <img src={product.image} alt={product.name} className="w-full h-auto object-contain z-0 rounded" />
        </div>

        <div className="flex flex-col">
          <div className="text-[var(--color-neon-blue)] font-bold tracking-widest mb-2 uppercase">{product.category?.name}</div>
          <h1 className="text-4xl font-extrabold mb-4">{product.name}</h1>
          <p className="text-3xl text-[var(--color-neon-purple)] font-bold mb-6">{product.price.toLocaleString('vi-VN')}₫</p>

          <div className="galaxy-card p-6 rounded-xl mb-6">
            <h3 className="text-xl font-bold mb-3 border-b border-white/10 pb-2">Thông số cấu hình</h3>
            <ul className="space-y-2 text-gray-300">
              <li><strong className="text-gray-100">CPU:</strong> {product.specifications?.cpu || 'Cập nhật sau'}</li>
              <li><strong className="text-gray-100">RAM:</strong> {product.specifications?.ram || 'Cập nhật sau'}</li>
              <li><strong className="text-gray-100">Card Đồ Họa:</strong> {product.specifications?.gpu || 'Cập nhật sau'}</li>
              <li><strong className="text-gray-100">Tồn kho:</strong> {product.countInStock > 0 ? `${product.countInStock} chiếc` : <span className="text-red-400">Hết hàng</span>}</li>
            </ul>
          </div>

          <p className="text-gray-400 leading-relaxed mb-8">{product.description}</p>

          {/* Quantity Selector */}
          {product.countInStock > 0 && (
            <div className="flex items-center gap-6 mb-8 pt-4 border-t border-white/5">
              <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Chọn số lượng:</span>
              <div className="flex items-center bg-white/5 rounded-xl border border-white/10 overflow-hidden px-2 py-1">
                <button
                  onClick={() => setQty(prev => Math.max(1, prev - 1))}
                  className="p-2 hover:text-[var(--color-neon-blue)] transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Math.min(product.countInStock, Number(e.target.value))))}
                  className="w-12 bg-transparent text-center font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => setQty(prev => Math.min(product.countInStock, prev + 1))}
                  className="p-2 hover:text-[var(--color-neon-blue)] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-gray-500 italic">(Vẫn còn {product.countInStock} trong kho)</span>
            </div>
          )}

          <button
            onClick={() => {
              addToCart(product, qty);
              showToast("Hàng Đã Được Đưa Lên Tàu");
              navigate('/cart');
            }}
            disabled={product.countInStock === 0}
            className={`flex justify-center items-center gap-3 py-4 rounded-xl font-bold text-lg transition-all ${product.countInStock > 0 ? 'neon-button hover:scale-105' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
          >
            <ShoppingCart className="w-6 h-6" />
            {product.countInStock > 0 ? 'Chuyển Lên Tàu Vũ Trụ' : 'Đã Bám Bụi Không Gian'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
