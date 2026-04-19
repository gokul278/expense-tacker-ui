import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDate } from '../context/DateContext';
import { SquaresFour, Receipt, PlusCircle, ChartPie, Gear, SignOut, CaretLeft, List, CalendarBlank, X, CurrencyInr, CaretDown } from '@phosphor-icons/react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout } = useAuth();
  const { month, year, setMonth, setYear } = useDate();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const years = Array.from({length: 10}, (_, i) => new Date().getFullYear() - 5 + i);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: SquaresFour },
    { name: 'Expenses', path: '/expenses', icon: Receipt },
    { name: 'Add Expense', path: '/add', icon: PlusCircle },
    { name: 'Categories', path: '/categories', icon: ChartPie },
    { name: 'Budget', path: '/budget', icon: Gear },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full bg-bg text-text overflow-hidden">
      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface/80 backdrop-blur-md border-b border-white/5 z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#f0f0ee] font-serif tracking-tight text-xl">
          <div className="w-7 h-7 flex items-center justify-center bg-accent text-bg rounded-lg">
            <CurrencyInr size={16} weight="bold" />
          </div>
          ExpenseIQ
        </div>
        <button 
          className="p-2 bg-surface2 border border-white/10 rounded-xl text-[#f0f0ee]"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X size={20} /> : <List size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-white/5 p-6 flex flex-col gap-8
        transition-transform duration-300 md:relative md:translate-x-0 md:h-full
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-3 text-[#f0f0ee] font-serif tracking-tight text-3xl mb-4 px-2">
          <div className="w-9 h-9 flex items-center justify-center bg-accent text-bg rounded-xl">
            <CurrencyInr size={22} weight="bold" />
          </div>
          ExpenseIQ
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-muted ml-auto">
            <CaretLeft size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          <p className="text-[10px] font-medium tracking-[1.5px] text-muted uppercase px-3 py-2">
            Navigate
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => { setIsSidebarOpen(false); setIsMonthOpen(false); setIsYearOpen(false); }}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] transition-all
                ${isActive 
                  ? 'bg-accent/10 text-accent font-semibold' 
                  : 'text-muted hover:bg-surface2 hover:text-[#f0f0ee]'}
              `}
            >
              {({ isActive }) => (
                <div className="flex items-center gap-3">
                  <item.icon size={20} weight={isActive ? "fill" : "duotone"} />
                  <span>{item.name}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
          <div className="space-y-3">
            <p className="text-[10px] font-medium tracking-[1.5px] text-muted uppercase px-1">Review Period</p>
            
            {/* Custom Month Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setIsMonthOpen(!isMonthOpen); setIsYearOpen(false); }}
                className="w-full bg-surface2 border border-white/10 rounded-xl px-3 py-2 text-[13px] text-[#f0f0ee] focus:border-accent outline-none transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <CalendarBlank size={16} weight="duotone" className="text-accent" />
                  <span>{month}</span>
                </div>
                <CaretDown size={12} className={`transition-transform duration-300 ${isMonthOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMonthOpen && (
                <div className="absolute z-50 bottom-full left-0 right-0 mb-2 bg-surface2 border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 animate-in fade-in slide-in-from-bottom-2 duration-200 max-h-48 overflow-y-auto custom-scrollbar">
                  {months.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setMonth(m); setIsMonthOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-[12px] transition-colors
                        ${month === m ? 'bg-accent/10 text-accent font-medium' : 'text-muted hover:bg-white/5 hover:text-[#f0f0ee]'}
                      `}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Year Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setIsYearOpen(!isYearOpen); setIsMonthOpen(false); }}
                className="w-full bg-surface2 border border-white/10 rounded-xl px-3 py-2 text-[13px] text-[#f0f0ee] focus:border-accent outline-none transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center bg-accent/10 text-accent rounded text-[10px] font-bold">Y</div>
                  <span>{year}</span>
                </div>
                <CaretDown size={12} className={`transition-transform duration-300 ${isYearOpen ? 'rotate-180' : ''}`} />
              </button>

              {isYearOpen && (
                <div className="absolute z-50 bottom-full left-0 right-0 mb-2 bg-surface2 border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  {years.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => { setYear(y); setIsYearOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-[12px] transition-colors
                        ${year === y ? 'bg-accent/10 text-accent font-medium' : 'text-muted hover:bg-white/5 hover:text-[#f0f0ee]'}
                      `}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-all font-medium"
          >
            <SignOut size={20} weight="bold" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full p-6 pt-24 md:p-10 md:pt-10 overflow-y-auto z-10 scroll-smooth">
        {children}
      </main>
    </div>
  );
};

export default Layout;
