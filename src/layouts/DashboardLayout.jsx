import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Truck, 
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  LogOut, 
  ChevronDown,
  Moon,
  Sun,
  Users2,
  FileText,
  Clock,
  History,
  User,
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStock } from '@/context/StockContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const { getProductsLowInStock } = useStock();
  const { currentUser, hasPermission } = useAuth();
  
  const lowStockProducts = getProductsLowInStock();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      
      navigate('/login');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur lors de la déconnexion",
        description: error.message,
      });
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  const navItems = [
    { path: '/', label: 'Tableau de bord', icon: <LayoutDashboard className="h-5 w-5" />, permission: true },
    { path: '/products', label: 'Produits', icon: <Package className="h-5 w-5" />, permission: hasPermission('view_products') },
    { path: '/categories', label: 'Catégories', icon: <Tags className="h-5 w-5" />, permission: hasPermission('view_categories') },
    { path: '/suppliers', label: 'Fournisseurs', icon: <Truck className="h-5 w-5" />, permission: hasPermission('admin') },
    { path: '/transactions', label: 'Transactions', icon: <BarChart3 className="h-5 w-5" />, permission: hasPermission('view_transactions') },
    { path: '/daily-report', label: 'Point Quotidien', icon: <Clock className="h-5 w-5" />, permission: hasPermission('view_reports') },
    { path: '/transaction-history', label: 'Historique', icon: <History className="h-5 w-5" />, permission: hasPermission('view_transactions') },
    { path: '/annual-report', label: 'Bilan Annuel', icon: <FileText className="h-5 w-5" />, permission: hasPermission('view_reports') },
    { path: '/users', label: 'Utilisateurs', icon: <Users2 className="h-5 w-5" />, permission: hasPermission('admin') },
    { path: '/settings', label: 'Paramètres', icon: <Settings className="h-5 w-5" />, permission: hasPermission('admin') },
  ].filter(item => item.permission);
  
  const getPageTitle = () => {
    const currentRoute = navItems.find(item => item.path === location.pathname);
    return currentRoute ? currentRoute.label : 'MIC SERVICES SARL';
  };

  const getUserInitials = (name) => {
    if (!name) return 'AD';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400 font-medium">
            {getUserInitials(currentUser?.name)}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{currentUser?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentUser?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleDarkMode}>
          {isDarkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
          <span>{isDarkMode ? 'Mode clair' : 'Mode sombre'}</span>
        </DropdownMenuItem>
        {hasPermission('admin') && (
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <Settings2 className="mr-2 h-4 w-4" />
            <span>Paramètres</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
  
  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      <header className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-4 px-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">{getPageTitle()}</h1>
        <UserMenu />
      </header>
      
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Package className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-xl font-bold">MIC SERVICES SARL</h1>
              </div>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-1 px-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => 
                        `flex items-center px-3 py-2 rounded-md transition-colors ${
                          isActive 
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                        }`
                      }
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          setIsSidebarOpen(false);
                        }
                      }}
                    >
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                      {item.path === '/products' && hasPermission('admin') && lowStockProducts.length > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                          {lowStockProducts.length}
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
      
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <header className="hidden lg:flex bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-4 px-6 items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-4">
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">{getPageTitle()}</h1>
          </div>
          
          {currentUser && (
            <div className="flex items-center space-x-4">
              <UserMenu />
            </div>
          )}
        </header>
        
        <main className="p-4 md:p-6 bg-gray-50 dark:bg-gray-950 min-h-[calc(100vh-64px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;