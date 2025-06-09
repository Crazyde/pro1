import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';

// Layouts
import DashboardLayout from '@/layouts/DashboardLayout';

// Pages
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import Categories from '@/pages/Categories';
import Suppliers from '@/pages/Suppliers';
import Transactions from '@/pages/Transactions';
import Settings from '@/pages/Settings';
import Users from '@/pages/Users';
import AnnualReport from '@/pages/AnnualReport';
import DailyReport from '@/pages/DailyReport';
import TransactionHistory from '@/pages/TransactionHistory';

// Context
import { StockProvider } from '@/context/StockContext';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabase } from '@/lib/supabase';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-br from-blue-500 to-indigo-600">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-white text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold">MIC SERVICES SARL</h1>
          <p className="text-blue-100">Chargement de votre application...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <StockProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={!session ? <Login /> : <Navigate to="/" replace />} />
            <Route path="/" element={session ? <DashboardLayout /> : <Navigate to="/login" replace />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={
                <ProtectedRoute permission="view_products">
                  <Products />
                </ProtectedRoute>
              } />
              <Route path="categories" element={
                <ProtectedRoute permission="view_categories">
                  <Categories />
                </ProtectedRoute>
              } />
              <Route path="suppliers" element={
                <ProtectedRoute permission="admin">
                  <Suppliers />
                </ProtectedRoute>
              } />
              <Route path="transactions" element={
                <ProtectedRoute permission="view_transactions">
                  <Transactions />
                </ProtectedRoute>
              } />
              <Route path="transaction-history" element={
                <ProtectedRoute permission="view_transactions">
                  <TransactionHistory />
                </ProtectedRoute>
              } />
              <Route path="daily-report" element={
                <ProtectedRoute permission="view_reports">
                  <DailyReport />
                </ProtectedRoute>
              } />
              <Route path="annual-report" element={
                <ProtectedRoute permission="view_reports">
                  <AnnualReport />
                </ProtectedRoute>
              } />
              <Route path="users" element={
                <ProtectedRoute permission="admin">
                  <Users />
                </ProtectedRoute>
              } />
              <Route path="settings" element={
                <ProtectedRoute permission="admin">
                  <Settings />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </StockProvider>
  );
}

export default App;