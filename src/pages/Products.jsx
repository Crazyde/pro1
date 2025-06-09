import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Package } from 'lucide-react';
import { useStock } from '@/context/StockContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import ProductCard from '@/components/products/ProductCard';
import ProductForm from '@/components/products/ProductForm';

const Products = () => {
  const { toast } = useToast();
  const { products, categories, suppliers, addProduct, updateProduct, deleteProduct } = useStock();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  
  const initialFormData = {
    name: '', sku: '', categoryId: '', supplierId: '',
    price: '', quantity: '', threshold: '', description: ''
  };
  const [formData, setFormData] = useState(initialFormData);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (categoryFilter !== 'all') {
      result = result.filter(product => product.categoryId === categoryFilter);
    }
    if (stockFilter === 'low') {
      result = result.filter(product => product.quantity > 0 && product.quantity <= product.threshold);
    } else if (stockFilter === 'out') {
      result = result.filter(product => product.quantity === 0);
    }
    
    result.sort((a, b) => a.name.localeCompare(b.name)); // Default sort by name
    return result;
  }, [products, searchTerm, categoryFilter, stockFilter]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.sku || !formData.categoryId || !formData.supplierId) {
      toast({
        title: 'Erreur de validation',
        description: 'Veuillez remplir tous les champs obligatoires (*).',
        variant: 'destructive',
      });
      return false;
    }
    if (parseFloat(formData.price) < 0 || parseInt(formData.quantity) < 0 || parseInt(formData.threshold) < 0) {
       toast({
        title: 'Erreur de validation',
        description: 'Les valeurs numériques ne peuvent pas être négatives.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };
  
  const processProductData = (data) => ({
    ...data,
    price: parseFloat(data.price) || 0,
    quantity: parseInt(data.quantity) || 0,
    threshold: parseInt(data.threshold) || 0,
  });

  const handleAddProduct = () => {
    if (!validateForm()) return;
    const productData = processProductData(formData);
    addProduct(productData);
    setIsAddDialogOpen(false);
    setFormData(initialFormData);
  };
  
  const handleEditProduct = () => {
    if (!currentProduct || !validateForm()) return;
    const productData = processProductData(formData);
    updateProduct(currentProduct.id, productData);
    setIsEditDialogOpen(false);
    setCurrentProduct(null);
    setFormData(initialFormData);
  };
  
  const handleDeleteProduct = () => {
    if (!currentProduct) return;
    deleteProduct(currentProduct.id);
    setIsDeleteDialogOpen(false);
    setCurrentProduct(null);
  };
  
  const openEditDialog = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId,
      supplierId: product.supplierId,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      threshold: product.threshold.toString(),
      description: product.description || '',
    });
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };
  
  const getCategoryName = (categoryId) => categories.find(c => c.id === categoryId)?.name || 'N/A';
  const getSupplierName = (supplierId) => suppliers.find(s => s.id === supplierId)?.name || 'N/A';
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Produits</h1>
        <Button onClick={() => { setFormData(initialFormData); setIsAddDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter un produit
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="Rechercher..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger><div className="flex items-center"><Filter className="mr-2 h-4 w-4" /><SelectValue placeholder="Filtrer par catégorie" /></div></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger><div className="flex items-center"><Package className="mr-2 h-4 w-4" /><SelectValue placeholder="Filtrer par stock" /></div></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les produits</SelectItem>
            <SelectItem value="low">Stock faible</SelectItem>
            <SelectItem value="out">Rupture de stock</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {filteredProducts.length === 0 ? (
        <div className="text-center py-10"><Package className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-lg font-medium">Aucun produit trouvé</h3><p className="mt-1 text-gray-500">Essayez de modifier vos filtres.</p></div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} onEdit={openEditDialog} onDelete={openDeleteDialog} getCategoryName={getCategoryName} getSupplierName={getSupplierName} />
          ))}
        </motion.div>
      )}
      
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Ajouter un produit</DialogTitle><DialogDescription>Remplissez les informations pour ajouter un nouveau produit.</DialogDescription></DialogHeader>
          <ProductForm formData={formData} handleInputChange={handleInputChange} handleSelectChange={handleSelectChange} categories={categories} suppliers={suppliers} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleAddProduct}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Modifier un produit</DialogTitle><DialogDescription>Modifiez les informations du produit.</DialogDescription></DialogHeader>
          <ProductForm formData={formData} handleInputChange={handleInputChange} handleSelectChange={handleSelectChange} categories={categories} suppliers={suppliers} isEdit={true} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleEditProduct}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Supprimer le produit</DialogTitle><DialogDescription>Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.</DialogDescription></DialogHeader>
          {currentProduct && (<div className="py-4"><p className="font-medium">{currentProduct.name}</p><p className="text-sm text-muted-foreground">SKU: {currentProduct.sku}</p></div>)}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;