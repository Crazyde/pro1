import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar,
  Download,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  ArrowUpDown
} from 'lucide-react';
import { format, subMonths, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStock } from '@/context/StockContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const TransactionHistory = () => {
  const { products, transactions } = useStock();
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  useEffect(() => {
    let filtered = [...transactions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction => {
        const product = products.find(p => p.id === transaction.productId);
        const productName = product ? product.name.toLowerCase() : '';
        return (
          productName.includes(searchTerm.toLowerCase()) ||
          transaction.notes.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Apply period filter
    if (periodFilter !== 'all') {
      const today = new Date();
      const intervals = {
        '1m': subMonths(today, 1),
        '3m': subMonths(today, 3),
        '6m': subMonths(today, 6),
      };
      
      if (intervals[periodFilter]) {
        filtered = filtered.filter(transaction => 
          isWithinInterval(new Date(transaction.date), {
            start: intervals[periodFilter],
            end: today
          })
        );
      }
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === typeFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortConfig.key === 'date') {
        return sortConfig.direction === 'asc'
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }
      return 0;
    });

    setFilteredTransactions(filtered);
  }, [transactions, products, searchTerm, periodFilter, typeFilter, sortConfig]);

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Produit inconnu';
  };

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Titre
    doc.setFontSize(20);
    doc.text('Historique des Transactions', 20, 20);
    
    // Filtres appliqués
    doc.setFontSize(12);
    doc.text('Filtres:', 20, 35);
    doc.text(`Période: ${periodFilter === 'all' ? 'Toutes' : periodFilter}`, 30, 45);
    doc.text(`Type: ${typeFilter === 'all' ? 'Tous' : typeFilter}`, 30, 55);
    
    // Tableau des transactions
    doc.autoTable({
      startY: 70,
      head: [['Date', 'Produit', 'Type', 'Quantité', 'Notes']],
      body: filteredTransactions.map(t => [
        format(new Date(t.date), 'dd/MM/yyyy HH:mm'),
        getProductName(t.productId),
        t.type,
        t.quantity,
        t.notes
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [63, 131, 248] }
    });
    
    // Pied de page
    doc.setFontSize(8);
    doc.text(
      `Généré le ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
      doc.internal.pageSize.width - 60,
      doc.internal.pageSize.height - 10
    );
    
    doc.save(`historique-transactions-${format(new Date(), 'dd-MM-yyyy')}.pdf`);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Historique des Transactions</h1>
        <Button onClick={generatePDF}>
          <Download className="mr-2 h-4 w-4" />
          Exporter l'historique
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Rechercher..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Période" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les périodes</SelectItem>
            <SelectItem value="1m">Dernier mois</SelectItem>
            <SelectItem value="3m">3 derniers mois</SelectItem>
            <SelectItem value="6m">6 derniers mois</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Type" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="entrée">Entrées</SelectItem>
            <SelectItem value="sortie">Sorties</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant="outline" 
          onClick={() => {
            setSearchTerm('');
            setPeriodFilter('all');
            setTypeFilter('all');
          }}
        >
          Réinitialiser les filtres
        </Button>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="flex items-center p-0 hover:bg-transparent"
                    onClick={() => handleSort('date')}
                  >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Aucune transaction trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {format(new Date(transaction.date), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </TableCell>
                    <TableCell>{getProductName(transaction.productId)}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === 'entrée' ? 'success' : 'warning'}>
                        {transaction.type === 'entrée' ? (
                          <TrendingUp className="mr-1 h-3 w-3" />
                        ) : (
                          <TrendingDown className="mr-1 h-3 w-3" />
                        )}
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.quantity}</TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {transaction.notes}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TransactionHistory;