import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStock } from './StockContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { users } = useStock();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (users && users.length > 0) {
      setCurrentUser(users[0]);
    }
  }, [users]);

  const hasPermission = (permission) => {
    if (!currentUser) return false;
    
    switch (currentUser.role) {
      case 'Admin':
        return true;
      case 'Editor':
        return ['view_products', 'view_categories', 'view_transactions', 'add_transactions'].includes(permission);
      case 'Viewer':
        return ['view_products', 'view_categories', 'view_transactions'].includes(permission);
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};