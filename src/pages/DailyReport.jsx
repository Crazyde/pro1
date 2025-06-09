import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Package,
  Clock,
  Download
} from 'lucide-react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStock } from '@/context/StockContext';
import { formatCurrency } from '@/lib/currencyUtils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const DailyReport = () => {
  const { products, transactions } = useStock();
  const [dailyStats, setDailyStats] = useState({
    totalTransactions: 0,
    entries: 0,
    exits: 0,
    totalValue: 0,
    transactions: []
  });

  useEffect(() => {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    const todayTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= start && date <= end;
    });

    const entries = todayTransactions.filter(t => t.type === 'entrée');
    const exits = todayTransactions.filter(t => t.type === 'sortie');

    const entriesValue = entries.reduce((sum, t) => {
      const product = products.find(p => p.id === t.productId);
      return sum + (product ? product.price * t.quantity : 0);
    }, 0);

    const exitsValue = exits.reduce((sum, t) => {
      const product = products.find(p => p.id === t.productId);
      return sum + (product ? product.price * t.quantity : 0);
    }, 0);

    setDailyStats({
      totalTransactions: todayTransactions.length,
      entries: entries.length,
      exits: exits.length,
      totalValue: entriesValue - exitsValue,
      transactions: todayTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))
    });
  }, [transactions, products]);

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Produit inconnu';
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(`Point Quotidien - ${format(new Date(), 'dd/MM/yyyy', { locale: fr })}`, 20, 20);
    
    doc.setFontSize(12);
    doc.text('Statistiques du jour:', 20, 40);
    doc.text(`Total des transactions: ${dailyStats.totalTransactions}`, 30, 50);
    doc.text(`Entrées: ${dailyStats.entries}`, 30, 60);
    doc.text(`Sorties: ${dailyStats.exits}`, 30, 70);
    doc.text(`Valeur nette des mouvements: ${formatCurrency(dailyStats.totalValue)}`, 30, 80);
    
    doc.autoTable({
      startY: 100,
      head: [['Heure', 'Produit', 'Type', 'Quantité', 'Notes']],
      body: dailyStats.transactions.map(t => [
        format(new Date(t.date), 'HH:mm', { locale: fr }),
        getProductName(t.productId),
        t.type,
        t.quantity,
        t.notes
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [63, 131, 248] }
    });
    
    doc.setFontSize(8);
    doc.text(
      `Généré le ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr })}`,
      doc.internal.pageSize.width - 60,
      doc.internal.pageSize.height - 10
    );
    
    doc.save(`point-quotidien-${format(new Date(), 'dd-MM-yyyy')}.pdf`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 }}
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 }}
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Point Quotidien</h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
          </p>
        </div>
        <Button onClick={generatePDF}>
          <Download className="mr-2 h-4 w-4" />
          Télécharger le rapport
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { title: "Transactions", value: dailyStats.totalTransactions, icon: Package, color: "blue" },
            { title: "Entrées", value: dailyStats.entries, icon: TrendingUp, color: "green" },
            { title: "Sorties", value: dailyStats.exits, icon: TrendingDown, color: "orange" },
            { title: "Valeur Nette", value: formatCurrency(dailyStats.totalValue), icon: DollarSign, color: "indigo" }
        ].map((stat, index) => (
            <motion.div variants={itemVariants} key={index}>
            <Card className="overflow-hidden">
                <CardHeader className={`bg-${stat.color}-500 text-white p-4 pb-8`}>
                <CardTitle className="flex items-center justify-between">
                    <span>{stat.title}</span>
                    <stat.icon className="h-5 w-5" />
                </CardTitle>
                </CardHeader>
                <CardContent className="-mt-4">
                <div className="bg-card dark:bg-gray-800 rounded-lg p-4 shadow-md">
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <p className="text-muted-foreground text-sm mt-1">
                    {stat.title === "Valeur Nette" ? "Mouvements de stock" : `${stat.title} du jour`}
                    </p>
                </div>
                </CardContent>
            </Card>
            </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Transactions du jour
            </CardTitle>
            <CardDescription>
              Liste chronologique des mouvements de stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dailyStats.transactions.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  Aucune transaction aujourd'hui
                </p>
              ) : (
                dailyStats.transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors rounded-md">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                      transaction.type === 'entrée' ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' : 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400'
                    }`}>
                      {transaction.type === 'entrée' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">{getProductName(transaction.productId)}</p>
                        <Badge variant={transaction.type === 'entrée' ? 'success' : 'warning'} className="text-xs">
                          {transaction.type === 'entrée' ? '+' : '-'}{transaction.quantity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.date), 'HH:mm', { locale: fr })}
                        {transaction.notes && ` - ${transaction.notes}`}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default DailyReport;