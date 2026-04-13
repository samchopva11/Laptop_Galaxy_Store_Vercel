import { useState, useEffect, useContext, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import * as XLSX from 'xlsx';
import { useNavigate, Link } from 'react-router-dom';
import { formatDisplayPrice, parseNumericPrice } from '../utils/priceFormatter';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';

const AdminProducts = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // States cho Form Thêm/Sửa
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState('');
  const [description, setDescription] = useState('');
  const [cpu, setCpu] = useState('');
  const [ram, setRam] = useState('');
  const [gpu, setGpu] = useState('');
  const [badge, setBadge] = useState(''); // Huy hiệu: Nổi bật, Bán chạy...

  // States cho Chỉnh sửa
  const [isEditing, setIsEditing] = useState(false);
  const [editProductId, setEditProductId] = useState(null);

  // States cho Tìm kiếm, Phân trang & Sắp xếp
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState(''); // Lọc theo hãng
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('name-asc'); // default: A-Z
  const [selectedIds, setSelectedIds] = useState([]);
  const itemsPerPage = 8;

  // State cho Confirm Modal
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, isBulk: false });
  const [confirmImport, setConfirmImport] = useState({ isOpen: false, data: null });

  const fileInputRef = useRef(null);

  // Xử lý đọc file Excel / JSON
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target.result;
        let jsonData = [];

        if (file.name.endsWith('.json')) {
          jsonData = JSON.parse(data);
        } else {
          // Dành cho CSV và XLSX
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        }

        if (jsonData.length === 0) {
          alert('File không có dữ liệu hợp lệ!');
          return;
        }

        // Helper function để lấy giá trị linh hoạt từ các tên cột khác nhau
        const getVal = (obj, keys) => {
          const foundKey = Object.keys(obj).find(k => keys.includes(k.toLowerCase().trim()));
          return foundKey ? obj[foundKey] : null;
        };

        // Kiểm tra định dạng nhanh bằng item đầu tiên
        const firstItem = jsonData[0];
        const hasName = getVal(firstItem, ['name', 'tên', 'ten']);
        const hasPrice = getVal(firstItem, ['price', 'giá', 'gia', 'giá bán']);
        const hasCategory = getVal(firstItem, ['category', 'hãng', 'hang', 'loại', 'loai', 'danh mục']);

        if (!hasName || hasPrice === null || !hasCategory) {
          let missing = [];
          if (!hasName) missing.push("Tên sản phẩm (name)");
          if (hasPrice === null) missing.push("Giá (price)");
          if (!hasCategory) missing.push("Hãng/Danh mục (category)");

          alert(`Cảnh báo: Định dạng file không đúng!\nThiếu các cột bắt buộc hoặc tên cột chưa khớp: ${missing.join(', ')}.\n\nVui lòng kiểm tra lại file trước khi thử lại.`);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        // Upload từng sản phẩm
        let successCount = 0;
        let failCount = 0;

        for (const item of jsonData) {
          try {
            const itemName = getVal(item, ['name', 'tên', 'ten']);
            const itemPrice = getVal(item, ['price', 'giá', 'gia', 'giá bán']);
            const itemImage = getVal(item, ['image', 'ảnh', 'anh', 'hình', 'hinh', 'url']) || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80';
            const itemCategory = getVal(item, ['category', 'hãng', 'hang', 'loại', 'loai', 'danh mục']);
            const itemCountInStock = getVal(item, ['countinstock', 'tồn kho', 'ton kho', 'stock', 'số lượng', 'so luong']) ?? 0;
            const itemDescription = getVal(item, ['description', 'mô tả', 'mo ta', 'chi tiết', 'chi tiet']) || `Laptop ${itemName} - Hiệu suất đỉnh cao cho mọi tác vụ.`;

            const itemCpu = getVal(item, ['cpu', 'bộ vi xử lý', 'vi xu ly']) || '';
            const itemRam = getVal(item, ['ram', 'bộ nhớ']) || '';
            const itemGpu = getVal(item, ['gpu', 'đồ họa', 'do hoa', 'card']) || '';
            const itemBadge = getVal(item, ['badge', 'huy hiệu', 'huy hieu', 'nhãn', 'nhan']) || '';

            if (!itemName || itemPrice === null) {
              console.warn("Bỏ qua dòng dữ liệu do thiếu thông tin cốt lõi (Tên hoặc Giá)");
              failCount++;
              continue;
            }

            // Móc nối tên Label sang Object ID của Hãng (Category)
            const catName = String(itemCategory || '').toLowerCase().trim();
            const matchedCat = categories.find(c => c.name.toLowerCase().trim() === catName);
            const categoryId = matchedCat ? matchedCat._id : category;

            if (!categoryId) {
              console.warn(`Bỏ qua dòng này vì không tìm thấy danh mục: ${itemCategory}`);
              failCount++;
              continue;
            }

            const payload = {
              name: itemName,
              price: Number(itemPrice),
              image: itemImage,
              category: categoryId,
              countInStock: Number(itemCountInStock),
              description: itemDescription,
              specifications: {
                cpu: String(itemCpu),
                ram: String(itemRam),
                gpu: String(itemGpu)
              },
              badge: itemBadge
            };

            await axiosInstance.post('/api/products', payload);
            successCount++;
          } catch (rowErr) {
            console.error(`Lỗi tại dòng ${successCount + failCount + 1}:`, rowErr.response?.data?.message || rowErr.message);
            failCount++;
          }
        }

        if (failCount > 0) {
          alert(`✅ Nhập thành công ${successCount} sản phẩm.\n❌ Thất bại ${failCount} sản phẩm (kiểm tra console để xem chi tiết).`);
        } else {
          showToast(`Đã nhập thành công ${successCount} sản phẩm!`);
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchData();
      } catch (error) {
        console.error('Lỗi tổng quan import:', error);
        alert('Xảy ra lỗi nghiêm trọng khi đọc file. Hãy kiểm tra định dạng.');
      }
    };

    if (file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  useEffect(() => {
    if (loading) return;

    if (!user || !user.isAdmin) {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, loading, navigate]);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        axiosInstance.get('/api/products'),
        axiosInstance.get('/api/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      if (catRes.data.length > 0) setCategory(catRes.data[0]._id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name, price: Number(price),
        image: image || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80',
        category, countInStock: Number(countInStock), description,
        specifications: { cpu, ram, gpu },
        badge
      };

      if (isEditing) {
        await axiosInstance.put(`/api/products/${editProductId}`, payload);
        showToast('Cập nhật laptop thành công! ✨');
      } else {
        await axiosInstance.post('/api/products', payload);
        showToast('Đăng sản phẩm thành công! 🚀');
      }

      fetchData();
      handleCancel();
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (p) => {
    setIsEditing(true);
    setEditProductId(p._id);
    setName(p.name);
    setPrice(p.price);
    setImage(p.image);
    setCategory(p.category?._id || p.category);
    setCountInStock(p.countInStock);
    setDescription(p.description);
    setCpu(p.specifications?.cpu || '');
    setRam(p.specifications?.ram || '');
    setGpu(p.specifications?.gpu || '');
    setBadge(p.badge || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditProductId(null);
    setName('');
    setPrice('');
    setImage('');
    setDescription('');
    setCpu('');
    setRam('');
    setGpu('');
    setBadge('');
    setCountInStock('');
    if (categories.length > 0) setCategory(categories[0]._id);
  };

  const handleDelete = (id) => {
    setConfirmDelete({ isOpen: true, id, isBulk: false });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmDelete({ isOpen: true, id: null, isBulk: true });
  };

  const confirmDeleteAction = async () => {
    try {
      if (confirmDelete.isBulk) {
        const { data } = await axiosInstance.post('/api/products/bulk-delete', { ids: selectedIds });
        showToast(data.message || 'Xóa hàng loạt thành công! 🛸');
        setSelectedIds([]);
      } else {
        await axiosInstance.delete(`/api/products/${confirmDelete.id}`);
        showToast('Sản phẩm đã bị xóa khỏi kho! 🗑️');
        setSelectedIds(selectedIds.filter(id => id !== confirmDelete.id));
      }

      fetchData();
      setConfirmDelete({ isOpen: false, id: null, isBulk: false });
    } catch (error) {
      showToast(error.response?.data?.message || 'Lỗi khi xóa sản phẩm');
    }
  };

  const handleSelectProduct = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIdsOnPage = currentItems.map(p => p._id);
      setSelectedIds(prev => [...new Set([...prev, ...allIdsOnPage])]);
    } else {
      const allIdsOnPage = currentItems.map(p => p._id);
      setSelectedIds(prev => prev.filter(id => !allIdsOnPage.includes(id)));
    }
  };

  // Logic Xử lý: Lọc -> Sắp xếp -> Phân trang
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

    // So sánh ID danh mục của sản phẩm với ID danh mục đang được lọc
    const pCatId = p.category?._id || p.category;
    const matchesCategory = filterCategory === '' || pCatId === filterCategory;

    // Lọc theo giá
    const min = Number(parseNumericPrice(filterMinPrice)) || 0;
    const max = Number(parseNumericPrice(filterMaxPrice)) || Infinity;
    const matchesPrice = p.price >= min && p.price <= max;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === 'name-asc') return a.name.localeCompare(b.name);
    if (sortOrder === 'name-desc') return b.name.localeCompare(a.name);
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div className="min-h-screen flex items-center justify-center neon-text">Khởi động hệ thống phòng thủ... 🛰️</div>;

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-8 text-pink-400">Quản lý Sản Phẩm (Laptop)</h2>

      {/* Chỉ số tóm tắt */}
      <div className="flex gap-4 mb-8">
        <div className="galaxy-card p-4 rounded-xl border border-white/5 bg-blue-500/10 flex-1 md:flex-none md:min-w-[200px]">
          <p className="text-xs text-blue-300 font-bold uppercase tracking-widest mb-1">Tổng Sản Phẩm</p>
          <p className="text-2xl font-black text-white">{products.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Tạo / Sửa */}
        <div className="galaxy-card p-6 rounded-xl h-fit">
          <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
            <h3 className="text-xl font-bold">{isEditing ? 'Cập Nhật Laptop' : 'Đăng Laptop Mới'}</h3>
            {!isEditing && (
              <div className="relative overflow-hidden inline-block w-32 h-8 text-center cursor-pointer">
                <button className="bg-indigo-600/50 hover:bg-indigo-500 text-indigo-200 text-xs font-bold py-1.5 px-3 rounded w-full h-full cursor-pointer transition-colors shadow">
                  📁 Import Dữ Liệu
                </button>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv, .json"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="absolute left-0 top-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            )}
          </div>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <input type="text" placeholder="Tên sản phẩm" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded p-3 focus:outline-none focus:border-pink-500" />
            <div className="flex gap-2">
              <input type="number" placeholder="Giá tiền (VNĐ)" required value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded p-3 focus:outline-none focus:border-pink-500" />
              <input type="number" placeholder="Số lượng kho" required value={countInStock} onChange={e => setCountInStock(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded p-3 focus:outline-none focus:border-pink-500" />
            </div>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-gray-800 border border-white/10 rounded p-3 focus:outline-none text-white">
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <input type="text" placeholder="URL Hình ảnh (bỏ trống lấy ảnh mặc định)" value={image} onChange={e => setImage(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded p-3 focus:outline-none focus:border-pink-500 text-sm" />
            <input type="text" placeholder="Bộ vi xử lý CPU" value={cpu} onChange={e => setCpu(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded p-3 focus:outline-none" />
            <input type="text" placeholder="Dung lượng RAM" value={ram} onChange={e => setRam(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded p-3 focus:outline-none" />
            <input type="text" placeholder="Card Đồ Họa GPU" value={gpu} onChange={e => setGpu(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded p-3 focus:outline-none" />

            <select value={badge} onChange={e => setBadge(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded p-3 focus:outline-none text-white appearance-none cursor-pointer hover:bg-white/10 transition-colors">
              <option value="" className="bg-gray-900">-- Gán Huy Hiệu (Không có) --</option>
              <option value="Hot" className="bg-gray-900 font-bold text-pink-500">🔥 Sản Phẩm Nổi Bật (Hot)</option>
              <option value="Best Seller" className="bg-gray-900 font-bold text-blue-400">🏆 Bán Chạy (Best Seller)</option>
              <option value="New" className="bg-gray-900 font-bold text-green-400">✨ Hàng Mới Về (New)</option>
            </select>

            <textarea placeholder="Mô tả chi tiết" required value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded p-3 focus:outline-none h-20"></textarea>

            <div className="flex gap-2 mt-2">
              <button type="submit" className={`flex-1 bg-gradient-to-r ${isEditing ? 'from-blue-600 to-indigo-600' : 'from-pink-600 to-purple-600'} hover:scale-105 transition-transform text-white font-bold py-3 rounded shadow-lg`}>
                {isEditing ? '💾 Lưu Cập Nhật' : '🚀 Xuất Xưởng Laptop'}
              </button>
              {isEditing && (
                <button type="button" onClick={handleCancel} className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded font-bold transition-all">
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Danh sách */}
        <div className="md:col-span-2 galaxy-card p-6 rounded-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b border-white/10 pb-2 gap-4">
            <div className="flex items-baseline gap-3">
              <h3 className="text-xl font-bold">Kho Hàng</h3>
              <span className="text-sm text-pink-500 font-medium bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
                {filteredProducts.length} Sản Phẩm
              </span>
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {/* Lọc theo Giá */}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Giá từ..."
                  value={filterMinPrice}
                  onChange={(e) => { setFilterMinPrice(formatDisplayPrice(e.target.value)); setCurrentPage(1); }}
                  className="w-24 bg-white/10 border border-white/10 rounded-lg py-1.5 px-2 text-[10px] focus:outline-none focus:border-pink-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="text"
                  placeholder="đến..."
                  value={filterMaxPrice}
                  onChange={(e) => { setFilterMaxPrice(formatDisplayPrice(e.target.value)); setCurrentPage(1); }}
                  className="w-24 bg-white/10 border border-white/10 rounded-lg py-1.5 px-2 text-[10px] focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Lọc theo Danh mục */}
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none text-white cursor-pointer hover:bg-white/20 transition-all"
              >
                <option value="" className="bg-gray-900 text-gray-400">--- Tất cả thương hiệu ---</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id} className="bg-gray-900 text-white">{c.name}</option>
                ))}
              </select>

              {/* Tìm kiếm */}
              <div className="relative flex-1 md:w-48">
                <input
                  type="text"
                  placeholder="Tìm laptop..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-white/10 border border-white/10 rounded-full py-1.5 px-4 pl-9 text-xs focus:outline-none focus:border-pink-500"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
              </div>

              {/* Sắp xếp */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none text-white cursor-pointer"
              >
                <option value="name-asc" className="bg-gray-900">Tên: A → Z</option>
                <option value="name-desc" className="bg-gray-900">Tên: Z → A</option>
              </select>

              {selectedIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs font-black shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all"
                >
                  XÓA {selectedIds.length} MỤC
                </button>
              )}

              {(searchTerm || filterCategory || filterMinPrice || filterMaxPrice) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('');
                    setFilterMinPrice('');
                    setFilterMaxPrice('');
                    setCurrentPage(1);
                  }}
                  className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs hover:bg-red-500/20 transition-all font-bold"
                >
                  Xóa Lọc
                </button>
              )}
            </div>
          </div>

          <div className="min-h-[400px] flex flex-col justify-between">
            <div className="mb-3 flex items-center gap-2 pl-3">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={currentItems.length > 0 && currentItems.every(p => selectedIds.includes(p._id))}
                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-pink-500 cursor-pointer"
              />
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Chọn tất cả trang này</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentItems.map((p) => (
                <div key={p._id} className={`bg-white/5 flex gap-4 p-3 rounded-lg relative overflow-hidden group hover:bg-white/10 transition-colors border ${selectedIds.includes(p._id) ? 'border-pink-500/50 bg-pink-500/5' : 'border-transparent hover:border-pink-500/20'}`}>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p._id)}
                      onChange={() => handleSelectProduct(p._id)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 accent-pink-500 cursor-pointer z-10"
                    />
                  </div>
                  <div className="relative">
                    <img src={p.image} className="w-20 h-20 object-cover rounded shadow-lg" />
                    {p.badge && (
                      <span className={`absolute -top-1 -left-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter shadow-lg z-10 
                        ${p.badge === 'Hot' ? 'bg-red-600 text-white animate-pulse' :
                          p.badge === 'Best Seller' ? 'bg-yellow-600 text-white' :
                            'bg-blue-600 text-white'}`}>
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-md leading-tight line-clamp-2 group-hover:text-pink-400 transition-colors">{p.name}</h4>
                    <p className="text-[var(--color-neon-blue)] mt-1 font-semibold">{p.price.toLocaleString()}₫</p>
                    <p className="text-xs text-gray-400 mt-1">Kho: {p.countInStock}</p>
                  </div>
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <button onClick={() => handleDelete(p._id)} title="Xóa" className="text-white/20 hover:text-red-400 text-xl font-bold transition-colors">&times;</button>
                    <button onClick={() => handleEdit(p)} title="Sửa" className="text-white/20 hover:text-blue-400 text-lg transition-colors">✎</button>
                  </div>
                </div>
              ))}
              {currentItems.length === 0 && <p className="text-gray-400 col-span-2 text-center py-10">Không tìm thấy sản phẩm nào.</p>}
            </div>

            {/* Phân trang */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null, isBulk: false })}
        onConfirm={confirmDeleteAction}
        title={confirmDelete.isBulk ? "Xác nhận xóa hàng loạt" : "Xác nhận xóa"}
        message={confirmDelete.isBulk
          ? `Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn không? Hành động này không thể hoàn tác.`
          : "Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống không? Hành động này không thể hoàn tác."
        }
      />
    </div>
  );
};

export default AdminProducts;
