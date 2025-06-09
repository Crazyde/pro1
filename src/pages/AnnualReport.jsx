import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { format, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStock } from '@/context/StockContext';
import { formatCurrency } from '@/lib/currencyUtils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AnnualReport = () => {
  const { transactions, products } = useStock();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState([]);
  const [annualStats, setAnnualStats] = useState({
    totalTransactions: 0,
    totalEntries: 0,
    totalExits: 0,
    totalValue: 0
  });

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  useEffect(() => {
    const startDate = startOfYear(new Date(selectedYear, 0));
    const endDate = endOfYear(new Date(selectedYear, 0));
    const months = eachMonthOfInterval({ start: startDate, end: endDate });

    const monthlyStats = months.map(month => {
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return (
          transactionDate.getMonth() === month.getMonth() &&
          transactionDate.getFullYear() === month.getFullYear()
        );
      });

      const entries = monthTransactions.filter(t => t.type === 'entrée');
      const exits = monthTransactions.filter(t => t.type === 'sortie');

      const entriesValue = entries.reduce((sum, t) => {
        const product = products.find(p => p.id === t.productId);
        return sum + (product ? product.price * t.quantity : 0);
      }, 0);

      const exitsValue = exits.reduce((sum, t) => {
        const product = products.find(p => p.id === t.productId);
        return sum + (product ? product.price * t.quantity : 0);
      }, 0);

      return {
        month: format(month, 'MMMM', { locale: fr }),
        shortMonth: format(month, 'MMM', { locale: fr }),
        entries: entries.length,
        exits: exits.length,
        entriesValue,
        exitsValue
      };
    });

    setMonthlyData(monthlyStats);

    const yearlyStats = monthlyStats.reduce(
      (acc, month) => ({
        totalTransactions: acc.totalTransactions + month.entries + month.exits,
        totalEntries: acc.totalEntries + month.entries,
        totalExits: acc.totalExits + month.exits,
        totalValue: acc.totalValue + month.entriesValue - month.exitsValue 
      }),
      { totalTransactions: 0, totalEntries: 0, totalExits: 0, totalValue: 0 }
    );

    setAnnualStats(yearlyStats);
  }, [selectedYear, transactions, products]);

  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(`Bilan Annuel ${selectedYear}`, 20, 20);
    
    doc.setFontSize(12);
    doc.text('Statistiques Annuelles:', 20, 40);
    doc.text(`Total des transactions: ${annualStats.totalTransactions}`, 30, 50);
    doc.text(`Entrées: ${annualStats.totalEntries}`, 30, 60);
    doc.text(`Sorties: ${annualStats.totalExits}`, 30, 70);
    doc.text(`Valeur nette des mouvements: ${formatCurrency(annualStats.totalValue)}`, 30, 80);
    
    doc.autoTable({
      startY: 100,
      head: [['Mois', 'Entrées', 'Sorties', 'Valeur Entrées (FCFA)', 'Valeur Sorties (FCFA)']],
      body: monthlyData.map(data => [
        data.month,
        data.entries,
        data.exits,
        formatCurrency(data.entriesValue),
        formatCurrency(data.exitsValue)
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [63, 131, 248] }
    });
    
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Généré le ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr })}`,
        doc.internal.pageSize.width - 60,
        doc.internal.pageSize.height - 10
      );
    }
    
    doc.save(`bilan-annuel-${selectedYear}.pdf`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 }}
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 }}
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border p-2 rounded shadow-lg">
          <p className="label font-bold">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.dataKey.includes('Value') ? formatCurrency(entry.value) : entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Bilan Annuel</h1>
        <div className="flex items-center gap-4">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sélectionner l'année" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={generatePDF}>
            <Download className="mr-2 h-4 w-4" />
            Télécharger le bilan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Transactions", value: annualStats.totalTransactions, icon: BarChart3, color: "blue" },
          { title: "Entrées", value: annualStats.totalEntries, icon: TrendingUp, color: "green" },
          { title: "Sorties", value: annualStats.totalExits, icon: TrendingDown, color: "orange" },
          { title: "Valeur Nette", value: formatCurrency(annualStats.totalValue), icon: DollarSign, color: "indigo" }
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
                    {stat.title === "Valeur Nette" ? "Mouvements de stock" : `Total des ${stat.title.toLowerCase()}`}
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
            <CardTitle>Évolution mensuelle (Quantités)</CardTitle>
            <CardDescription>Nombre d'entrées et de sorties par mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="shortMonth" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar name="Entrées" dataKey="entries" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar name="Sorties" dataKey="exits" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Évolution mensuelle (Valeur)</CardTitle>
            <CardDescription>Valeur des entrées et sorties par mois en FCFA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="shortMonth" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar name="Valeur Entrées" dataKey="entriesValue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar name="Valeur Sorties" dataKey="exitsValue" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AnnualReport;