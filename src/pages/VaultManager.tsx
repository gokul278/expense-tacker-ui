import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { 
  Target, CurrencyInr, Plus, Minus, ArrowDown, Trash,
  Receipt, DotsThreeCircle, CaretDown, QrCode, Money, 
  CreditCard, Globe, Note, X, PencilSimple
} from '@phosphor-icons/react';

const VaultManager: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [selectedNote, setSelectedNote] = useState<{ name: string; content: string } | null>(null);

  const [editingTx, setEditingTx] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    amount: '',
    type: 'deposit',
    category: '',
    mode: '',
    notes: '',
    date: ''
  });
  const [editCategoryDropdownOpen, setEditCategoryDropdownOpen] = useState(false);
  const [editModeDropdownOpen, setEditModeDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: 'deposit', // 'deposit', 'withdrawal', 'expense'
    category: '',
    mode: '',
    recurring: false,
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);

  const categories = [
    { name: 'Work', icon: Receipt },
    { name: 'Freelancing', icon: Globe },
    { name: 'Other Income', icon: CurrencyInr },
    { name: 'Vault Expense', icon: DotsThreeCircle },
  ];

  const modes = [
    { name: 'UPI', icon: QrCode },
    { name: 'Cash', icon: Money },
    { name: 'Credit Card', icon: CreditCard },
    { name: 'Debit Card', icon: CreditCard },
    { name: 'Net Banking', icon: Globe },
  ];

  const fetchBalance = async () => {
    try {
      const resp = await client.get('/api/vault/balance');
      setBalance(resp.data.balance || 0);
    } catch (err) {
      console.error('Error fetching vault balance', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const resp = await client.get('/api/vault/history');
      setHistory(resp.data || []);
    } catch (err) {
      console.error('Error fetching vault history', err);
    }
  };

  const initData = async () => {
    setLoading(true);
    await Promise.all([fetchBalance(), fetchHistory()]);
    setLoading(false);
  };

  useEffect(() => {
    initData();
  }, []);

  const handleUpdate = async (type: 'deposit' | 'expense') => {
    if (!formData.amount || isNaN(parseFloat(formData.amount))) return;
    if (!formData.name || !formData.category) {
      setStatus({ msg: 'Please fill out all required fields (*)', type: 'error' });
      return;
    }
    
    setUpdating(true);
    setStatus(null);
    try {
      const d = new Date(formData.date);
      await client.post('/api/vault/update', { 
        ...formData,
        amount: parseFloat(formData.amount),
        type: type,
        date: d.toISOString()
      });
      await Promise.all([fetchBalance(), fetchHistory()]);
      setFormData({ 
        name: '', amount: '', type: 'deposit', category: '', 
        mode: '', recurring: false, notes: '', 
        date: new Date().toISOString().split('T')[0] 
      });
      setStatus({ msg: `Successfully recorded vault ${type}.`, type: 'success' });
    } catch (err) {
      console.error('Error updating vault', err);
      setStatus({ msg: 'Failed to update vault. Please try again.', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this history record?')) return;
    try {
      await client.delete(`/api/vault/history/${id}`);
      setHistory(history.filter(h => h.id !== id));
      await fetchBalance();
    } catch (err) {
      console.error('Error deleting history', err);
    }
  };

  const handleEditClick = (tx: any) => {
    setEditFormData({
      name: tx.name,
      amount: tx.amount.toString(),
      type: tx.type,
      category: tx.category,
      mode: tx.mode || '',
      notes: tx.notes || '',
      date: new Date(tx.date).toISOString().split('T')[0]
    });
    setEditingTx(tx);
    setEditCategoryDropdownOpen(false);
    setEditModeDropdownOpen(false);
  };

  const handleUpdateEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    if (!editFormData.amount || isNaN(parseFloat(editFormData.amount))) return;
    if (!editFormData.name || !editFormData.category) {
      alert('Please fill out all required fields (*)');
      return;
    }

    setUpdating(true);
    try {
      const d = new Date(editFormData.date);
      await client.put(`/api/vault/history/${editingTx.id}`, {
        ...editFormData,
        amount: parseFloat(editFormData.amount),
        date: d.toISOString()
      });
      await Promise.all([fetchBalance(), fetchHistory()]);
      setEditingTx(null);
      setStatus({ msg: 'Vault transaction successfully updated.', type: 'success' });
    } catch (err) {
      console.error('Error updating vault transaction', err);
      alert('Failed to update transaction. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const fmt = (val: number) => Math.round(val).toLocaleString('en-IN');

  const selectedCategory = categories.find(c => c.name === formData.category);
  const selectedMode = modes.find(m => m.name === formData.mode);

  if (loading) return <div className="flex items-center justify-center h-full text-muted font-medium">Loading Vault Status...</div>;

  return (
    <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="mb-8 ml-1">
        <h1 className="text-4xl font-serif tracking-tight text-[#f0f0ee]">Savings Vault</h1>
        <p className="text-muted mt-1 text-sm tracking-wide">Manage permanent recordings and high-fidelity vault tracking</p>
      </header>

      <div className="space-y-6">
        {/* Main Balance Card */}
        <div className="glass-card p-10 relative overflow-hidden group border-[#c07af0]/30 shadow-2xl shadow-[#c07af0]/5">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Target size={120} weight="duotone" className="text-[#c07af0]" />
          </div>
          
          <div className="relative z-10">
            <p className="text-[11px] font-medium text-muted uppercase tracking-widest mb-2 text-[#c07af0]">Total Vault Balance</p>
            <div className="flex items-center gap-3 text-6xl font-serif text-[#f0f0ee]">
              <CurrencyInr weight="bold" size={48} className="text-[#c07af0]" />
              {fmt(balance)}
            </div>
          </div>
        </div>

        {/* Unified Transaction Form */}
        <div className="glass-card p-8">
          <h2 className="text-[11px] font-medium text-[#c07af0] uppercase tracking-widest mb-6">Record Vault Transaction</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">
            <div className="sm:col-span-2 space-y-2">
              <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Transaction Name *</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f0f0ee] focus:border-[#c07af0] outline-none transition-all"
                placeholder="e.g. Monthly Savings or Laptop Purchase"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-muted uppercase tracking-wider flex items-center gap-1">
                Amount <CurrencyInr size={12} weight="bold" /> *
              </label>
              <input
                required
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f0f0ee] focus:border-[#c07af0] outline-none transition-all font-serif font-bold"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Date *</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f0f0ee] focus:border-[#c07af0] outline-none transition-all color-scheme-dark"
              />
            </div>

            <div className="space-y-2 relative">
              <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Category *</label>
              <button
                type="button"
                onClick={() => { setIsDropdownOpen(!isDropdownOpen); setModeDropdownOpen(false); }}
                className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#c07af0] outline-none transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {selectedCategory ? (
                    <>
                      <selectedCategory.icon size={18} weight="duotone" className="text-[#c07af0]" />
                      <span className="text-[#f0f0ee]">{selectedCategory.name}</span>
                    </>
                  ) : (
                    <span className="text-muted">— Select —</span>
                  )}
                </div>
                <CaretDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-surface2 border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200 max-h-48 overflow-y-auto custom-scrollbar">
                  {categories.map((cat) => (
                    <button key={cat.name} type="button" onClick={() => { setFormData({...formData, category: cat.name}); setIsDropdownOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${formData.category === cat.name ? 'bg-[#c07af0]/10 text-[#c07af0]' : 'text-muted hover:bg-white/5 hover:text-[#f0f0ee]'}`}
                    >
                      <cat.icon size={18} weight={formData.category === cat.name ? "fill" : "duotone"} />
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 relative">
              <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Payment Mode</label>
              <button
                type="button"
                onClick={() => { setModeDropdownOpen(!modeDropdownOpen); setIsDropdownOpen(false); }}
                className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#c07af0] outline-none transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {selectedMode ? (
                    <>
                      <selectedMode.icon size={18} weight="duotone" className="text-[#c07af0]" />
                      <span className="text-[#f0f0ee]">{selectedMode.name}</span>
                    </>
                  ) : (
                    <span className="text-muted">— Select —</span>
                  )}
                </div>
                <CaretDown size={14} className={`transition-transform duration-300 ${modeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {modeDropdownOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-surface2 border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                  {modes.map((m) => (
                    <button key={m.name} type="button" onClick={() => { setFormData({...formData, mode: m.name}); setModeDropdownOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${formData.mode === m.name ? 'bg-[#c07af0]/10 text-[#c07af0]' : 'text-muted hover:bg-white/5 hover:text-[#f0f0ee]'}`}
                    >
                      <m.icon size={18} weight="duotone" />
                      {m.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-[11px] font-medium text-muted uppercase tracking-wider font-semibold">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f0f0ee] focus:border-[#c07af0] outline-none transition-all h-20 resize-none placeholder:text-dim"
                placeholder="Optional details..."
              />
            </div>

            <div className="sm:col-span-2 grid grid-cols-2 gap-4 pt-4">
              <button
                onClick={() => handleUpdate('deposit')}
                disabled={updating}
                className="flex flex-col items-center gap-3 p-6 bg-[#1d9e75]/10 border border-[#1d9e75]/20 rounded-2xl group hover:bg-[#1d9e75]/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <div className="p-3 bg-[#1d9e75] text-bg rounded-xl shadow-lg shadow-[#1d9e75]/30 group-hover:scale-110 transition-transform">
                  <Plus size={24} weight="bold" />
                </div>
                <span className="text-sm font-medium text-[#f0f0ee]">Deposit to Vault</span>
              </button>

              <button
                onClick={() => handleUpdate('expense')}
                disabled={updating}
                className="flex flex-col items-center gap-3 p-6 bg-danger/10 border border-danger/20 rounded-2xl group hover:bg-danger/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <div className="p-3 bg-danger text-bg rounded-xl shadow-lg shadow-danger/30 group-hover:scale-110 transition-transform">
                  <Minus size={24} weight="bold" />
                </div>
                <span className="text-sm font-medium text-[#f0f0ee]">Vault Expense</span>
              </button>
            </div>
          </div>

          {status && (
            <div className={`mt-6 p-4 rounded-xl text-sm font-medium text-center animate-in zoom-in-95 ${
              status.type === 'success' ? 'bg-[#1d9e75]/10 text-[#1d9e75]' : 'bg-danger/10 text-danger'
            }`}>
              {status.msg}
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#f0f0ee] flex items-center gap-2">
              <Receipt size={18} className="text-[#c07af0]" />
              Vault Ledger
            </h2>
            <span className="text-[10px] text-muted uppercase tracking-widest font-medium">Detailed Activity</span>
          </div>

          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {history.length === 0 ? (
              <div className="p-10 text-center text-muted text-sm italic">No records in the vault ledger</div>
            ) : (
              <div className="divide-y divide-white/5">
                {history.map((tx) => (
                  <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center gap-5">
                      <div className={`p-3 rounded-2xl ${
                        tx.type === 'deposit' ? 'bg-[#1d9e75]/10 text-[#1d9e75]' : 'bg-danger/10 text-danger'
                      }`}>
                        {(() => {
                          const cat = categories.find(c => c.name === tx.category);
                          return cat ? <cat.icon size={24} weight="duotone" /> : <ArrowDown size={24} weight="duotone" />;
                        })()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-base font-medium text-[#f0f0ee]">{tx.name}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted border border-white/10 uppercase tracking-tighter">
                            {tx.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-[11px] text-muted flex items-center gap-3">
                            <span>{new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <span>{tx.mode || 'Direct'}</span>
                          </p>
                          {tx.notes && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-white/10" />
                              <button 
                                onClick={() => setSelectedNote({ name: tx.name, content: tx.notes })}
                                className="flex items-center gap-1.5 group/note"
                              >
                                <Note size={14} weight="duotone" className="text-dim group-hover/note:text-[#c07af0] transition-colors" />
                                <span className="text-[11px] text-dim group-hover/note:text-[#c07af0] transition-colors max-w-[80px] truncate">
                                  {tx.notes}
                                </span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right mr-2">
                        <p className={`text-lg font-bold font-serif ${
                          tx.type === 'deposit' ? 'text-[#1d9e75]' : 'text-danger'
                        }`}>
                          {tx.type === 'deposit' ? '+' : '-'} {fmt(tx.amount)}
                        </p>
                      </div>

                      <button onClick={() => handleEditClick(tx)}
                        className="p-2 text-muted hover:text-[#c07af0] hover:bg-[#c07af0]/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <PencilSimple size={18} />
                      </button>

                      <button onClick={() => handleDeleteHistory(tx.id)}
                        className="p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Note Overlay */}
      {selectedNote && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 bg-bg/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setSelectedNote(null)}
          />
          <div className="relative w-full max-w-lg glass-card p-8 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-sm text-[#c07af0] font-medium uppercase tracking-wider mb-2">Vault Transaction Note</h3>
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
                <Note size={80} weight="duotone" className="text-[#c07af0]" />
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
      {editingTx && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 bg-bg/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setEditingTx(null)}
          />
          <div className="relative w-full max-w-lg glass-card p-8 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-sm text-[#c07af0] font-medium uppercase tracking-wider mb-2">Edit Vault Transaction</h3>
                <h2 className="text-xl font-serif text-[#f0f0ee]">Update transaction details</h2>
              </div>
              <button 
                onClick={() => setEditingTx(null)}
                className="p-2 bg-surface2 border border-white/5 rounded-xl text-muted hover:text-[#f0f0ee] transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateEdit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Transaction Name *</label>
                <input
                  required
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f0f0ee] focus:border-[#c07af0] outline-none transition-all"
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
                    className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f0f0ee] focus:border-[#c07af0] outline-none transition-all font-serif font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Date *</label>
                  <input
                    required
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
                    className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f0f0ee] focus:border-[#c07af0] outline-none transition-all color-scheme-dark"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 relative">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Category *</label>
                  <button
                    type="button"
                    onClick={() => { setEditCategoryDropdownOpen(!editCategoryDropdownOpen); setEditModeDropdownOpen(false); }}
                    className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#c07af0] outline-none transition-all flex items-center justify-between"
                  >
                    <span className="text-[#f0f0ee]">{editFormData.category || 'Select'}</span>
                    <CaretDown size={14} className={`transition-transform duration-300 ${editCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {editCategoryDropdownOpen && (
                    <div className="absolute z-[110] top-full left-0 right-0 mt-2 bg-surface2 border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 max-h-48 overflow-y-auto custom-scrollbar">
                      {categories.map((cat) => (
                        <button key={cat.name} type="button" onClick={() => { setEditFormData({...editFormData, category: cat.name}); setEditCategoryDropdownOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${editFormData.category === cat.name ? 'bg-[#c07af0]/10 text-[#c07af0]' : 'text-muted hover:bg-white/5 hover:text-[#f0f0ee]'}`}
                        >
                          <cat.icon size={18} weight={editFormData.category === cat.name ? "fill" : "duotone"} />
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 relative">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Payment Mode</label>
                  <button
                    type="button"
                    onClick={() => { setEditModeDropdownOpen(!editModeDropdownOpen); setEditCategoryDropdownOpen(false); }}
                    className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#c07af0] outline-none transition-all flex items-center justify-between"
                  >
                    <span className="text-[#f0f0ee]">{editFormData.mode || 'Direct'}</span>
                    <CaretDown size={14} className={`transition-transform duration-300 ${editModeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {editModeDropdownOpen && (
                    <div className="absolute z-[110] top-full left-0 right-0 mt-2 bg-surface2 border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2">
                      {modes.map((m) => (
                        <button key={m.name} type="button" onClick={() => { setEditFormData({...editFormData, mode: m.name}); setEditModeDropdownOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${editFormData.mode === m.name ? 'bg-[#c07af0]/10 text-[#c07af0]' : 'text-muted hover:bg-white/5 hover:text-[#f0f0ee]'}`}
                        >
                          <m.icon size={18} weight="duotone" />
                          {m.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Transaction Type *</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setEditFormData({...editFormData, type: 'deposit'})}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                      editFormData.type === 'deposit' 
                        ? 'bg-[#1d9e75]/10 border-[#1d9e75] text-[#1d9e75]' 
                        : 'border-white/10 text-muted hover:bg-white/5'
                    }`}
                  >
                    Deposit
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditFormData({...editFormData, type: 'expense'})}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                      editFormData.type === 'expense' 
                        ? 'bg-danger/10 border-danger text-danger' 
                        : 'border-white/10 text-muted hover:bg-white/5'
                    }`}
                  >
                    Expense
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-muted uppercase tracking-wider font-semibold">Additional Notes</label>
                <textarea
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                  className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f0f0ee] focus:border-[#c07af0] outline-none transition-all h-20 resize-none placeholder:text-dim"
                  placeholder="Optional details..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="flex-1 bg-surface2 border border-white/10 rounded-xl py-3 text-sm font-medium text-[#f0f0ee] hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-[#c07af0] text-bg rounded-xl py-3 text-sm font-semibold hover:bg-[#b06ae0] transition-all disabled:opacity-50"
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

export default VaultManager;
