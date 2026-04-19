import React, { useState } from 'react';
import { useDate } from '../context/DateContext';
import { useNavigate } from 'react-router-dom';
import { 
  ForkKnife, Car, House, FirstAid, Television, 
  ShoppingBag, BookOpen, Airplane, Receipt, 
  DotsThreeCircle, CaretDown, QrCode, Money, 
  CreditCard, Globe, Check, CurrencyInr
} from '@phosphor-icons/react';
import client from '../api/client';

const AddExpense: React.FC = () => {
  const { month: contextMonth } = useDate();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    mode: '',
    month: contextMonth,
    tag: '',
    recurring: false,
    notes: ''
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);

  const categories = [
    { name: 'Food & Dining', icon: ForkKnife },
    { name: 'Transport', icon: Car },
    { name: 'Housing', icon: House },
    { name: 'Health', icon: FirstAid },
    { name: 'Entertainment', icon: Television },
    { name: 'Shopping', icon: ShoppingBag },
    { name: 'Education', icon: BookOpen },
    { name: 'Travel', icon: Airplane },
    { name: 'Bills & EMIs', icon: Receipt },
    { name: 'Miscellaneous', icon: DotsThreeCircle },
  ];

  const modes = [
    { name: 'UPI', icon: QrCode },
    { name: 'Cash', icon: Money },
    { name: 'Credit Card', icon: CreditCard },
    { name: 'Debit Card', icon: CreditCard },
    { name: 'Net Banking', icon: Globe },
  ];

  const tags = [
    { name: 'Need', color: 'text-danger bg-danger/10', border: 'border-danger/20' },
    { name: 'Want', color: 'text-[#c07af0] bg-[#c07af0]/10', border: 'border-[#c07af0]/20' },
    { name: 'Investment', color: 'text-accent2 bg-accent2/10', border: 'border-accent2/20' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      alert("Please select a category");
      return;
    }
    setLoading(true);
    setSuccess(false);
    try {
      const d = new Date(formData.date);
      await client.post('/api/expenses', {
        ...formData,
        amount: parseFloat(formData.amount),
        date: d.toISOString(),
        year: d.getFullYear(),
      });
      setSuccess(true);
      setFormData({ ...formData, name: '', amount: '', notes: '', category: '', mode: '', tag: '' });
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error('Error adding expense', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c.name === formData.category);
  const selectedMode = modes.find(m => m.name === formData.mode);
  const selectedTag = tags.find(t => t.name === formData.tag);

  return (
    <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="mb-8 ml-1">
        <h1 className="text-4xl font-serif tracking-tight text-[#f0f0ee]">Add Expense</h1>
        <p className="text-muted mt-1 text-sm tracking-wide">Log a new expense — date auto-fills to today</p>
      </header>

      <div className="glass-card p-8">
        {success && (
          <div className="mb-6 p-4 bg-accent/10 border border-accent/20 text-accent rounded-xl text-center font-medium animate-in zoom-in-95">
            ✓ Expense logged successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">
          <div className="sm:col-span-2 space-y-2">
            <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Expense Name *</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f0f0ee] focus:border-accent outline-none transition-all"
              placeholder="e.g. Swiggy lunch"
            />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label className="text-[11px] font-medium text-muted uppercase tracking-wider flex items-center gap-1">
              Amount <CurrencyInr size={12} weight="bold" /> *
            </label>
            <input
              required
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f0f0ee] focus:border-accent outline-none transition-all font-serif font-bold"
              placeholder="0.00"
            />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Date *</label>
            <input
              required
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f0f0ee] focus:border-accent outline-none transition-all color-scheme-dark"
            />
          </div>


          {/* Category Dropdown */}
          <div className="sm:col-span-2 space-y-2 relative">
            <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Category *</label>
            <button
              type="button"
              onClick={() => { setIsDropdownOpen(!isDropdownOpen); setModeDropdownOpen(false); setTagDropdownOpen(false); }}
              className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                {selectedCategory ? (
                  <>
                    <selectedCategory.icon size={18} weight="duotone" className="text-accent" />
                    <span className="text-[#f0f0ee]">{selectedCategory.name}</span>
                  </>
                ) : (
                  <span className="text-muted">— Select —</span>
                )}
              </div>
              <CaretDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-surface2 border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200 max-h-64 overflow-y-auto custom-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => { setFormData({...formData, category: cat.name}); setIsDropdownOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                      ${formData.category === cat.name ? 'bg-accent/10 text-accent font-medium' : 'text-muted hover:bg-white/5 hover:text-[#f0f0ee]'}
                    `}
                  >
                    <cat.icon size={18} weight={formData.category === cat.name ? "fill" : "duotone"} />
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mode Dropdown */}
          <div className="sm:col-span-2 space-y-2 relative">
            <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Payment Mode</label>
            <button
              type="button"
              onClick={() => { setModeDropdownOpen(!modeDropdownOpen); setIsDropdownOpen(false); setTagDropdownOpen(false); }}
              className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                {selectedMode ? (
                  <>
                    <selectedMode.icon size={18} weight="duotone" className="text-accent" />
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
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => { setFormData({...formData, mode: m.name}); setModeDropdownOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                      ${formData.mode === m.name ? 'bg-accent/10 text-accent font-medium' : 'text-muted hover:bg-white/5 hover:text-[#f0f0ee]'}
                    `}
                  >
                    <m.icon size={18} weight="duotone" />
                    {m.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tag Dropdown */}
          <div className="sm:col-span-2 space-y-2 relative">
            <label className="text-[11px] font-medium text-muted uppercase tracking-wider block">Classification / Tag</label>
            <button
              type="button"
              onClick={() => { setTagDropdownOpen(!tagDropdownOpen); setModeDropdownOpen(false); setIsDropdownOpen(false); }}
              className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                {selectedTag ? (
                  <>
                    <div className={`w-2 h-2 rounded-full ${selectedTag.name === 'Need' ? 'bg-danger' : selectedTag.name === 'Want' ? 'bg-[#c07af0]' : 'bg-accent2'}`} />
                    <span className="text-[#f0f0ee]">{selectedTag.name}</span>
                  </>
                ) : (
                  <span className="text-muted">— Select —</span>
                )}
              </div>
              <CaretDown size={14} className={`transition-transform duration-300 ${tagDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {tagDropdownOpen && (
              <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-surface2 border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                {tags.map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => { setFormData({...formData, tag: t.name}); setTagDropdownOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                      ${formData.tag === t.name ? 'bg-accent/10 text-accent font-medium' : 'text-muted hover:bg-white/5 hover:text-[#f0f0ee]'}
                    `}
                  >
                    <div className={`w-2 h-2 rounded-full ${t.name === 'Need' ? 'bg-danger' : t.name === 'Want' ? 'bg-[#c07af0]' : 'bg-accent2'}`} />
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label className="text-[11px] font-medium text-muted uppercase tracking-wider block">Special Flags</label>
            <label className="group flex items-center gap-3 p-3 bg-surface2 rounded-xl border border-white/5 cursor-pointer hover:bg-white/[0.02] transition-colors w-fit pr-6">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={formData.recurring}
                  onChange={(e) => setFormData({...formData, recurring: e.target.checked})}
                  className="peer appearance-none w-5 h-5 border-2 border-white/20 rounded-md checked:bg-accent checked:border-accent transition-all cursor-pointer" 
                />
                <Check size={12} weight="bold" className="absolute text-bg opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <span className="text-sm font-medium text-[#f0f0ee]">Is this a recurring expense?</span>
            </label>
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label className="text-[11px] font-medium text-muted uppercase tracking-wider font-semibold">Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#f0f0ee] focus:border-accent outline-none transition-all h-24 resize-none placeholder:text-dim"
              placeholder="Optional details (e.g. Transaction ID, Specific dish name...)"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="sm:col-span-2 bg-accent hover:bg-[#d4f57a] text-bg font-serif text-lg py-4 rounded-xl transition-all shadow-xl shadow-accent/20 active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? 'Processing...' : '+ Add Expense'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
