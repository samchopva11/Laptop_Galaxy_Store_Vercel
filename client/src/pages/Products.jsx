import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatDisplayPrice, parseNumericPrice } from '../utils/priceFormatter';
import Pagination from '../components/Pagination';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [badge, setBadge] = useState(searchParams.get('badge') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max') || '');

  // Temporary States for inputs
  const [tempMin, setTempMin] = useState(formatDisplayPrice(searchParams.get('min')) || '');
  const [tempMax, setTempMax] = useState(formatDisplayPrice(searchParams.get('max')) || '');

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const { addToCart } = useContext(CartContext);
  const { showToast } = useToast();

  useEffect(() => {
    // Fetch categories for Filter Dropdown
    axiosInstance.get('/api/categories').then(({ data }) => setCategories(data)).catch(console.error);
  }, []);

  useEffect(() => {
    // Sync URL with state when state changes
    const params = {};
    if (keyword) params.keyword = keyword;
    if (category) params.category = category;
    if (badge) params.badge = badge;
    if (minPrice) params.min = minPrice;
    if (maxPrice) params.max = maxPrice;
    setSearchParams(params);

    fetchProducts();
  }, [category, badge, minPrice, maxPrice, page]); // Auto-fetch when filters or page changes

  // Reset to page 1 when filters change (except the page state itself)
  useEffect(() => {
    setPage(1);
  }, [category, badge, keyword, minPrice, maxPrice]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = `/api/products?`;
      if (keyword) query += `keyword=${keyword}&`;
      if (category) query += `category=${category}&`;
      if (badge) query += `badge=${badge}&`;
      if (minPrice) query += `min=${minPrice}&`;
      if (maxPrice) query += `max=${maxPrice}&`;
      query += `page=${page}&limit=9`;

      const { data } = await axiosInstance.get(query);

      if (data.products) {
        setProducts(data.products);
        setPages(data.pages);
        setTotalProducts(data.totalProducts);
      } else {
        setProducts(data);
        setPages(1);
        setTotalProducts(data.length);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setMinPrice(parseNumericPrice(tempMin));
    setMaxPrice(parseNumericPrice(tempMax));
    fetchProducts();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 min-h-[70vh] flex flex-col md:flex-row gap-8">

      {/* Sidebar Filter */}
      <div className="w-full md:w-1/4">
        <div className="galaxy-card p-6 rounded-xl sticky top-24">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 neon-text text-[var(--color-primary-bright)]">
            <Filter className="w-5 h-5" /> Bộ Lọc Tìm Kiếm
          </h3>

          <form onSubmit={handleSearch} className="flex flex-col gap-5">
            {/* Tên */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tên sản phẩm</label>
              <div className="relative">
                <input
                  type="text" placeholder="Tìm galaxy..."
                  value={keyword} onChange={e => setKeyword(e.target.value)}
                  className="w-full bg-[var(--color-primary-muted)]/5 border border-[var(--color-primary-muted)]/30 rounded-lg p-3 pl-10 focus:outline-none focus:border-[var(--color-primary-bright)] text-[var(--color-text-dark)]"
                />
                <Search className="w-4 h-4 absolute left-3 top-4 text-gray-500" />
              </div>
            </div>

            {/* Hãng */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Hãng Laptop</label>
              <select
                value={category} onChange={e => setCategory(e.target.value)}
                className="w-full bg-white border border-[var(--color-primary-muted)]/30 rounded-lg p-3 focus:outline-none text-[var(--color-text-dark)]"
              >
                <option value="">Tất cả các hãng</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            {/* Huy Hiệu */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Loại Sản Phẩm</label>
              <div className="flex flex-wrap gap-2">
                {['New', 'Best Seller', 'Hot'].map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBadge(badge === b ? '' : b)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${badge === b
                      ? 'bg-[var(--color-primary-muted)] border-[var(--color-primary-muted)] text-[var(--color-text-dark)]'
                      : 'bg-[var(--color-primary-muted)]/5 border-[var(--color-primary-muted)]/30 text-gray-600 hover:border-white/30'
                      }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Khoảng Giá */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Mức Giá (VNĐ)</label>
              <div className="flex gap-2">
                <input
                  type="text" placeholder="Từ"
                  value={tempMin} onChange={e => setTempMin(formatDisplayPrice(e.target.value))}
                  className="w-1/2 bg-[var(--color-primary-muted)]/5 border border-[var(--color-primary-muted)]/30 rounded-lg p-2 focus:outline-none text-sm"
                />
                <input
                  type="text" placeholder="Đến"
                  value={tempMax} onChange={e => setTempMax(formatDisplayPrice(e.target.value))}
                  className="w-1/2 bg-[var(--color-primary-muted)]/5 border border-[var(--color-primary-muted)]/30 rounded-lg p-2 focus:outline-none text-sm"
                />
              </div>
            </div>

            <button type="submit" className="neon-button py-3 mt-2 rounded-lg font-bold">
              Áp Dụng
            </button>

            {(keyword || category || badge || minPrice || maxPrice) && (
              <button
                type="button"
                onClick={() => {
                  setKeyword('');
                  setCategory('');
                  setBadge('');
                  setMinPrice('');
                  setMaxPrice('');
                  setTempMin('');
                  setTempMax('');
                }}
                className="w-full text-xs bg-[var(--color-primary-muted)]/5 hover:bg-red-500/10 text-gray-600 hover:text-red-400 border border-[var(--color-primary-muted)]/30 hover:border-red-500/30 rounded-lg py-2 flex items-center justify-center gap-1 mt-4 transition-all"
              >
                Xóa tất cả bộ lọc
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Product List */}
      <div className="w-full md:w-3/4">
        <h2 className="text-3xl font-bold mb-8 text-[var(--color-text-dark)]">Kết quả Tìm Kiếm ({totalProducts})</h2>

        {loading ? (
          <div className="text-center text-gray-600 py-20">Đang quét Radar...</div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-600 py-20 galaxy-card rounded-xl">Không có tín hiệu nào khớp với yêu cầu của bạn.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="galaxy-card rounded-2xl overflow-hidden flex flex-col h-full group hover:shadow-[0_0_15px_var(--color-primary-muted)] transition-shadow">
                <Link to={`/product/${product._id}`} className="block flex-grow">
                  <div className="h-48 bg-white/50 flex items-center justify-center relative p-4">
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-light)] to-transparent z-10 pointer-events-none"></div>
                    <img src={product.image} alt={product.name} className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300" />
                    {product.badge && (
                      <span className={`absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${product.badge === 'New' ? 'bg-blue-600 animate-pulse text-white' :
                        product.badge === 'Hot' ? 'bg-red-600 animate-pulse text-white' : 'bg-yellow-600 animate-pulse text-white'
                        }`}>
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col">
                    <span className="text-xs font-bold text-[var(--color-primary-bright)] tracking-wider mb-1 uppercase">{product.category?.name}</span>
                    <h3 className="text-md font-bold text-[var(--color-text-dark)] line-clamp-2">{product.name}</h3>
                  </div>
                </Link>
                <div className="p-4 mt-auto">
                  <div className="flex justify-between items-center bg-[var(--color-primary-muted)]/10 p-2 rounded-lg">
                    <span className="text-lg font-bold text-[var(--color-primary-muted)]">
                      {product.price.toLocaleString()}₫
                    </span>
                    <button
                      onClick={() => {
                        addToCart(product);
                        showToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
                      }}
                      className="px-3 py-2 bg-[var(--color-primary-muted)]/10 hover:bg-[var(--color-primary-muted)]/20 rounded text-sm font-bold transition-all"
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination UI */}
        <Pagination 
          currentPage={page} 
          totalPages={pages} 
          onPageChange={(newPage) => setPage(newPage)} 
        />
      </div>
    </div>
  );
};

export default Products;
