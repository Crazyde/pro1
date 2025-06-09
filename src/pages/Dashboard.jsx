import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  ArrowRight,
  BarChart3,
  PieChart
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useStock } from '@/context/StockContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    products, 
    categories, 
    transactions, 
    getProductsLowInStock, 
    getRecentTransactions,
    getTotalStockValue,
    getTransactionsByPeriod
  } = useStock();
  
  const [totalValue, setTotalValue] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [transactionStats, setTransactionStats] = useState({ entries: 0, exits: 0 });
  const [categoryData, setCategoryData] = useState([]);
  const [transactionData, setTransactionData] = useState([]);
  
  useEffect(() => {
    setTotalValue(getTotalStockValue());
    setLowStockProducts(getProductsLowInStock());
    setRecentTransactions(getRecentTransactions());
    
    // Calculate transaction stats for the last 7 days
    const recentTransactions = getTransactionsByPeriod(7);
    const entries = recentTransactions.filter(t => t.type === 'entrée').length;
    const exits = recentTransactions.filter(t => t.type === 'sortie').length;
    setTransactionStats({ entries, exits });
    
    // Prepare category data for pie chart
    const catData = categories.map(category => {
      const categoryProducts = products.filter(p => p.categoryId === category.id);
      const value = categoryProducts.reduce((sum, p) => sum + p.quantity, 0);
      return {
        name: category.name,
        value: value
      };
    }).filter(item => item.value > 0);
    setCategoryData(catData);
    
    // Prepare transaction data for bar chart
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: format(date, 'dd/MM', { locale: fr }),
        fullDate: date,
        entries: 0,
        exits: 0
      };
    }).reverse();
    
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const dayIndex = last7Days.findIndex(day => 
        transactionDate.getDate() === day.fullDate.getDate() && 
        transactionDate.getMonth() === day.fullDate.getMonth() &&
        transactionDate.getFullYear() === day.fullDate.getFullYear()
      );
      
      if (dayIndex !== -1) {
        if (transaction.type === 'entrée') {
          last7Days[dayIndex].entries += transaction.quantity;
        } else {
          last7Days[dayIndex].exits += transaction.quantity;
        }
      }
    });
    
    setTransactionData(last7Days);
  }, [products, categories, transactions, getProductsLowInStock, getRecentTransactions, getTotalStockValue, getTransactionsByPeriod]);
  
  const COLORS = ['#4f46e5', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981'];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };
  
  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Produit inconnu';
  };
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">
          {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <CardHeader className="bg-blue-500 text-white p-4 pb-8">
              <CardTitle className="flex items-center justify-between">
                <span>Produits</span>
                <Package className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent className="-mt-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                <div className="text-3xl font-bold">{products.length}</div>
                <p className="text-muted-foreground text-sm mt-1">Produits en stock</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <CardHeader className="bg-green-500 text-white p-4 pb-8">
              <CardTitle className="flex items-center justify-between">
                <span>Valeur</span>
                <DollarSign className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent className="-mt-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                <div className="text-3xl font-bold">{totalValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
                <p className="text-muted-foreground text-sm mt-1">Valeur totale du stock</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <CardHeader className="bg-indigo-500 text-white p-4 pb-8">
              <CardTitle className="flex items-center justify-between">
                <span>Entrées</span>
                <TrendingUp className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent className="-mt-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                <div className="text-3xl font-bold">{transactionStats.entries}</div>
                <p className="text-muted-foreground text-sm mt-1">Entrées (7 derniers jours)</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <CardHeader className="bg-orange-500 text-white p-4 pb-8">
              <CardTitle className="flex items-center justify-between">
                <span>Sorties</span>
                <TrendingDown className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent className="-mt-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                <div className="text-3xl font-bold">{transactionStats.exits}</div>
                <p className="text-muted-foreground text-sm mt-1">Sorties (7 derniers jours)</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Mouvements de stock
                </CardTitle>
              </div>
              <CardDescription>Entrées et sorties des 7 derniers jours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={transactionData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="entries" name="Entrées" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="exits" name="Sorties" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-blue-500" />
                  Répartition par catégorie
                </CardTitle>
              </div>
              <CardDescription>Distribution des produits par catégorie</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} unités`, 'Quantité']} />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Low Stock Alert */}
      <motion.div variants={itemVariants}>
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Alertes de stock
            </CardTitle>
            <CardDescription>Produits dont le stock est inférieur au seuil d'alerte</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">Aucun produit en rupture de stock</p>
            ) : (
              <div className="space-y-2">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">Stock actuel: {product.quantity} / Seuil: {product.threshold}</p>
                    </div>
                    <Badge variant="destructive">{product.quantity === 0 ? 'Rupture' : 'Faible'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate('/products')}>
              Voir tous les produits
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
      
      {/* Recent Transactions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Transactions récentes
            </CardTitle>
            <CardDescription>Les 5 dernières transactions enregistrées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'entrée' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {transaction.type === 'entrée' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium">{getProductName(transaction.productId)}</p>
                      <Badge variant={transaction.type === 'entrée' ? 'success' : 'warning'}>
                        {transaction.type === 'entrée' ? '+' : '-'}{transaction.quantity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), 'dd/MM/yyyy HH:mm')} - {transaction.notes}
                    </p>
                  </div>
                </div>
              ))}
              
              {recentTransactions.length === 0 && (
                <p className="text-center py-4 text-muted-foreground">Aucune transaction récente</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate('/transactions')}>
              Voir toutes les transactions
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;