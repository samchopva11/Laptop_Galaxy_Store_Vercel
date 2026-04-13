import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { Search, User, Mail, Shield, Edit2, X, Save, CheckCircle, XCircle, Trash2, Ban, Lock, Unlock } from 'lucide-react';

const AdminUsers = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // State cho Confirm Modal
  const [confirmAction, setConfirmAction] = useState({ isOpen: false, type: '', user: null, data: null });

  // State cho Edit User Modal
  const [editModal, setEditModal] = useState({ isOpen: false, user: null });
  const [editFormData, setEditFormData] = useState({ name: '', email: '', isAdmin: false, isBlocked: false });

  useEffect(() => {
    if (loading) return;

    if (!user || !user.isAdmin) {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user, loading, navigate]);

  const fetchUsers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/users', config);
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleAdmin = (u) => {
    if (u._id === user._id) {
      showToast('⚠️ Bạn không thể tự hạ cấp chính mình!');
      return;
    }
    setConfirmAction({
      isOpen: true,
      type: 'ROLE_TOGGLE',
      user: u,
      message: `Bạn có chắc chắn muốn ${u.isAdmin ? 'hạ cấp' : 'thăng cấp'} cho phi hành gia ${u.name} không?`
    });
  };

  const handleEditClick = (u) => {
    setEditModal({ isOpen: true, user: u });
    setEditFormData({ name: u.name, email: u.email, isAdmin: u.isAdmin, isBlocked: u.isBlocked });
  };

  const handleUpdateUser = () => {
    setConfirmAction({
      isOpen: true,
      type: 'USER_UPDATE',
      user: editModal.user,
      data: editFormData,
      message: `Xác nhận cập nhật thông tin cho phi hành gia ${editModal.user.name}?`
    });
  };

  const confirmActionExecute = async () => {
    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    try {
      if (confirmAction.type === 'ROLE_TOGGLE') {
        const u = confirmAction.user;
        await axios.put(`http://localhost:5000/api/users/${u._id}`, { isAdmin: !u.isAdmin }, config);
        showToast(`Đã ${!u.isAdmin ? 'thăng cấp' : 'hạ cấp'} ${u.name} thành công!`);
      } else if (confirmAction.type === 'BLOCK_TOGGLE') {
        const u = confirmAction.user;
        await axios.put(`http://localhost:5000/api/users/${u._id}`, { isBlocked: !u.isBlocked }, config);
        showToast(`Đã ${!u.isBlocked ? 'vô hiệu hóa' : 'kích hoạt'} ${u.name} thành công!`);
      } else if (confirmAction.type === 'USER_UPDATE') {
        const u = confirmAction.user;
        await axios.put(`http://localhost:5000/api/users/${u._id}`, confirmAction.data, config);
        showToast(`Đã cập nhật thông tin ${u.name} thành công!`);
        setEditModal({ isOpen: false, user: null });
      }
      fetchUsers();
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra khi thực hiện nhiệm vụ');
    }
  };

  // Logic Xử lý: Lọc -> Phân trang
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div className="min-h-screen flex items-center justify-center neon-text">Đang kết nối cơ sở dữ liệu phi hành gia... 🛰️</div>;

  return (
    <div className="max-w-6xl mx-auto min-h-[70vh]">
      <h2 className="text-3xl font-extrabold mb-8 text-pink-400">Danh Sách Phi Hành Gia</h2>

      {/* Chỉ số tóm tắt */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="galaxy-card p-4 rounded-xl border border-white/5 bg-blue-500/10 min-w-[150px] flex-1">
          <p className="text-xs text-blue-300 font-bold uppercase tracking-widest mb-1">Tổng Phi Hành Gia</p>
          <p className="text-2xl font-black text-white">{users.length}</p>
        </div>
        <div className="galaxy-card p-4 rounded-xl border border-white/5 bg-green-500/10 min-w-[150px] flex-1">
          <p className="text-xs text-green-300 font-bold uppercase tracking-widest mb-1">Đã Xác Thực</p>
          <p className="text-2xl font-black text-white">{users.filter(u => u.isVerified).length}</p>
        </div>
        <div className="galaxy-card p-4 rounded-xl border border-white/5 bg-red-500/10 min-w-[150px] flex-1">
          <p className="text-xs text-red-300 font-bold uppercase tracking-widest mb-1">Chưa Xác Thực</p>
          <p className="text-2xl font-black text-white">{users.filter(u => !u.isVerified).length}</p>
        </div>
      </div>

      <div className="galaxy-card p-6 rounded-xl border border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-white/10 pb-4">
          <h3 className="text-xl font-bold">Danh Sách Người Dùng</h3>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Tìm phi hành gia (tên hoặc email)..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white/10 border border-white/10 rounded-full py-2 px-4 pl-10 text-sm focus:outline-none focus:border-pink-500 transition-all"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 border-b border-white/10 text-xs uppercase tracking-wider">
                <th className="p-3">ID</th>
                <th className="p-3">Tên</th>
                <th className="p-3">Email</th>
                <th className="p-3">Xác thực</th>
                <th className="p-3">Quyền hạn</th>
                <th className="p-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((u) => (
                <tr key={u._id} className={`border-b border-white/5 hover:bg-white/5 transition-opacity ${u.isBlocked ? 'opacity-40 grayscale-[0.5]' : ''}`}>
                  <td className="p-3 text-xs text-gray-400">{u._id}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {u.avatar ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0">
                          <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center text-[10px] font-bold text-gray-400 border border-white/10 shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-semibold flex items-center gap-2">
                          {u.name}
                          {u.isBlocked && (
                            <span className="px-1.5 py-0.5 bg-red-500/20 text-red-500 rounded text-[8px] font-black uppercase tracking-tighter border border-red-500/20 flex items-center gap-1">
                              <Ban size={8} /> Bị khóa
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    {u.isVerified ? (
                      <span className="text-green-400 font-bold">Đã Xác Thực</span>
                    ) : (
                      <span className="text-red-400">Chưa Xác Thực</span>
                    )}
                  </td>
                  <td className="p-3">
                    {u.isAdmin ? (
                      <span className="px-2 py-1 bg-pink-500/20 text-pink-300 rounded text-[10px] font-black uppercase tracking-widest border border-pink-500/20">Admin</span>
                    ) : (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-[10px] font-black uppercase tracking-widest border border-blue-500/20">User</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(u)}
                        className="p-2 bg-white/5 hover:bg-white/10 text-blue-400 rounded-lg transition-all border border-blue-500/20"
                        title="Chỉnh sửa chi tiết"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleAdmin(u)}
                        className={`text-[10px] font-black px-3 py-1.5 rounded-lg transition-all border ${u.isAdmin
                          ? 'border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white'
                          : 'border-pink-500/30 text-pink-400 hover:bg-pink-500 hover:text-white'
                          }`}
                      >
                        {u.isAdmin ? 'HẠ CẤP' : 'THĂNG CẤP'}
                      </button>

                      {u._id !== user._id && (
                        <button
                          onClick={() => setConfirmAction({
                            isOpen: true,
                            type: 'BLOCK_TOGGLE',
                            user: u,
                            message: `Bạn có chắc chắn muốn ${u.isBlocked ? 'kích hoạt' : 'vô hiệu hóa'} phi hành gia ${u.name} không?`
                          })}
                          className={`p-2 rounded-lg transition-all border ${u.isBlocked
                            ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500 hover:text-white'
                            : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white'
                            }`}
                          title={u.isBlocked ? 'Kích hoạt tài khoản' : 'Vô hiệu hóa tài khoản'}
                        >
                          {u.isBlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-500 italic">Không tìm thấy phi hành gia nào.</td>
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
        isOpen={confirmAction.isOpen}
        onClose={() => setConfirmAction({ ...confirmAction, isOpen: false })}
        onConfirm={confirmActionExecute}
        title="Xác nhận chỉ thị"
        message={confirmAction.message}
        type={confirmAction.type === 'USER_UPDATE' ? 'info' : (confirmAction.user?.isAdmin ? 'danger' : 'info')}
      />

      {/* Edit User Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditModal({ isOpen: false, user: null })}></div>
          <div className="relative w-full max-w-2xl bg-[#0f0c29] border border-white/10 rounded-3xl p-8 galaxy-card shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-2xl font-black neon-text uppercase tracking-tighter">Chi Tiết Phi Hành Gia</h3>
              </div>
              <button
                onClick={() => setEditModal({ isOpen: false, user: null })}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div className="flex justify-center mb-6">
                  {editModal.user?.avatar ? (
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                      <img src={editModal.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center text-3xl font-black text-blue-400">
                      {editModal.user?.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Định danh (Tên)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">Tọa độ Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 transition-all font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-4">Cấp bậc hệ thống</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className={`w-5 h-5 ${editFormData.isAdmin ? 'text-pink-500' : 'text-blue-400'}`} />
                      <span className="font-bold">{editFormData.isAdmin ? 'Chỉ huy Admin' : 'Phi hành gia'}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editFormData.isAdmin}
                        onChange={(e) => setEditFormData({ ...editFormData, isAdmin: e.target.checked })}
                        className="sr-only peer"
                        disabled={editModal.user?._id === user._id}
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                    </label>
                  </div>
                  {editModal.user?._id === user._id && (
                    <p className="text-[10px] text-pink-400 mt-3 italic">* Không thể tự thay đổi cấp bậc của mình</p>
                  )}
                </div>

                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#94a3b8] mb-4">Trạng thái tài khoản</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Ban className={`w-5 h-5 ${editFormData.isBlocked ? 'text-red-500' : 'text-green-400'}`} />
                      <span className={`font-bold ${editFormData.isBlocked ? 'text-red-500' : 'text-green-400'}`}>
                        {editFormData.isBlocked ? 'Đang bị vô hiệu hóa' : 'Đang hoạt động'}
                      </span>
                    </div>
                    {editModal.user?._id !== user._id && (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editFormData.isBlocked}
                          onChange={(e) => setEditFormData({ ...editFormData, isBlocked: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    )}
                  </div>
                </div>

                <div className="p-6 bg-green-500/5 border border-green-500/10 rounded-2xl">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Trạng thái</span>
                  </div>
                  <p className="text-sm font-bold text-white">
                    {editModal.user?.isVerified ? 'Tài khoản đã được xác thực' : 'Chưa xác thực'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setEditModal({ isOpen: false, user: null })}
                className="flex-1 px-6 py-4 rounded-xl border border-white/10 text-white font-bold hover:bg-red-500/80 transition-all uppercase tracking-widest text-xs"
              >
                HỦY
              </button>
              <button
                onClick={handleUpdateUser}
                className="flex-2 flex-[2] px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-black text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/20 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Cập nhật hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
