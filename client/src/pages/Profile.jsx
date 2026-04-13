import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Save, Key, ShieldCheck, Rocket, Camera, Loader2, Eye, EyeOff } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const Profile = () => {
  const { user, login, updateUserContext } = useContext(AuthContext);
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Kích thước ảnh quá lớn (tối đa 2MB)');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setAvatar(reader.result);
      setIsUploading(false);
      showToast('Đã nạp ảnh vào khoang chứa!');
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp!');
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        'http://localhost:5000/api/users/profile',
        { name, email, password, avatar },
        config
      );

      // Update the local context
      updateUserContext(data);
      showToast('Cập nhật hồ sơ thành công!');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Lỗi khi cập nhật hồ sơ:', error);
      showToast(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật');
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Vui lòng đăng nhập để xem trang này.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-pink-500/10 rounded-2xl border border-pink-500/20">
          <Rocket className="w-8 h-8 text-pink-500" />
        </div>
        <div>
          <h2 className="text-3xl font-black neon-text uppercase tracking-tighter">Hồ Sơ Phi Hành Gia</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Card */}
        <div className="lg:col-span-1">
          <div className="galaxy-card p-8 rounded-3xl border border-white/5 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-neon-blue)] to-transparent opacity-50"></div>

            <div className="relative w-32 h-32 mx-auto mb-6 group/avatar">
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] overflow-hidden border-2 border-white/10 group-hover/avatar:border-[var(--color-neon-blue)]/50 transition-all duration-500">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-black text-white">{user.name.charAt(0).toUpperCase()}</span>
                )}

                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-[var(--color-neon-blue)] animate-spin" />
                  </div>
                )}
              </div>

              {/* Upload Overlay */}
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer rounded-full flex flex-col items-center justify-center gap-1 backdrop-blur-sm">
                <Camera className="w-8 h-8 text-white" />
                <span className="text-[8px] font-black uppercase tracking-tighter text-white">Thay ảnh</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>

            <h3 className="text-xl font-bold mb-1">{user.name}</h3>
            <p className="text-gray-400 text-sm mb-6">{user.email}</p>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-500/10 border border-pink-500/20 rounded-full">
              <ShieldCheck className="w-4 h-4 text-pink-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">
                {user.isAdmin ? 'Chỉ huy Admin' : 'Phi hành gia'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <div className="galaxy-card p-8 rounded-3xl border border-white/5 bg-white/[0.02]">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <User className="w-3 h-3 text-[var(--color-neon-blue)]" />
                    Tên Hiển Thị
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--color-neon-blue)] transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Mail className="w-3 h-3 text-[var(--color-neon-blue)]" />
                    Email Tọa Độ
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--color-neon-blue)] transition-all"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <h4 className="text-sm font-black text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                  <Key className="w-4 h-4 text-pink-500" />
                  Thay Đổi Mật Khẩu (Để trống nếu không đổi)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mật khẩu mới</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-pink-500 transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Xác nhận mật khẩu</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-pink-500 transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-black text-white uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/25"
              >
                <Save className="w-5 h-5" />
                Lưu Thay Đổi
              </button>
            </form>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleUpdate}
        title="Xác nhận cập nhật"
        message="Bạn có chắc chắn muốn cập nhật thông tin cá nhân của mình không?"
        type="info"
      />
    </div>
  );
};

export default Profile;
