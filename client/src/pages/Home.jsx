import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';
import {
  Rocket,
  ShieldCheck,
  Zap,
  Clock,
  ChevronRight,
  ChevronLeft,
  Star,
  Flame,
} from 'lucide-react';
import { useRef } from 'react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          axiosInstance.get('/api/products'),
          axiosInstance.get('/api/categories')
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (error) {
        console.error('Lỗi khi fetch dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter products by badge (Limit to 10 for Carousel)
  const newArrivals = products.filter(p => p.badge === 'New').slice(0, 10);
  const bestSellers = products.filter(p => p.badge === 'Best Seller').slice(0, 10);
  const hotProducts = products.filter(p => p.badge === 'Hot').slice(0, 10);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-light)]">
      <div className="text-2xl font-bold animate-pulse text-[var(--color-primary-bright)]">Đang khởi tạo hệ thống Galaxy...</div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 text-[var(--color-text-dark)]">
      {/* 1. HERO SECTION */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden mb-16">
        {/* Nebula Background Effect */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[var(--color-bg-light)] via-[var(--color-bg-cream)] to-[var(--color-bg-light)]">
          {/* Cartoon Rocket Background */}
          <img
            src="/rocket-bg.png"
            alt="Rocket Background"
            className="absolute right-0 top-0 w-1/2 h-full object-contain opacity-20 blur-3xl scale-125 transform rotate-12 pointer-events-none"
          />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-primary-bright)]/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-primary-muted)]/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <div className="inline-block px-4 py-1 rounded-full border border-[var(--color-primary-bright)]/30 bg-[var(--color-primary-bright)]/10 text-[var(--color-primary-bright)] text-xs font-bold uppercase tracking-widest mb-6 animate-float">
            Chào mừng đến với Kỷ Nguyên Laptop Mới
          </div>
          <h1 className="text-5xl md:text-7xl mb-8 font-bold leading-tight">
            MỞ MÁY <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary-bright)] to-[var(--color-primary-muted)] neon-text">MỞ THẾ GIỚI</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-10 leading-relaxed font-medium">
            Sở hữu những cỗ máy tối tân nhất để chinh phục mọi giới hạn.
            Tại Galaxy Store, chúng tôi không chỉ bán Laptop, chúng tôi cung cấp chìa khóa đến tương lai.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/products" className="neon-button px-10 py-4 rounded-full font-bold text-lg flex items-center gap-2 group text-white">
              MUA NGAY <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY EXPLORER */}
      <section className="max-w-7xl mx-auto px-4 mb-24">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-[var(--color-text-dark)]">CÁC DÒNG LAPTOP</h2>
          <Link to="/products" className="text-sm text-[var(--color-primary-bright)] hover:underline flex items-center gap-1 font-bold">Tất cả <ChevronRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {categories.slice(0, 5).map((cat, idx) => {
            const getCategoryImage = (name) => {
              const images = {
                'Gaming': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=500&auto=format&fit=crop',
                'Văn phòng': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=500&auto=format&fit=crop',
                'Mỏng nhẹ': 'https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?q=80&w=500&auto=format&fit=crop',
                'Đồ họa': 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=500&auto=format&fit=crop',
                'Sinh viên': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=500&auto=format&fit=crop'
              };
              return images[name] || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=500&auto=format&fit=crop';
            };

            return (
              <Link key={cat._id} to={`/products?category=${cat._id}`} className="galaxy-card overflow-hidden rounded-3xl text-center group hover:-translate-y-2 transition-all border border-[var(--color-primary-muted)]/20 hover:border-[var(--color-primary-bright)]/50">
                <div className="h-40 overflow-hidden relative">
                  <img src={getCategoryImage(cat.name)} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center pb-4">
                    <h3 className="font-bold text-white text-lg">{cat.name}</h3>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. NEW ARRIVALS (SIÊU PHẨM MỚI) */}
      <section className="max-w-7xl mx-auto px-4 mb-24">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[var(--color-primary-bright)]/20 rounded-xl"><Star className="w-6 h-6 text-[var(--color-primary-bright)]" /></div>
            <h2 className="text-4xl font-black uppercase tracking-tighter text-[var(--color-text-dark)]">SIÊU PHẨM MỚI VỀ</h2>
          </div>
          <Link to="/products?badge=New" className="text-sm text-[var(--color-primary-bright)] hover:underline flex items-center gap-1 font-bold">Xem tất cả <ChevronRight className="w-4 h-4" /></Link>
        </div>
        <ProductCarousel products={newArrivals} addToCart={addToCart} />
      </section>

      {/* 4. BEST SELLERS (KHU VỰC VINH DANH) */}
      <section className="max-w-7xl mx-auto px-4 mb-24">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[var(--color-primary-muted)]/20 rounded-xl"><Flame className="w-6 h-6 text-[var(--color-primary-muted)]" /></div>
            <h2 className="text-4xl font-black uppercase tracking-tighter text-[var(--color-text-dark)]">TOP BÁN CHẠY NHẤT</h2>
          </div>
          <Link to="/products?badge=Best Seller" className="text-sm text-[var(--color-primary-muted)] hover:underline flex items-center gap-1 font-bold">Xem tất cả <ChevronRight className="w-4 h-4" /></Link>
        </div>
        <ProductCarousel products={bestSellers} addToCart={addToCart} />
      </section>

      {/* 5. HOT PRODUCTS (KHU VỰC RỰC LỬA) */}
      <section className="max-w-7xl mx-auto px-4 mb-24">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pink-500/20 rounded-xl"><Zap className="w-6 h-6 text-pink-500 animate-pulse" /></div>
            <h2 className="text-4xl font-black uppercase tracking-tighter text-[var(--color-text-dark)]">SIÊU PHẨM CỰC HOT</h2>
          </div>
          <Link to="/products?badge=Hot" className="text-sm text-pink-500 hover:underline flex items-center gap-1 font-bold">Xem tất cả <ChevronRight className="w-4 h-4" /></Link>
        </div>
        <ProductCarousel products={hotProducts} addToCart={addToCart} />
      </section>

      {/* 5. SERVICE HIGHLIGHTS (TẠI SAO CHỌN GALAXY?) */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ServiceItem icon={<Rocket className="w-8 h-8 text-[var(--color-primary-bright)]" />} title="Giao Hàng Hỏa Tốc" desc="Nhận máy trong vòng 2 giờ tại nội thành" />
          <ServiceItem icon={<ShieldCheck className="w-8 h-8 text-[var(--color-primary-muted)]" />} title="Bảo Hành Vũ Trụ" desc="Đổi mới trong 30 ngày nếu phát sinh lỗi" />
          <ServiceItem icon={<Zap className="w-8 h-8 text-pink-400" />} title="Hỗ Trợ 24/7" desc="Đội ngũ kỹ thuật luôn sẵn sàng hỗ trợ" />
          <ServiceItem icon={<Clock className="w-8 h-8 text-indigo-400" />} title="Trả Góp 0%" desc="Thủ tục nhanh gọn trong 15 phút" />
        </div>
      </section>
    </div>
  );
};

// Reusable Components inside Home.jsx
const ProductCarousel = ({ products, addToCart }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = current.offsetWidth;
      current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/carousel">
      {/* Scroll Buttons */}
      {products.length > 4 && (
        <>
          <button
            onClick={() => scroll('left')}
            className="absolute -left-6 top-1/2 -translate-y-1/2 z-20 bg-white/50 hover:bg-white backdrop-blur-md p-3 rounded-full border border-[var(--color-primary-muted)]/30 opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden md:block shadow-md text-[var(--color-text-dark)]"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute -right-6 top-1/2 -translate-y-1/2 z-20 bg-white/50 hover:bg-white backdrop-blur-md p-3 rounded-full border border-[var(--color-primary-muted)]/30 opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden md:block shadow-md text-[var(--color-text-dark)]"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Product List */}
      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-5 py-6 scroll-px-5 rounded-2xl"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map(product => (
          <div key={product._id} className="min-w-full sm:min-w-[calc(50%-16px)] lg:min-w-[calc(25%-24px)] snap-start">
            <div className="animate-glow-pulse rounded-2xl overflow-hidden h-full">
              <ProductCard product={product} addToCart={addToCart} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductCard = ({ product, addToCart }) => (
  <div className="galaxy-card rounded-2xl overflow-hidden group flex flex-col h-full hover:border-[var(--color-primary-bright)]/50 transition-all">
    <Link to={`/product/${product._id}`} className="block flex-grow cursor-pointer">
      <div className="h-56 bg-white/50 flex items-center justify-center relative overflow-hidden">
        <img src={product.image} alt={product.name} className="object-contain p-4 w-full h-full group-hover:scale-110 transition-transform duration-700" />
        {product.badge && (
          <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${product.badge === 'New' ? 'bg-[var(--color-primary-bright)]' :
            product.badge === 'Hot' ? 'bg-pink-500 animate-pulse' : 'bg-[var(--color-primary-muted)]'
            }`}>
            {product.badge}
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col">
        <div className="text-[var(--color-primary-muted)] text-[10px] mb-2 font-black uppercase tracking-widest opacity-80">
          {product.category?.name || 'GALAXY SERIES'}
        </div>
        <h3 className="text-base font-bold mb-3 text-[var(--color-text-dark)] line-clamp-2 min-h-[3rem] group-hover:text-[var(--color-primary-bright)] transition-colors">{product.name}</h3>
      </div>
    </Link>
    <div className="px-5 pb-5 mt-auto">
      <div className="flex justify-between items-center bg-[var(--color-primary-muted)]/5 p-3 rounded-xl border border-[var(--color-primary-muted)]/10 group-hover:border-[var(--color-primary-bright)]/30 transition-all">
        <span className="text-lg font-black text-[var(--color-text-dark)]">
          {product.price.toLocaleString('vi-VN')}₫
        </span>
        <button
          onClick={() => addToCart(product)}
          className="neon-button p-2.5 rounded-lg transition-all text-xs font-black uppercase tracking-tighter"
        >
          MUA NGAY
        </button>
      </div>
    </div>
  </div>
);

const ServiceItem = ({ icon, title, desc }) => (
  <div className="galaxy-card p-8 rounded-3xl border border-[var(--color-primary-muted)]/20 hover:bg-[var(--color-primary-muted)]/5 transition-colors flex flex-col items-center text-center">
    <div className="mb-6 p-4 bg-white/50 rounded-2xl shadow-sm border border-[var(--color-primary-muted)]/10">{icon}</div>
    <h3 className="text-lg font-bold mb-2 text-[var(--color-text-dark)]">{title}</h3>
    <p className="text-sm text-gray-600">{desc}</p>
  </div>
);

export default Home;
