import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); 
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  const redirectPath = redirect ? `/${redirect}` : '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate(redirectPath);
      } else {
        setError(res.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (step === 1) {
        await axios.post('http://localhost:5000/api/users', { name, email, password });
        setStep(2);
        setError('');
        setSuccess('Mã OTP đã được gửi đến email của bạn.');
      } else {
        await axios.post('http://localhost:5000/api/users/verify-otp', { email, otp });
        await login(email, password);
        navigate(redirectPath);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (step === 1) {
        // Step 1: Request OTP
        const { data } = await axios.post('http://localhost:5000/api/users/forgot-password', { email });
        setStep(2);
        setSuccess(data.message);
      } else if (step === 2) {
        // Step 2: Verify OTP
        const { data } = await axios.post('http://localhost:5000/api/users/verify-forgot-otp', { email, otp });
        setStep(3);
        setSuccess(data.message);
      } else if (step === 3) {
        // Step 3: Reset Password
        if (password !== confirmPassword) {
          return setError('Mật khẩu nhập lại không khớp');
        }
        const { data } = await axios.post('http://localhost:5000/api/users/reset-password', { email, otp, password });
        setSuccess(data.message + '. Đang chuyển về trang đăng nhập...');
        setTimeout(() => {
          setMode('login');
          setStep(1);
          setSuccess('');
          setError('');
          setPassword('');
          setConfirmPassword('');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (mode === 'login') return 'Đăng Nhập';
    if (mode === 'register') return 'Tạo Tài Khoản';
    return 'Quên Mật Khẩu';
  };

  const handleSubmit = (e) => {
    if (mode === 'login') return handleLogin(e);
    if (mode === 'register') return handleRegister(e);
    return handleForgotPassword(e);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="galaxy-card max-w-md w-full p-8 rounded-2xl relative overflow-hidden">
        <h2 className="text-3xl font-bold mb-6 text-center neon-text">
          {getTitle()}
        </h2>
        
        {error && (
          <div className="bg-red-500/20 text-red-300 p-4 rounded-xl mb-6 text-sm font-medium border border-red-500/20 animate-in fade-in slide-in-from-top-2">
            <p className="mb-3">{error}</p>
            {error.includes('Vô Hiệu Hóa') && (
              <a 
                href="mailto:admin@laptopgalaxy.com?subject=Yêu cầu mở khóa tài khoản"
                className="inline-block w-full py-2 bg-red-500/30 hover:bg-red-500/50 text-white text-center rounded-lg transition-all border border-red-500/30 font-bold text-xs uppercase tracking-widest"
              >
                Liên Hệ Chỉ Huy để biết thêm chi tiết
              </a>
            )}
          </div>
        )}
        {success && <div className="bg-green-500/20 text-green-300 p-3 rounded mb-4 text-sm font-medium">{success}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'register' && step === 1 && (
            <input 
              type="text" placeholder="Họ và tên" required
              value={name} onChange={e => setName(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[var(--color-neon-blue)]"
            />
          )}

          {step === 1 && (
            <>
              <input 
                type="email" placeholder="Email" required
                value={email} onChange={e => setEmail(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[var(--color-neon-blue)]"
              />
              {mode !== 'forgot' && (
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} placeholder="Mật khẩu" required
                    value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[var(--color-neon-blue)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <input 
              type="text" placeholder="Nhập mã OTP từ email" required
              value={otp} onChange={e => setOtp(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[var(--color-neon-blue)]"
            />
          )}

          {mode === 'forgot' && step === 3 && (
            <>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} placeholder="Mật khẩu mới" required
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[var(--color-neon-blue)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} placeholder="Xác nhận mật khẩu mới" required
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[var(--color-neon-blue)]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className={`neon-button py-3 rounded-lg font-bold mt-2 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Đang xử lý...
              </>
            ) : (
              mode === 'login' ? 'Vào Trạm Vũ Trụ' : 
              mode === 'register' ? (step === 1 ? 'Đăng Ký Khám Phá' : 'Xác Nhận OTP') :
              (step === 1 ? 'Gửi OTP' : step === 2 ? 'Xác Nhận OTP' : 'Cập Nhật Mật Khẩu')
            )}
          </button>
        </form>

        {mode === 'login' && (
          <div className="text-right mt-2">
            <button 
              className="text-gray-400 text-xs hover:text-[var(--color-neon-blue)] transition-colors"
              onClick={() => { setMode('forgot'); setStep(1); setError(''); setSuccess(''); }}
            >
              Quên mật khẩu?
            </button>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-gray-400">
          {mode === 'login' ? 'Chưa có thẻ thông hành? ' : 
           mode === 'register' ? 'Đã là thành viên? ' : 'Quay lại '}
          <button 
            type="button"
            className="text-[var(--color-neon-blue)] font-bold hover:underline"
            onClick={() => { 
                if (mode === 'login') setMode('register');
                else setMode('login');
                setStep(1); setError(''); setSuccess(''); 
            }}
          >
            {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
