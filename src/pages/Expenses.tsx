import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { useDate } from '../context/DateContext';
import type { Expense } from '../types';
import { MagnifyingGlass, Trash, CurrencyInr, Note, X, PencilSimple, CaretDown, Check } from '@phosphor-icons/react';

const AllExpenses: React.FC = () => {
  const { month, year } = useDate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [selectedNote, setSelectedNote] = useState<{name: string, content: string} | null>(null);

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    amount: '',
    date: '',
    category: '',
    mode: '',
    tag: '',
    recurring: false,
    notes: '',
    month: '',
    year: 0
  });
  const [editCategoryDropdownOpen, setEditCategoryDropdownOpen] = useState(false);
  const [editModeDropdownOpen, setEditModeDropdownOpen] = useState(false);
  const [editTagDropdownOpen, setEditTagDropdownOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const categoryOptions = [
    'Food & Dining',
    'Transport',
    'Housing',
    'Health',
    'Entertainment',
    'Shopping',
    'Education',
    'Travel',
    'Bills & EMIs',
    'Miscellaneous'
  ];

  const modeOptions = [
    'UPI',
    'Cash',
    'Credit Card',
    'Debit Card',
    'Net Banking'
  ];

  const tagOptions = [
    'Need',
    'Want',
    'Investment'
  ];

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

  const handleEditClick = (e: Expense) => {
    setEditFormData({
      name: e.name,
      amount: e.amount.toString(),
      date: new Date(e.date).toISOString().split('T')[0],
      category: e.category,
      mode: e.mode || '',
      tag: e.tag || '',
      recurring: e.recurring || false,
      notes: e.notes || '',
      month: e.month,
      year: e.year
    });
    setEditingExpense(e);
    setEditCategoryDropdownOpen(false);
    setEditModeDropdownOpen(false);
    setEditTagDropdownOpen(false);
  };

  const handleUpdateEdit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!editingExpense) return;
    if (!editFormData.amount || isNaN(parseFloat(editFormData.amount))) return;
    if (!editFormData.name || !editFormData.category) {
      alert('Please fill out all required fields (*)');
      return;
    }

    setUpdating(true);
    try {
      const d = new Date(editFormData.date);
      const mNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const updatedMonth = mNames[d.getMonth()];
      const updatedYear = d.getFullYear();

      await client.put(`/api/expenses/${editingExpense.id}`, {
        ...editFormData,
        amount: parseFloat(editFormData.amount),
        date: d.toISOString(),
        month: updatedMonth,
        year: updatedYear
      });
      await fetchData(month, year);
      setEditingExpense(null);
    } catch (err) {
      console.error('Error updating expense', err);
      alert('Failed to update expense. Please try again.');
    } finally {
      setUpdating(false);
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
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted">Loading expenses...</td></tr>
              ) : filteredExpenses.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted">No expenses found matching filters.</td></tr>
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
                    <div className="flex justify-end items-center gap-2">
                      <button 
                        onClick={() => handleEditClick(e)}
                        className="text-dim hover:text-accent p-2 transition-colors"
                      >
                        <PencilSimple size={18} weight="duotone" />
                      </button>
                      <button 
                        onClick={() => handleDelete(e.id)}
                        className="text-dim hover:text-danger p-2 transition-colors"
                      >
                        <Trash size={18} weight="duotone" />
                      </button>
                    </div>
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

      {/* Edit Modal */}
      {editingExpense && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 bg-bg/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setEditingExpense(null)}
          />
          <div className="relative w-full max-w-lg glass-card p-8 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-sm text-accent font-medium uppercase tracking-wider mb-2">Edit Expense</h3>
                <h2 className="text-xl font-serif text-[#f0f0ee]">Update expense details</h2>
              </div>
              <button 
                onClick={() => setEditingExpense(null)}
                className="p-2 bg-surface2 border border-white/5 rounded-xl text-muted hover:text-[#f0f0ee] transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateEdit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Expense Name *</label>
                <input
                  required
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f0f0ee] focus:border-accent outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider flex items-center gap-1">
                    Amount <CurrencyInr size={12} weight="bold" /> *
                  </label>
                  <input
                    required
                    type="number"
                    value={editFormData.amount}
                    onChange={(e) => setEditFormData({...editFormData, amount: e.target.value})}
                    className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f0f0ee] focus:border-accent outline-none transition-all font-serif font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Date *</label>
                  <input
                    required
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
                    className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f0f0ee] focus:border-accent outline-none transition-all color-scheme-dark"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 relative">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Category *</label>
                  <button
                    type="button"
                    onClick={() => { setEditCategoryDropdownOpen(!editCategoryDropdownOpen); setEditModeDropdownOpen(false); setEditTagDropdownOpen(false); }}
                    className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-all flex items-center justify-between"
                  >
                    <span className="text-[#f0f0ee]">{editFormData.category || 'Select'}</span>
                    <CaretDown size={14} className={`transition-transform duration-300 ${editCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {editCategoryDropdownOpen && (
                    <div className="absolute z-[110] top-full left-0 right-0 mt-2 bg-surface2 border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 max-h-48 overflow-y-auto custom-scrollbar">
                      {categoryOptions.map((c) => (
                        <button key={c} type="button" onClick={() => { setEditFormData({...editFormData, category: c}); setEditCategoryDropdownOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${editFormData.category === c ? 'bg-accent/10 text-accent' : 'text-muted hover:bg-white/5 hover:text-[#f0f0ee]'}`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 relative">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Payment Mode</label>
                  <button
                    type="button"
                    onClick={() => { setEditModeDropdownOpen(!editModeDropdownOpen); setEditCategoryDropdownOpen(false); setEditTagDropdownOpen(false); }}
                    className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-all flex items-center justify-between"
                  >
                    <span className="text-[#f0f0ee]">{editFormData.mode || 'Direct'}</span>
                    <CaretDown size={14} className={`transition-transform duration-300 ${editModeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {editModeDropdownOpen && (
                    <div className="absolute z-[110] top-full left-0 right-0 mt-2 bg-surface2 border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2">
                      {modeOptions.map((m) => (
                        <button key={m} type="button" onClick={() => { setEditFormData({...editFormData, mode: m}); setEditModeDropdownOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${editFormData.mode === m ? 'bg-accent/10 text-accent' : 'text-muted hover:bg-white/5 hover:text-[#f0f0ee]'}`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 relative">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Tag</label>
                  <button
                    type="button"
                    onClick={() => { setEditTagDropdownOpen(!editTagDropdownOpen); setEditCategoryDropdownOpen(false); setEditModeDropdownOpen(false); }}
                    className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-all flex items-center justify-between"
                  >
                    <span className="text-[#f0f0ee]">{editFormData.tag || 'None'}</span>
                    <CaretDown size={14} className={`transition-transform duration-300 ${editTagDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {editTagDropdownOpen && (
                    <div className="absolute z-[110] top-full left-0 right-0 mt-2 bg-surface2 border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2">
                      <button type="button" onClick={() => { setEditFormData({...editFormData, tag: ''}); setEditTagDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:bg-white/5 hover:text-[#f0f0ee] transition-colors"
                      >
                        None
                      </button>
                      {tagOptions.map((t) => (
                        <button key={t} type="button" onClick={() => { setEditFormData({...editFormData, tag: t}); setEditTagDropdownOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${editFormData.tag === t ? 'bg-accent/10 text-accent' : 'text-muted hover:bg-white/5 hover:text-[#f0f0ee]'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider block">Special Flags</label>
                  <label className="group flex items-center gap-3 p-3 bg-surface2 rounded-xl border border-white/5 cursor-pointer hover:bg-white/[0.02] transition-colors w-full h-[46px]">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        checked={editFormData.recurring}
                        onChange={(e) => setEditFormData({...editFormData, recurring: e.target.checked})}
                        className="peer appearance-none w-5 h-5 border-2 border-white/20 rounded-md checked:bg-accent checked:border-accent transition-all cursor-pointer" 
                      />
                      <Check size={12} weight="bold" className="absolute text-bg opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <span className="text-sm font-medium text-[#f0f0ee]">Is recurring?</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-muted uppercase tracking-wider font-semibold">Additional Notes</label>
                <textarea
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                  className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f0f0ee] focus:border-accent outline-none transition-all h-20 resize-none placeholder:text-dim"
                  placeholder="Optional details..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="flex-1 bg-surface2 border border-white/10 rounded-xl py-3 text-sm font-medium text-[#f0f0ee] hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-accent text-bg rounded-xl py-3 text-sm font-semibold hover:bg-[#d4f57a] transition-all disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllExpenses;
