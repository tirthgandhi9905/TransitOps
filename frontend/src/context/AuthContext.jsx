import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ email, role });
    }
    setLoading(false);
  }, []);

  const loginUser = (email, role, token) => {
    localStorage.setItem('email', email);
    localStorage.setItem('role', role);
    localStorage.setItem('token', token);
    setUser({ email, role });
  };

  const logoutUser = () => {
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
