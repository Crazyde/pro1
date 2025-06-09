import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const GeneralSettingsCard = () => {
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    const storedCompanyName = localStorage.getItem('companyName') || 'Ma Société';
    setCompanyName(storedCompanyName);
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('companyName', companyName);
    toast({
      title: 'Paramètres enregistrés',
      description: 'Vos paramètres généraux ont été enregistrés avec succès.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres généraux</CardTitle>
        <CardDescription>
          Configurez les paramètres de base de votre application de gestion de stock.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">Nom de l'entreprise</Label>
          <Input
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveSettings}>
          <Save className="mr-2 h-4 w-4" />
          Enregistrer les paramètres
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GeneralSettingsCard;