import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic auto-login logic if token exists in localStorage
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
      
      // Verify if user is still valid/not blocked
      const checkUserStatus = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${parsedUser.token}` } };
          await axios.get('http://localhost:5000/api/users/profile', config);
        } catch (error) {
          if (error.response?.status === 401) {
            logout();
          }
        }
      };
      checkUserStatus();
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user && user.isAdmin) {
      document.title = 'Admin';
    } else {
      document.title = 'Customer';
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('http://localhost:5000/api/users/login', { email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  const updateUserContext = (data) => {
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUserContext }}>
      {children}
    </AuthContext.Provider>
  );
};
