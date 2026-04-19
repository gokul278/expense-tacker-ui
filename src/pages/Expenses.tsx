import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { useDate } from '../context/DateContext';
import type { Expense } from '../types';
import { MagnifyingGlass, Trash, CurrencyInr, Note, X } from '@phosphor-icons/react';

const AllExpenses: React.FC = () => {
  const { month, year } = useDate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [selectedNote, setSelectedNote] = useState<{name: string, content: string} | null>(null);

  const fetchData = async (m: string, y: number) => {
    setLoading(true);
    try {
      const resp = await client.get('/api/expenses', {
        params: { month: m, year: y }
      });
      setExpenses(resp.data);
    } catch (err) {
      console.error('Error fetching expenses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(month, year);
  }, [month, year]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await client.delete(`/api/expenses/${id}`);
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (err) {
      console.error('Error deleting expense', err);
    }
  };

  const filteredExpenses = (expenses || []).filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCat === '' || e.category === filterCat;
    const matchesTag = filterTag === '' || e.tag === filterTag;
    return matchesSearch && matchesCat && matchesTag;
  });

  const fmt = (val: number) => Math.round(val).toLocaleString('en-IN');
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const categories = [...new Set((expenses || []).map(e => e.category))];
  const tags = [...new Set((expenses || []).map(e => e.tag).filter(t => t))];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="ml-1">
        <h1 className="text-4xl font-serif tracking-tight text-[#f0f0ee]">All Expenses</h1>
        <p className="text-muted mt-1 text-sm tracking-wide">Browse, search and manage all your logged data</p>
      </header>

      <div className="glass-card p-6 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" size={18} />
            <input 
              type="text" 
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface2 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#f0f0ee] focus:border-accent outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="bg-surface2 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-[#f0f0ee] focus:border-accent outline-none appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select 
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="bg-surface2 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-muted focus:border-accent outline-none appearance-none"
            >
              <option value="">All Tags</option>
              {tags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar relative border border-white/5 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-20 bg-surface2/95 backdrop-blur-md shadow-sm">
              <tr className="text-[10px] uppercase tracking-widest text-muted border-b border-white/5">
                <th className="px-4 py-4 font-medium">Date</th>
                <th className="px-4 py-4 font-medium">Name</th>
                <th className="px-4 py-4 font-medium">Category</th>
                <th className="px-4 py-4 font-medium">Tag</th>
                <th className="px-4 py-4 font-medium">Mode</th>
                <th className="px-4 py-4 font-medium">Notes</th>
                <th className="px-4 py-4 font-medium text-right">Amount</th>
                <th className="px-4 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted">Loading expenses...</td></tr>
              ) : filteredExpenses.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted">No expenses found matching filters.</td></tr>
              ) : filteredExpenses.map((e) => (
                <tr key={e.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-4 text-xs text-muted font-medium whitespace-nowrap">
                    {formatDate(e.date)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#f0f0ee]">{e.name}</span>
                      {e.recurring && <span className="text-[10px] text-accent2 px-1.5 py-0.5 bg-accent2/10 rounded">↻</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[11px] px-2.5 py-1 bg-surface2 border border-white/5 rounded-full text-muted group-hover:text-[#f0f0ee] transition-colors">
                      {e.category}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {e.tag && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter
                        ${e.tag === 'Need' ? 'text-danger bg-danger/10' : 
                          e.tag === 'Want' ? 'text-[#c07af0] bg-[#c07af0]/10' : 
                          'text-accent2 bg-accent2/10'}
                      `}>
                        {e.tag}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[11px] text-muted">{e.mode || '—'}</span>
                  </td>
                  <td className="px-4 py-4">
                    {e.notes ? (
                      <button 
                        onClick={() => setSelectedNote({ name: e.name, content: e.notes })}
                        className="flex items-center gap-2 group/note"
                      >
                        <p className="text-[11px] text-muted truncate max-w-[120px] group-hover/note:text-accent transition-colors">
                          {e.notes}
                        </p>
                        <Note size={14} weight="duotone" className="text-dim group-hover/note:text-accent transition-colors shrink-0" />
                      </button>
                    ) : (
                      <span className="text-[11px] text-dim">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex items-center gap-1 text-base font-serif text-[#f0f0ee]">
                      <CurrencyInr size={14} weight="bold" />
                      {fmt(e.amount)}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(e.id)}
                      className="text-dim hover:text-danger p-2 transition-colors"
                    >
                      <Trash size={18} weight="duotone" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Note Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-bg/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setSelectedNote(null)}
          />
          <div className="relative w-full max-w-lg glass-card p-8 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-sm text-muted font-medium uppercase tracking-wider mb-2">Transaction Note</h3>
                <h2 className="text-xl font-serif text-[#f0f0ee]">{selectedNote.name}</h2>
              </div>
              <button 
                onClick={() => setSelectedNote(null)}
                className="p-2 bg-surface2 border border-white/5 rounded-xl text-muted hover:text-[#f0f0ee] transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="bg-surface2/50 border border-white/5 rounded-2xl p-6 relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Note size={80} weight="duotone" />
              </div>
              <p className="text-[#f0f0ee]/90 text-[15px] leading-relaxed relative z-10 whitespace-pre-wrap">
                {selectedNote.content}
              </p>
            </div>

            <button 
              onClick={() => setSelectedNote(null)}
              className="w-full mt-8 bg-surface2 border border-white/10 rounded-xl py-3 text-sm font-medium text-[#f0f0ee] hover:bg-white/5 transition-all"
            >
              Close Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllExpenses;
