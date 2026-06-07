import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import AllExpenses from './pages/Expenses';
import Categories from './pages/Categories';
import BudgetSettings from './pages/BudgetSettings';
import VaultManager from './pages/VaultManager';
import { CurrencyInr } from '@phosphor-icons/react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center animate-in fade-in duration-300">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-accent text-bg rounded-3xl flex items-center justify-center shadow-2xl shadow-accent/20 animate-pulse relative group overflow-hidden">
            <CurrencyInr size={40} weight="bold" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-serif text-[#f0f0ee] tracking-tight">ExpenseIQ</h1>
            <p className="text-muted text-xs tracking-widest uppercase font-medium animate-pulse">
              {isAuthenticated ? 'Logging in...' : 'Getting Ready...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/add" element={
          <ProtectedRoute>
            <Layout><AddExpense /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/expenses" element={
          <ProtectedRoute>
            <Layout><AllExpenses /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/categories" element={
          <ProtectedRoute>
            <Layout><Categories /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/budget" element={
          <ProtectedRoute>
            <Layout><BudgetSettings /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/vault" element={
          <ProtectedRoute>
            <Layout><VaultManager /></Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
