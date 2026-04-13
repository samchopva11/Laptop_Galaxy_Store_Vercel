import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';

const AdminCategories = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // States mới cho Tìm kiếm và Phân trang
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('name-asc'); // Mặc định A-Z
  const itemsPerPage = 5;

  // State cho Confirm Modal
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });

  useEffect(() => {
    if (loading) return;

    if (!user || !user.isAdmin) {
      navigate('/');
      return;
    }
    fetchCategories();
  }, [user, loading, navigate]);

  const fetchCategories = async () => {
    try {
      const { data } = await axiosInstance.get('/api/categories');
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/categories', { name, description });
      setName('');
      setDescription('');
      fetchCategories();
      showToast('Thương hiệu mới đã được khởi tạo! ✦');
    } catch (error) {
      showToast(error.response?.data?.message || 'Không thể tạo thương hiệu');
    }
  };

  const confirmDeleteAction = async () => {
    try {
      await axiosInstance.delete(`/api/categories/${confirmDelete.id}`);
      fetchCategories();
      showToast('Đã xóa thương hiệu thành công! 🗑️');
    } catch (error) {
      showToast(error.response?.data?.message || 'Lỗi khi xóa thương hiệu');
    }
  };

  const handleDelete = (id) => {
    setConfirmDelete({ isOpen: true, id });
  };

  // Logic Xử lý Tìm kiếm và Phân trang (Client-side)
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortOrder === 'name-asc') return a.name.localeCompare(b.name);
    if (sortOrder === 'name-desc') return b.name.localeCompare(a.name);
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div className="min-h-screen flex items-center justify-center neon-text">Đang đồng bộ dữ liệu thương hiệu... 🛰️</div>;

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-8 text-pink-400">Quản lý Thương Hiệu (Categories)</h2>

      {/* Chỉ số tóm tắt */}
      <div className="flex gap-4 mb-8">
        <div className="galaxy-card p-4 rounded-xl border border-white/5 bg-indigo-500/10 flex-1 md:flex-none md:min-w-[200px]">
          <p className="text-xs text-indigo-300 font-bold uppercase tracking-widest mb-1">Tổng Thương Hiệu</p>
          <p className="text-2xl font-black text-white">{categories.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột Trái: Form Tạo */}
        <div className="galaxy-card p-6 rounded-xl h-fit border border-white/5">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-pink-500">✦</span> Thêm Hãng Mới
          </h3>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">TÊN THƯƠNG HIỆU</label>
              <input
                type="text" placeholder="Ví dụ: ASUS, DELL, MSI..." required
                value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-pink-500 transition-all font-medium"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">MÔ TẢ NGẮN</label>
              <textarea
                placeholder="Nhập giới thiệu về hãng sản xuất..."
                value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-pink-500 h-24 transition-all"
              ></textarea>
            </div>
            <button type="submit" className="bg-gradient-to-r from-pink-600 to-purple-700 hover:shadow-[0_0_15px_rgba(219,39,119,0.4)] text-white font-bold py-3 rounded-lg transition-all transform active:scale-95">
              + Tạo Thương Hiệu
            </button>
          </form>
        </div>

        {/* Cột Phải: Danh sách, Tìm kiếm & Phân trang */}
        <div className="lg:col-span-2 galaxy-card p-6 rounded-xl border border-white/5 bg-black/40">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-white/10 pb-4">
            <h3 className="text-xl font-bold">Danh Sách Thương Hiệu</h3>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {/* Thanh Tìm Kiếm */}
              <div className="relative flex-1 md:w-64">
                <input
                  type="text"
                  placeholder="Tìm hãng nhanh..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
                  }}
                  className="w-full bg-white/10 border border-white/10 rounded-full py-1.5 px-4 pl-9 text-xs focus:outline-none focus:border-pink-500 focus:bg-white/15 transition-all"
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
            </div>
          </div>

          <div className="min-h-[350px] flex flex-col justify-between">
            <ul className="flex flex-col gap-3">
              {currentItems.map((cat) => (
                <li key={cat._id} className="group flex justify-between items-center bg-white/5 p-4 rounded-xl hover:bg-white/10 border border-transparent hover:border-pink-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 font-bold">
                      {cat.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-100 group-hover:text-pink-400 transition-colors">{cat.name}</h4>
                      <p className="text-xs text-gray-400 line-clamp-1 italic">{cat.description || 'Chưa có mô tả chi tiết'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="opacity-0 group-hover:opacity-100 bg-red-500/10 text-red-400 px-4 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-all text-xs font-bold"
                  >
                    XÓA
                  </button>
                </li>
              ))}

              {filteredCategories.length === 0 && (
                <div className="text-center py-20 opacity-40">
                  <p className="text-4xl mb-4">🛸</p>
                  <p className="text-lg">Không tìm thấy thương hiệu nào phù hợp</p>
                </div>
              )}
            </ul>

            {/* Điều hướng Phân trang */}
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
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={confirmDeleteAction}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa thương hiệu này không? Các sản phẩm thuộc hãng này có thể bị ảnh hưởng nghiêm trọng. Hành động này không thể hoàn tác."
      />
    </div>
  );
};

export default AdminCategories;
