import React from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useStock } from '@/context/StockContext';

const DataManagementCard = ({ onResetRequest }) => {
  const { toast } = useToast();
  const { users } = useStock(); 

  const handleExportData = () => {
    try {
      const companyName = localStorage.getItem('companyName') || 'Ma Société';
      const data = {
        products: JSON.parse(localStorage.getItem('products') || '[]'),
        categories: JSON.parse(localStorage.getItem('categories') || '[]'),
        suppliers: JSON.parse(localStorage.getItem('suppliers') || '[]'),
        transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
        users: JSON.parse(localStorage.getItem('users') || '[]'),
        settings: {
          companyName
        }
      };
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `stock-export-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: 'Exportation réussie',
        description: 'Vos données ont été exportées avec succès.',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Erreur d\'exportation',
        description: 'Une erreur est survenue lors de l\'exportation des données.',
        variant: 'destructive',
      });
    }
  };
  
  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (!data.products || !data.categories || !data.suppliers || !data.transactions || !data.users) {
          throw new Error('Format de fichier invalide ou données utilisateurs manquantes.');
        }
        
        localStorage.setItem('products', JSON.stringify(data.products));
        localStorage.setItem('categories', JSON.stringify(data.categories));
        localStorage.setItem('suppliers', JSON.stringify(data.suppliers));
        localStorage.setItem('transactions', JSON.stringify(data.transactions));
        localStorage.setItem('users', JSON.stringify(data.users));
        
        if (data.settings && data.settings.companyName) {
          localStorage.setItem('companyName', data.settings.companyName);
        }
        
        toast({
          title: 'Importation réussie',
          description: 'Vos données ont été importées. Veuillez rafraîchir la page.',
        });
      } catch (error) {
        console.error('Error importing data:', error);
        toast({
          title: 'Erreur d\'importation',
          description: `Le fichier sélectionné n'est pas valide. ${error.message}`,
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
    event.target.value = null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des données</CardTitle>
        <CardDescription>
          Exportez, importez ou réinitialisez vos données de stock.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Exporter les données</Label>
          <p className="text-sm text-muted-foreground">
            Téléchargez toutes vos données (produits, catégories, fournisseurs, transactions, utilisateurs) dans un fichier JSON.
          </p>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Exporter les données
          </Button>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <Label htmlFor="importFile">Importer les données</Label>
          <p className="text-sm text-muted-foreground">
            Importez des données à partir d'un fichier JSON. Cela écrasera les données existantes.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => document.getElementById('importFile').click()}>
              <Upload className="mr-2 h-4 w-4" />
              Sélectionner un fichier
            </Button>
            <Input
              id="importFile"
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <Label>Réinitialiser les données</Label>
          <p className="text-sm text-muted-foreground">
            Supprimez toutes les données de stock et les utilisateurs (sauf le premier utilisateur admin par défaut). Cette action est irréversible.
          </p>
          <Button variant="destructive" onClick={onResetRequest}>
            <Trash2 className="mr-2 h-4 w-4" />
            Réinitialiser les données
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataManagementCard;