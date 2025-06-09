import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GeneralSettingsCard from '@/components/settings/GeneralSettingsCard';
import DataManagementCard from '@/components/settings/DataManagementCard';
import ResetDataDialog from '@/components/settings/ResetDataDialog';
import { useToast } from '@/components/ui/use-toast';

const Settings = () => {
  const { toast } = useToast();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  
  const handleResetDataConfirm = () => {
    localStorage.removeItem('products');
    localStorage.removeItem('categories');
    localStorage.removeItem('suppliers');
    localStorage.removeItem('transactions');
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.length > 0) {
      localStorage.setItem('users', JSON.stringify([users[0]])); // Keep first user
    } else {
       const defaultUser = { id: '1', name: 'Admin', email: 'admin@stockmaster.com', role: 'Admin' };
       localStorage.setItem('users', JSON.stringify([defaultUser]));
    }
    
    setIsResetDialogOpen(false);
    
    toast({
      title: 'Données réinitialisées',
      description: 'Toutes les données ont été supprimées (sauf l\'utilisateur admin). Veuillez rafraîchir la page.',
    });
  };
  
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
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold">Paramètres</h1>
      
      <motion.div variants={itemVariants}>
        <GeneralSettingsCard />
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <DataManagementCard onResetRequest={() => setIsResetDialogOpen(true)} />
      </motion.div>
      
      <ResetDataDialog
        isOpen={isResetDialogOpen}
        onOpenChange={setIsResetDialogOpen}
        onConfirm={handleResetDataConfirm}
      />
    </motion.div>
  );
};

export default Settings;