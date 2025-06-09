import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const ResetDataDialog = ({ isOpen, onOpenChange, onConfirm }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Réinitialiser les données</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer toutes les données ? Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm">
            Toutes vos données (produits, catégories, fournisseurs, transactions et utilisateurs, à l'exception du premier utilisateur admin) seront définitivement supprimées.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Confirmer la suppression
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResetDataDialog;