import { useState, useEffect, useContext, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, Package, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const { user, loading } = useContext(AuthContext);

  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  // States cho tính năng Chart
  const [selectedChart, setSelectedChart] = useState('revenue');
  const [dateFilter, setDateFilter] = useState('day');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user || !user.isAdmin) return;

    const fetchData = async () => {
      try {
        const [ordersRes, usersRes] = await Promise.all([
          axiosInstance.get('/api/orders'),
          axiosInstance.get('/api/users')
        ]);
        setOrders(ordersRes.data);
        setUsers(usersRes.data);
      } catch (error) {
        console.error('Lỗi khi fetch data stats:', error);
      }
    };
    fetchData();
  }, [user]);

  const formatDateString = (dateString, filterType) => {
    const d = new Date(dateString);
    if (filterType === 'day') {
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    } else if (filterType === 'month') {
      return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    } else if (filterType === 'year') {
      return `${d.getFullYear()}`;
    }
    return dateString;
  };

  // Hàm trợ giúp lọc mảng theo StartDate / EndDate
  const filterByDateRange = (list) => {
    return list.filter(item => {
      if (!item.createdAt) return true;
      const d = new Date(item.createdAt);
      if (startDate && d < new Date(startDate)) return false;
      if (endDate && d > new Date(endDate + 'T23:59:59')) return false;
      return true;
    });
  };

  const chartData = useMemo(() => {
    let dataMap = {};
    const filteredOrders = filterByDateRange(orders);
    const filteredUsers = filterByDateRange(users);

    if (selectedChart === 'revenue') {
      filteredOrders.forEach((order) => {
        if (order.status === 'Đã giao') {
          const key = formatDateString(order.createdAt, dateFilter);
          if (!dataMap[key]) dataMap[key] = { name: key, DoanhThu: 0 };
          dataMap[key].DoanhThu += order.totalPrice;
        }
      });
    } else if (selectedChart === 'orders') {
      filteredOrders.forEach((order) => {
        const key = formatDateString(order.createdAt, dateFilter);
        if (!dataMap[key]) dataMap[key] = { name: key, ChoXuLy: 0, DangGiao: 0, DaGiao: 0, DaHuy: 0 };

        if (order.status === 'Chờ xử lý') dataMap[key].ChoXuLy += 1;
        else if (order.status === 'Đang giao') dataMap[key].DangGiao += 1;
        else if (order.status === 'Đã giao') dataMap[key].DaGiao += 1;
        else if (order.status === 'Đã hủy') dataMap[key].DaHuy += 1;
      });
    } else if (selectedChart === 'users') {
      filteredUsers.forEach((u) => {
        const key = formatDateString(u.createdAt || new Date(), dateFilter);
        if (!dataMap[key]) dataMap[key] = { name: key, NguoiDungMoi: 0 };
        dataMap[key].NguoiDungMoi += 1;
      });
    }

    return Object.values(dataMap).sort((a, b) => a.name.localeCompare(b.name));
  }, [orders, users, selectedChart, dateFilter, startDate, endDate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center neon-text">Đang nạp dữ liệu thống kê thiên hà... 🛰️</div>;

  const displayOrders = filterByDateRange(orders);
  const displayUsers = filterByDateRange(users);

  const totalRevenue = displayOrders.reduce((acc, order) => order.status === 'Đã giao' ? acc + order.totalPrice : acc, 0);
  const totalOrders = displayOrders.length;
  const totalUsers = displayUsers.length;

  if (!user || !user.isAdmin) return null;

  return (
    <div className="w-full text-[var(--color-text-dark)]">
      <h2 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary-bright)] to-[var(--color-primary-muted)]">
        Trung Tâm Phân Tích Thông Số
      </h2>

      {/* Cards Thống kê Tổng Quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="galaxy-card p-6 rounded-xl flex items-center gap-4">
          <div className="p-4 bg-[var(--color-primary-bright)]/20 text-[var(--color-primary-bright)] rounded-xl"><DollarSign className="w-8 h-8" /></div>
          <div>
            <p className="text-sm text-gray-600 font-bold">Tổng Doanh Thu</p>
            <p className="text-2xl font-bold">{totalRevenue.toLocaleString()}₫</p>
          </div>
        </div>
        <div className="galaxy-card p-6 rounded-xl flex items-center gap-4">
          <div className="p-4 bg-blue-500/20 text-blue-500 rounded-xl"><Package className="w-8 h-8" /></div>
          <div>
            <p className="text-sm text-gray-600 font-bold">Tổng Đơn Hàng</p>
            <p className="text-2xl font-bold">{totalOrders}</p>
          </div>
        </div>
        <div className="galaxy-card p-6 rounded-xl flex items-center gap-4">
          <div className="p-4 bg-green-500/20 text-green-500 rounded-xl"><Users className="w-8 h-8" /></div>
          <div>
            <p className="text-sm text-gray-600 font-bold">Số Lượng Phi Hành Gia</p>
            <p className="text-2xl font-bold">{totalUsers}</p>
          </div>
        </div>
      </div>

      {/* KHU VỰC CHART */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Chart Navigation */}
        <div className="w-full lg:w-1/4 flex flex-col gap-4">
          <h3 className="text-xl font-bold mb-2">Chế Độ Biểu Đồ</h3>
          <button
            onClick={() => setSelectedChart('revenue')}
            className={`p-4 text-left rounded-lg font-bold transition-all ${selectedChart === 'revenue' ? 'bg-[var(--color-primary-bright)] text-white shadow-[0_0_15px_rgba(196,121,255,0.5)]' : 'galaxy-card hover:bg-[var(--color-primary-muted)]/10 text-[var(--color-text-dark)]'}`}
          >
            Doanh Thu
          </button>
          <button
            onClick={() => setSelectedChart('orders')}
            className={`p-4 text-left rounded-lg font-bold transition-all ${selectedChart === 'orders' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'galaxy-card hover:bg-[var(--color-primary-muted)]/10 text-[var(--color-text-dark)]'}`}
          >
            Lượng Đơn Hàng
          </button>
          <button
            onClick={() => setSelectedChart('users')}
            className={`p-4 text-left rounded-lg font-bold transition-all ${selectedChart === 'users' ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'galaxy-card hover:bg-[var(--color-primary-muted)]/10 text-[var(--color-text-dark)]'}`}
          >
            Lượng Người Dùng
          </button>

          <div className="mt-8">
            <h3 className="text-sm text-gray-600 mb-2 font-bold uppercase tracking-widest">Hiển thị dữ liệu (Nhóm)</h3>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-white border border-[var(--color-primary-muted)]/30 rounded p-3 text-[var(--color-text-dark)] focus:outline-none focus:border-[var(--color-primary-bright)]"
            >
              <option value="day">Theo Từng Ngày</option>
              <option value="month">Theo Từng Tháng</option>
              <option value="year">Theo Từng Năm</option>
            </select>
          </div>

          <div className="mt-4">
            <h3 className="text-sm text-gray-600 mb-2 font-bold uppercase tracking-widest">Thời Gian Tùy Chỉnh</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-500 font-bold mb-1 block">Từ Ngày:</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-white border border-[var(--color-primary-muted)]/30 rounded p-3 text-[var(--color-text-dark)] focus:outline-none focus:border-[var(--color-primary-bright)] text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold mb-1 block">Đến Ngày:</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-white border border-[var(--color-primary-muted)]/30 rounded p-3 text-[var(--color-text-dark)] focus:outline-none focus:border-[var(--color-primary-bright)] text-sm" />
              </div>
            </div>
            <button onClick={() => { setStartDate(''); setEndDate(''); }} className="mt-2 text-xs text-[var(--color-primary-bright)] font-bold hover:text-[var(--color-primary-muted)] transition-colors">Xóa Khoảng Thời Gian</button>
          </div>
        </div>

        {/* Chart Display Area */}
        <div className="w-full lg:w-3/4 galaxy-card p-6 rounded-xl flex flex-col h-[500px]">
          <h3 className="text-2xl font-bold mb-6 text-center neon-text text-[var(--color-primary-bright)]">
            {selectedChart === 'revenue' && 'BIỂU ĐỒ DOANH THU'}
            {selectedChart === 'orders' && 'BIỂU ĐỒ TRẠNG THÁI ĐƠN HÀNG'}
            {selectedChart === 'users' && 'BIỂU ĐỒ TĂNG TRƯỞNG NGƯỜI DÙNG'}
          </h3>

          <div className="w-full mt-4">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis width={100} stroke="#64748b" tickFormatter={(value) => selectedChart === 'revenue' ? `${value.toLocaleString()}₫` : value} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#2A1B38', fontWeight: 'bold' }}
                  formatter={(value, name) => {
                    if (selectedChart === 'revenue') return [`${value.toLocaleString()}₫`, 'Doanh Thu'];
                    return [value, name];
                  }}
                />
                <Legend />

                {selectedChart === 'revenue' && (
                  <Bar dataKey="DoanhThu" name="Doanh Thu (VNĐ)" fill="#C479FF" radius={[4, 4, 0, 0]} />
                )}

                {selectedChart === 'orders' && (
                  <>
                    <Bar dataKey="ChoXuLy" name="Chờ Xử Lý" fill="#eab308" stackId="a" />
                    <Bar dataKey="DangGiao" name="Đang Giao" fill="#3b82f6" stackId="a" />
                    <Bar dataKey="DaGiao" name="Đã Giao" fill="#22c55e" stackId="a" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="DaHuy" name="Đã Hủy" fill="#ef4444" stackId="b" />
                  </>
                )}

                {selectedChart === 'users' && (
                  <Bar dataKey="NguoiDungMoi" name="Tài Khoản Mới" fill="#22c55e" radius={[4, 4, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Ghi chú chân trang */}
          <div className="mt-4 pt-4 border-t border-[var(--color-primary-muted)]/20 text-sm text-gray-500 font-bold italic text-center">
            Ghi chú: {selectedChart === 'revenue' && 'Doanh thu chỉ tính các đơn hàng có trạng thái "Đã giao" thành công.'}
            {selectedChart === 'orders' && 'Đơn hàng được nhóm theo thời điểm đặt hàng. Cột xếp chồng thể hiện tổng đơn phát sinh theo trạng thái phân bổ.'}
            {selectedChart === 'users' && 'Sự gia tăng đăng ký mới của các công dân tham gia phi thuyền.'}
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
