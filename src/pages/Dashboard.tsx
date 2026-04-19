import React, { useEffect, useState } from 'react';
import { useDate } from '../context/DateContext';
import client from '../api/client';
import type { Expense, Budget } from '../types';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Bank, Target, CreditCard, Wallet, CurrencyInr } from '@phosphor-icons/react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard: React.FC = () => {
  const { month, year } = useDate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [vaultBalance, setVaultBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [expResp, budResp, vaultResp] = await Promise.all([
          client.get(`/api/expenses?month=${month}&year=${year}`),
          client.get(`/api/budget?month=${month}&year=${year}`),
          client.get('/api/vault/balance')
        ]);
        setExpenses(expResp.data);
        setBudget(budResp.data);
        setVaultBalance(vaultResp.data.balance || 0);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month, year]);

  const totalSpent = (expenses || []).reduce((sum, e) => sum + e.amount, 0);
  const income = budget?.income || 0;
  const savingsTarget = budget?.savingsTarget || 0;
  const usableLeft = income - savingsTarget - totalSpent;

  const fmt = (val: number) => Math.round(val).toLocaleString('en-IN');
  const pct = (val: number, total: number) => total > 0 ? Math.round((val / total) * 100) : 0;

  const donutData = {
    labels: ['Expenses', 'Savings', 'Usable'],
    datasets: [{
      data: [totalSpent, savingsTarget, Math.max(0, usableLeft)],
      backgroundColor: ['#E0652A', '#1D9E75', '#c8f064'],
      borderWidth: 0,
      hoverOffset: 4,
    }]
  };

  const catTotals: Record<string, number> = {};
  (expenses || []).forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });

  const barData = {
    labels: Object.keys(catTotals),
    datasets: [{
      label: 'Spending',
      data: Object.values(catTotals),
      backgroundColor: '#64a8f0',
      borderRadius: 6,
    }]
  };

  if (loading) return <div className="flex items-center justify-center h-full text-muted">Loading Dashboard...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-4xl font-serif tracking-tight text-[#f0f0ee]">{month} {year}</h1>
        <p className="text-muted mt-1">Your financial overview for the month</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card p-6 relative overflow-hidden group border-[#c07af0]/20">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[11px] font-medium text-muted uppercase tracking-wider mb-1 text-[#c07af0]">Savings Vault</p>
              <div className="flex items-center gap-1.5 text-4xl font-serif text-[#c07af0]">
                <CurrencyInr weight="duotone" size={32} />
                {fmt(vaultBalance)}
              </div>
            </div>
            <div className="p-2 bg-[#c07af0]/10 text-[#c07af0] rounded-lg group-hover:scale-110 transition-transform">
              <Target size={24} weight="duotone" />
            </div>
          </div>
          <div className="h-1 bg-dim rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-[#c07af0] w-full opacity-50" />
          </div>
        </div>

        <div className="glass-card p-6 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[11px] font-medium text-muted uppercase tracking-wider mb-1">Monthly Income</p>
              <div className="flex items-center gap-1.5 text-4xl font-serif text-info">
                <CurrencyInr weight="duotone" size={32} />
                {fmt(income)}
              </div>
            </div>
            <div className="p-2 bg-info/10 text-info rounded-lg group-hover:scale-110 transition-transform">
              <Bank size={24} weight="duotone" />
            </div>
          </div>
          <div className="h-1 bg-dim rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-info w-full" />
          </div>
        </div>
        <div className="glass-card p-6 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[11px] font-medium text-muted uppercase tracking-wider mb-1">Savings Target</p>
              <div className="flex items-center gap-1.5 text-4xl font-serif text-accent2">
                <CurrencyInr weight="duotone" size={32} />
                {fmt(savingsTarget)}
              </div>
            </div>
            <div className="p-2 bg-accent2/10 text-accent2 rounded-lg group-hover:scale-110 transition-transform">
              <Target size={24} weight="duotone" />
            </div>
          </div>
          <div className="h-1 bg-dim rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-accent2" style={{ width: `${Math.min(pct(savingsTarget, income), 100)}%` }} />
          </div>
        </div>
        <div className="glass-card p-6 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[11px] font-medium text-muted uppercase tracking-wider mb-1">Total Expenses</p>
              <div className="flex items-center gap-1.5 text-4xl font-serif text-accent3">
                <CurrencyInr weight="duotone" size={32} />
                {fmt(totalSpent)}
              </div>
            </div>
            <div className="p-2 bg-accent3/10 text-accent3 rounded-lg group-hover:scale-110 transition-transform">
              <CreditCard size={24} weight="duotone" />
            </div>
          </div>
          <div className="h-1 bg-dim rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-accent3" style={{ width: `${Math.min(pct(totalSpent, income), 100)}%` }} />
          </div>
        </div>
        <div className="glass-card p-6 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[11px] font-medium text-muted uppercase tracking-wider mb-1">Usable Left</p>
              <div className="flex items-center gap-1.5 text-4xl font-serif text-accent">
                <CurrencyInr weight="duotone" size={32} />
                {fmt(usableLeft)}
              </div>
            </div>
            <div className={`p-2 rounded-lg group-hover:scale-110 transition-transform ${usableLeft < 0 ? 'bg-danger/10 text-danger' : 'bg-accent/10 text-accent'}`}>
              <Wallet size={24} weight="duotone" />
            </div>
          </div>
          <div className="h-1 bg-dim rounded-full mt-4 overflow-hidden">
            <div className={`h-full ${usableLeft < 0 ? 'bg-danger' : 'bg-accent'}`} style={{ width: `${Math.max(0, Math.min(pct(usableLeft, income), 100))}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Money Split Donut */}
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-sm text-muted font-semibold mb-6">Money Split</h2>
          <div className="relative h-64">
            <Doughnut
              data={donutData}
              options={{ cutout: '75%', plugins: { legend: { display: false } }, maintainAspectRatio: false }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="flex items-center gap-1 text-2xl font-serif text-[#f0f0ee]">
                <CurrencyInr size={22} weight="bold" />
                {fmt(income)}
              </div>
              <span className="text-[10px] text-muted tracking-widest uppercase">Income</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-6 justify-center">
            {donutData.labels.map((l, i) => (
              <div key={l} className="flex items-center gap-2 text-[11px] text-[#f0f0ee] opacity-80 font-medium">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: donutData.datasets[0].backgroundColor[i] }} />
                {l}: <div className="inline-flex items-center gap-0.5 ml-1"><CurrencyInr size={10} weight="bold" /> {fmt(donutData.datasets[0].data[i])}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Bar Chart */}
        <div className="lg:col-span-3 glass-card p-6">
          <h2 className="text-sm text-muted font-semibold mb-6">Spending by Category</h2>
          <div className="h-64">
            <Bar
              data={barData}
              options={{
                indexAxis: 'y',
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#7a7f8a', font: { size: 10 } }
                  },
                  y: {
                    grid: { display: false },
                    ticks: { color: '#f0f0ee', font: { size: 11 } }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
