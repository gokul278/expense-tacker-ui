import React, { useEffect, useState } from 'react';
import { useDate } from '../context/DateContext';
import client from '../api/client';
import type { Expense } from '../types';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  ChartBar, ForkKnife, Car, House, FirstAid, Television,
  ShoppingBag, BookOpen, Airplane, Receipt, DotsThreeCircle, CurrencyInr
} from '@phosphor-icons/react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const categoryIcons: Record<string, any> = {
  'Food & Dining': ForkKnife,
  'Transport': Car,
  'Housing': House,
  'Health': FirstAid,
  'Entertainment': Television,
  'Shopping': ShoppingBag,
  'Education': BookOpen,
  'Travel': Airplane,
  'Bills & EMIs': Receipt,
  'Miscellaneous': DotsThreeCircle
};

const Categories: React.FC = () => {
  const { month, year } = useDate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const resp = await client.get(`/api/expenses?month=${month}&year=${year}`);
        setExpenses(resp.data);
      } catch (err) {
        console.error('Error fetching categories data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month, year]);

  const totalSpent = (expenses || []).reduce((sum, e) => sum + e.amount, 0);

  const catTotals: Record<string, number> = {};
  (expenses || []).forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });

  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

  const fmt = (val: number) => Math.round(val).toLocaleString('en-IN');
  const pct = (val: number, total: number) => total > 0 ? Math.round((val / total) * 100) : 0;

  const barData = {
    labels: sortedCats.map(c => c[0].replace(/^[^\s]+\s/, '')),
    datasets: [{
      label: 'Spending',
      data: sortedCats.map(c => c[1]),
      backgroundColor: '#c8f064',
      borderRadius: 8,
    }]
  };

  if (loading) return <div className="text-muted text-center py-20">Loading data...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="mb-8 ml-1">
        <h1 className="text-4xl font-serif tracking-tight text-[#f0f0ee]">Spending Categories</h1>
        <p className="text-muted mt-1 text-sm tracking-wide">Visual breakdown of your expenses by area</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedCats.length === 0 ? (
          <div className="md:col-span-2 glass-card p-12 text-center text-muted border-dashed border-2 border-white/5 bg-transparent">
            <div className="w-16 h-16 bg-surface2 rounded-2xl flex items-center justify-center mx-auto mb-4 text-dim">
              <ChartBar size={32} weight="duotone" />
            </div>
            <p className="font-medium">No expenses recorded for this month</p>
            <p className="text-xs mt-1">Start by adding your first expense in the sidebar</p>
          </div>
        ) : sortedCats.map(([cat, amt]) => {
          const Icon = categoryIcons[cat] || DotsThreeCircle;
          return (
            <div key={cat} className="glass-card p-5 flex items-center gap-4 group hover:border-accent/20 transition-all">
              <div className="w-12 h-12 flex items-center justify-center bg-surface2 rounded-xl text-accent group-hover:scale-110 transition-transform">
                <Icon size={24} weight="duotone" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-medium text-[#f0f0ee] truncate">{cat}</span>
                  <div className="flex items-center gap-0.5 text-base font-serif text-accent">
                    <CurrencyInr size={14} weight="bold" />
                    {fmt(amt)}
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-muted mb-2">
                  <span>{pct(amt, totalSpent)}% of total</span>
                  <span>{(expenses || []).filter(e => e.category === cat).length} transactions</span>
                </div>
                <div className="h-1.5 bg-dim rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-1000 ease-out"
                    style={{ width: `${pct(amt, totalSpent)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sortedCats.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-sm text-muted font-semibold mb-8">Monthly Trend Comparison</h2>
          <div className="h-[400px]">
            <Bar
              data={barData}
              options={{
                indexAxis: 'y',
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#7a7f8a', font: { size: 10 } } },
                  y: { grid: { display: false }, ticks: { color: '#f0f0ee', font: { size: 10 } } }
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
