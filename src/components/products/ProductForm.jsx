import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const ProductForm = ({ formData, handleInputChange, handleSelectChange, categories, suppliers, isEdit = false }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor={isEdit ? "edit-name" : "name"}>Nom du produit *</Label>
        <Input
          id={isEdit ? "edit-name" : "name"}
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="ex: Ordinateur portable"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={isEdit ? "edit-sku" : "sku"}>SKU (Référence) *</Label>
        <Input
          id={isEdit ? "edit-sku" : "sku"}
          name="sku"
          value={formData.sku}
          onChange={handleInputChange}
          placeholder="ex: ORD-001"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={isEdit ? "edit-categoryId" : "categoryId"}>Catégorie *</Label>
        <Select 
          value={formData.categoryId} 
          onValueChange={(value) => handleSelectChange('categoryId', value)}
        >
          <SelectTrigger id={isEdit ? "edit-categoryId" : "categoryId"}>
            <SelectValue placeholder="Sélectionner une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={isEdit ? "edit-supplierId" : "supplierId"}>Fournisseur *</Label>
        <Select 
          value={formData.supplierId} 
          onValueChange={(value) => handleSelectChange('supplierId', value)}
        >
          <SelectTrigger id={isEdit ? "edit-supplierId" : "supplierId"}>
            <SelectValue placeholder="Sélectionner un fournisseur" />
          </SelectTrigger>
          <SelectContent>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={isEdit ? "edit-price" : "price"}>Prix unitaire (FCFA)</Label>
        <Input
          id={isEdit ? "edit-price" : "price"}
          name="price"
          type="number"
          step="1"
          min="0"
          value={formData.price}
          onChange={handleInputChange}
          placeholder="0"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={isEdit ? "edit-quantity" : "quantity"}>Quantité {isEdit ? 'en stock' : 'initiale'}</Label>
        <Input
          id={isEdit ? "edit-quantity" : "quantity"}
          name="quantity"
          type="number"
          min="0"
          value={formData.quantity}
          onChange={handleInputChange}
          placeholder="0"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={isEdit ? "edit-threshold" : "threshold"}>Seuil d'alerte</Label>
        <Input
          id={isEdit ? "edit-threshold" : "threshold"}
          name="threshold"
          type="number"
          min="0"
          value={formData.threshold}
          onChange={handleInputChange}
          placeholder="5"
        />
      </div>
      
      <div className="sm:col-span-2 space-y-2">
        <Label htmlFor={isEdit ? "edit-description" : "description"}>Description</Label>
        <Textarea
          id={isEdit ? "edit-description" : "description"}
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Description du produit..."
          rows={3}
        />
      </div>
    </div>
  );
};

export default ProductForm;