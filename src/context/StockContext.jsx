import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { loadDataFromStorage, saveDataToStorage } from '@/services/localStorageService';

const StockContext = createContext();

export const useStock = () => useContext(StockContext);

export const StockProvider = ({ children }) => {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const data = loadDataFromStorage();
      setProducts(data.products);
      setCategories(data.categories);
      setSuppliers(data.suppliers);
      setTransactions(data.transactions);
      setUsers(data.users);
    } catch (error) {
      console.error('Error loading data from localStorageService:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isLoading) {
      saveDataToStorage({ products, categories, suppliers, transactions, users });
    }
  }, [products, categories, suppliers, transactions, users, isLoading]);

  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setProducts(prev => [...prev, newProduct]);
    if (newProduct.quantity > 0) {
      addTransaction({
        type: 'entrée',
        productId: newProduct.id,
        quantity: newProduct.quantity,
        date: new Date().toISOString(),
        notes: 'Stock initial',
      });
    }
    toast({
      title: 'Produit ajouté',
      description: `${newProduct.name} a été ajouté avec succès.`,
    });
    return newProduct;
  };

  const updateProduct = (id, updatedProductData) => {
    const oldProduct = products.find(p => p.id === id);
    
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === id ? { ...product, ...updatedProductData } : product
      )
    );
    
    if (oldProduct) {
      const quantityDiff = updatedProductData.quantity - oldProduct.quantity;
      if (quantityDiff !== 0) {
        addTransaction({
          type: quantityDiff > 0 ? 'entrée' : 'sortie',
          productId: id,
          quantity: Math.abs(quantityDiff),
          date: new Date().toISOString(),
          notes: 'Mise à jour manuelle du stock',
        });
      }
    }
    toast({
      title: 'Produit mis à jour',
      description: `${updatedProductData.name} a été mis à jour avec succès.`,
    });
  };

  const deleteProduct = (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    setProducts(prev => prev.filter(p => p.id !== id));
    toast({
      title: 'Produit supprimé',
      description: `${product.name} a été supprimé avec succès.`,
    });
  };

  const addCategory = (category) => {
    const newCategory = { ...category, id: Date.now().toString() };
    setCategories(prev => [...prev, newCategory]);
    toast({
      title: 'Catégorie ajoutée',
      description: `${newCategory.name} a été ajoutée avec succès.`,
    });
    return newCategory;
  };

  const updateCategory = (id, updatedCategory) => {
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, ...updatedCategory } : cat));
    toast({
      title: 'Catégorie mise à jour',
      description: `${updatedCategory.name} a été mise à jour avec succès.`,
    });
  };

  const deleteCategory = (id) => {
    const category = categories.find(c => c.id === id);
    if (!category) return false;
    const inUse = products.some(product => product.categoryId === id);
    if (inUse) {
      toast({
        title: 'Action impossible',
        description: 'Cette catégorie est utilisée par des produits.',
        variant: 'destructive',
      });
      return false;
    }
    setCategories(prev => prev.filter(cat => cat.id !== id));
    toast({
      title: 'Catégorie supprimée',
      description: `${category.name} a été supprimée avec succès.`,
    });
    return true;
  };

  const addSupplier = (supplier) => {
    const newSupplier = { ...supplier, id: Date.now().toString() };
    setSuppliers(prev => [...prev, newSupplier]);
    toast({
      title: 'Fournisseur ajouté',
      description: `${newSupplier.name} a été ajouté avec succès.`,
    });
    return newSupplier;
  };

  const updateSupplier = (id, updatedSupplier) => {
    setSuppliers(prev => prev.map(sup => sup.id === id ? { ...sup, ...updatedSupplier } : sup));
    toast({
      title: 'Fournisseur mis à jour',
      description: `${updatedSupplier.name} a été mis à jour avec succès.`,
    });
  };

  const deleteSupplier = (id) => {
    const supplier = suppliers.find(s => s.id === id);
    if (!supplier) return false;
    const inUse = products.some(product => product.supplierId === id);
    if (inUse) {
      toast({
        title: 'Action impossible',
        description: 'Ce fournisseur est utilisé par des produits.',
        variant: 'destructive',
      });
      return false;
    }
    setSuppliers(prev => prev.filter(sup => sup.id !== id));
    toast({
      title: 'Fournisseur supprimé',
      description: `${supplier.name} a été supprimé avec succès.`,
    });
    return true;
  };

  const addTransaction = (transaction) => {
    const newTransaction = { ...transaction, id: Date.now().toString() };
    setTransactions(prev => [...prev, newTransaction].sort((a,b) => new Date(b.date) - new Date(a.date)));
    
    const product = products.find(p => p.id === transaction.productId);
    if (product) {
      const newQuantity = transaction.type === 'entrée' 
        ? product.quantity + transaction.quantity 
        : product.quantity - transaction.quantity;
      
      setProducts(prevProducts => prevProducts.map(p => 
        p.id === product.id ? { ...p, quantity: Math.max(0, newQuantity) } : p // Ensure quantity doesn't go below 0
      ));
    }
    
    toast({
      title: 'Transaction enregistrée',
      description: `${transaction.type === 'entrée' ? 'Entrée' : 'Sortie'} de stock enregistrée.`,
    });
    return newTransaction;
  };

  const addUser = (user) => {
    const newUser = { ...user, id: Date.now().toString() };
    setUsers(prev => [...prev, newUser]);
    toast({
      title: 'Utilisateur ajouté',
      description: `${newUser.name} a été ajouté avec succès.`,
    });
    return newUser;
  };

  const updateUser = (id, updatedUser) => {
    setUsers(prev => prev.map(user => user.id === id ? { ...user, ...updatedUser } : user));
    toast({
      title: 'Utilisateur mis à jour',
      description: `${updatedUser.name} a été mis à jour avec succès.`,
    });
  };

  const deleteUser = (id) => {
    if (users.length <= 1) {
      toast({
        title: 'Action impossible',
        description: 'Vous ne pouvez pas supprimer le dernier utilisateur.',
        variant: 'destructive',
      });
      return false;
    }
    const user = users.find(u => u.id === id);
    if(!user) return false;
    setUsers(prev => prev.filter(u => u.id !== id));
    toast({
      title: 'Utilisateur supprimé',
      description: `${user.name} a été supprimé avec succès.`,
    });
    return true;
  };

  const getProductsLowInStock = () => products.filter(p => p.quantity <= p.threshold);
  const getProductsByCategory = () => {
    const result = {};
    categories.forEach(category => {
      result[category.name] = products.filter(product => product.categoryId === category.id);
    });
    return result;
  };
  const getRecentTransactions = (limit = 5) => [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
  const getTotalStockValue = () => products.reduce((total, p) => total + (p.price * p.quantity), 0);
  const getTransactionsByPeriod = (days = 7) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return transactions.filter(t => new Date(t.date) >= startDate);
  };

  return (
    <StockContext.Provider value={{
      products, categories, suppliers, transactions, users, isLoading,
      addProduct, updateProduct, deleteProduct,
      addCategory, updateCategory, deleteCategory,
      addSupplier, updateSupplier, deleteSupplier,
      addTransaction,
      addUser, updateUser, deleteUser,
      getProductsLowInStock, getProductsByCategory, getRecentTransactions, getTotalStockValue, getTransactionsByPeriod
    }}>
      {children}
    </StockContext.Provider>
  );
};