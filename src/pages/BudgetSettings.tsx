import React, { useEffect, useState } from 'react';
import { useDate } from '../context/DateContext';
import client from '../api/client';
import type { Expense, Budget } from '../types';
import { Target, TrendUp, WarningCircle, CheckCircle, ShieldCheck, CurrencyInr } from '@phosphor-icons/react';

const BudgetSettings: React.FC = () => {
  const { month, year } = useDate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState<Budget>({ userId: '', month, year, income: 0, savingsTarget: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [expResp, budResp] = await Promise.all([
          client.get(`/api/expenses?month=${month}&year=${year}`),
          client.get(`/api/budget?month=${month}&year=${year}`)
        ]);
        setExpenses(expResp.data);
        setBudget(budResp.data);
      } catch (err) {
        console.error('Error fetching budget data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month, year]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await client.post('/api/budget', budget);
      setMessage('✓ Changes saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error saving budget', err);
      setMessage('⚠ Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const totalSpent = (expenses || []).reduce((sum, e) => sum + e.amount, 0);
  const needs = (expenses || []).filter(e => e.tag === 'Need').reduce((s, e) => s + e.amount, 0);
  const wants = (expenses || []).filter(e => e.tag === 'Want').reduce((s, e) => s + e.amount, 0);
  const investments = (expenses || []).filter(e => e.tag === 'Investment').reduce((s, e) => s + e.amount, 0);

  const income = budget.income || 0;
  const savings = budget.savingsTarget || 0;
  const totalInvested = investments + savings;

  const pct = (val: number, total: number) => total > 0 ? Math.round((val / total) * 100) : 0;
  const fmt = (val: number) => Math.round(val).toLocaleString('en-IN');

  const rule503020 = [
    { label: 'Needs', target: 50, actual: pct(needs, income), color: '#E0652A', val: needs },
    { label: 'Wants', target: 30, actual: pct(wants, income), color: '#7F77DD', val: wants },
    { label: 'Savings/Investment', target: 20, actual: pct(totalInvested, income), color: '#1D9E75', val: totalInvested },
  ];

  if (loading) return <div className="text-muted text-center py-20">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="mb-8 ml-1">
        <h1 className="text-4xl font-serif tracking-tight text-[#f0f0ee]">Budget Configuration</h1>
        <p className="text-muted mt-1 text-sm tracking-wide">Adjust your income and savings targets</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-card p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm text-muted font-semibold flex items-center gap-2">
              <Target size={20} weight="duotone" className="text-accent" />
              Monthly Budget Configuration
            </h2>
            {message && <span className={`text-xs font-medium ${message.includes('✓') ? 'text-accent' : 'text-danger'}`}>{message}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Monthly Income (₹)</label>
              <input
                type="number"
                value={budget.income}
                onChange={(e) => setBudget({ ...budget, income: parseFloat(e.target.value) || 0 })}
                className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f0f0ee] focus:border-accent outline-none transition-all"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Savings Target (₹)</label>
              <input
                type="number"
                value={budget.savingsTarget}
                onChange={(e) => setBudget({ ...budget, savingsTarget: parseFloat(e.target.value) || 0 })}
                className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f0f0ee] focus:border-accent outline-none transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="mt-8 p-6 bg-surface2 border border-white/5 rounded-2xl grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] text-muted uppercase tracking-tight mb-1">Income</p>
              <div className="flex items-center gap-1 text-2xl font-serif font-bold text-info">
                <CurrencyInr size={18} weight="bold" />
                {fmt(income)}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-muted uppercase tracking-tight mb-1">Expenses</p>
              <div className="flex items-center gap-1 text-2xl font-serif font-bold text-accent3">
                <CurrencyInr size={18} weight="bold" />
                {fmt(totalSpent)}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-muted uppercase tracking-tight mb-1">Leftover</p>
              <div className={`flex items-center gap-1 text-2xl font-serif font-bold ${income - savings - totalSpent < 0 ? 'text-danger' : 'text-accent'}`}>
                <CurrencyInr size={18} weight="bold" />
                {fmt(income - savings - totalSpent)}
              </div>
            </div>
          </div>

          <button
            type="submit"
            onClick={handleSave}
            disabled={saving}
            className="mt-8 w-full bg-accent hover:bg-[#d4f57a] text-bg font-serif text-lg py-4 rounded-xl transition-all shadow-xl shadow-accent/20 active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>

        <div className="glass-card p-6 flex flex-col justify-center text-center">
          <div className="w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendUp size={24} weight="duotone" />
          </div>
          <h3 className="text-sm text-muted font-bold mb-2">Target vs Actual</h3>
          <p className="text-xs text-muted mb-6 px-4">See how your current spending aligns with your monthly goals.</p>
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted">Spent</span>
              <span className="text-[#f0f0ee]">{pct(totalSpent, income)}%</span>
            </div>
            <div className="h-2 bg-dim rounded-full overflow-hidden">
              <div className="h-full bg-accent3" style={{ width: `${Math.min(pct(totalSpent, income), 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-accent/10 rounded-lg text-accent">
            <ShieldCheck size={20} weight="duotone" />
          </div>
          <h2 className="text-sm text-muted font-semibold">50 / 30 / 20 Rule Analysis</h2>
        </div>

        <div className="space-y-8">
          {rule503020.map((rule) => {
            const diff = Math.abs(rule.actual - rule.target);
            const isOk = diff <= 10;
            return (
              <div key={rule.label} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#f0f0ee]">{rule.label} <span className="text-muted font-normal text-xs ml-2">Target {rule.target}%</span></p>
                    <div className="flex items-center gap-0.5 text-xs text-muted">
                      <CurrencyInr size={10} weight="bold" />
                      {fmt(rule.val)} total this month
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${isOk ? 'text-accent' : 'text-danger'} flex items-center gap-1.5 justify-end`}>
                      {rule.actual}%
                      {isOk ? <CheckCircle size={14} weight="fill" /> : <WarningCircle size={14} weight="fill" />}
                    </p>
                    <p className="text-[10px] text-muted">{isOk ? 'On Track' : 'Review Required'}</p>
                  </div>
                </div>
                <div className="h-2.5 bg-dim rounded-full overflow-hidden flex">
                  <div className="h-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(rule.actual, 100)}%`, backgroundColor: rule.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BudgetSettings;
