import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currencyUtils';

const ProductCard = ({ product, onEdit, onDelete, getCategoryName, getSupplierName }) => {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <motion.div variants={itemVariants} className="product-card-hover">
      <Card className="overflow-hidden h-full flex flex-col">
        <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <CardContent className="p-6 flex-grow flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
              </div>
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(product)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(product)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm font-medium">Prix</p>
                <p className="text-lg font-bold">{formatCurrency(product.price)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Quantité</p>
                <div className="flex items-center">
                  <p className="text-lg font-bold">{product.quantity}</p>
                  {product.quantity <= product.threshold && product.quantity > 0 && (
                    <div className="ml-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </div>
                  )}
                  {product.quantity === 0 && (
                     <div className="ml-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Badge variant="secondary" className="mr-2 mb-1">
                {getCategoryName(product.categoryId)}
              </Badge>
              <Badge variant="outline" className="mb-1">
                {getSupplierName(product.supplierId)}
              </Badge>
            </div>
            
            {product.description && (
              <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            )}
          </div>
          
          <div className="mt-4">
            {product.quantity === 0 ? (
              <Badge variant="destructive">Rupture de stock</Badge>
            ) : product.quantity <= product.threshold ? (
              <Badge variant="warning">Stock faible</Badge>
            ) : (
              <Badge variant="success">En stock</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductCard;