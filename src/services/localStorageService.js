import React from 'react';

const PRODUCTS_KEY = 'products';
const CATEGORIES_KEY = 'categories';
const SUPPLIERS_KEY = 'suppliers';
const TRANSACTIONS_KEY = 'transactions';
const USERS_KEY = 'users';

const getSampleProducts = () => [
  { id: '1', name: 'Ordinateur Portable', sku: 'ORD-001', categoryId: '1', supplierId: '1', price: 590000, quantity: 15, threshold: 5, description: 'Ordinateur portable haute performance', createdAt: new Date().toISOString() },
  { id: '2', name: 'Smartphone', sku: 'SMART-001', categoryId: '1', supplierId: '2', price: 325000, quantity: 25, threshold: 8, description: 'Smartphone dernière génération', createdAt: new Date().toISOString() },
];

const getSampleCategories = () => [
  { id: '1', name: 'Électronique', description: 'Produits électroniques et gadgets' },
  { id: '2', name: 'Mobilier', description: 'Meubles et accessoires de bureau' },
];

const getSampleSuppliers = () => [
  { id: '1', name: 'TechPro', contact: 'Jean Dupont', email: 'contact@techpro.com', phone: '01 23 45 67 89', address: '123 Rue de la Tech, Paris' },
  { id: '2', name: 'MobileTech', contact: 'Marie Martin', email: 'info@mobiletech.com', phone: '01 98 76 54 32', address: '456 Avenue Mobile, Lyon' },
];

const getSampleTransactions = () => [
  { id: '1', type: 'entrée', productId: '1', quantity: 10, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Réapprovisionnement régulier' },
  { id: '2', type: 'sortie', productId: '1', quantity: 2, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Vente client' },
];

const getDefaultUser = () => ({ id: '1', name: 'Admin', email: 'admin@mic-services.com', role: 'Admin' });


export const loadDataFromStorage = () => {
  const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || getSampleProducts();
  const categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY)) || getSampleCategories();
  const suppliers = JSON.parse(localStorage.getItem(SUPPLIERS_KEY)) || getSampleSuppliers();
  const transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY)) || getSampleTransactions();
  let users = JSON.parse(localStorage.getItem(USERS_KEY));

  if (!users || users.length === 0) {
    users = [getDefaultUser()];
  }

  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(suppliers));
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  return { products, categories, suppliers, transactions, users };
};

export const saveDataToStorage = (data) => {
  if (data.products) localStorage.setItem(PRODUCTS_KEY, JSON.stringify(data.products));
  if (data.categories) localStorage.setItem(CATEGORIES_KEY, JSON.stringify(data.categories));
  if (data.suppliers) localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(data.suppliers));
  if (data.transactions) localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(data.transactions));
  if (data.users) localStorage.setItem(USERS_KEY, JSON.stringify(data.users));
};

export const resetAllData = () => {
  localStorage.removeItem(PRODUCTS_KEY);
  localStorage.removeItem(CATEGORIES_KEY);
  localStorage.removeItem(SUPPLIERS_KEY);
  localStorage.removeItem(TRANSACTIONS_KEY);
  localStorage.removeItem(USERS_KEY);
  return loadDataFromStorage();
};