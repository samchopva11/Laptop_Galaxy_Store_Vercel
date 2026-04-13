import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const addToCart = (product, qty = 1) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.product === product._id);
      let updated;
      if (exists) {
        updated = prev.map(item => item.product === product._id ? { ...item, qty: item.qty + qty } : item);
      } else {
        updated = [...prev, {
          product: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          qty: qty
        }];
      }
      localStorage.setItem('cartItems', JSON.stringify(updated));
      return updated;
    });
  };

  const updateCartQty = (id, qty) => {
    setCartItems(prev => {
      const updated = prev.map(item => item.product === id ? { ...item, qty: Math.max(1, qty) } : item);
      localStorage.setItem('cartItems', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => {
      const updated = prev.filter(item => item.product !== id);
      localStorage.setItem('cartItems', JSON.stringify(updated));
      return updated;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateCartQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
