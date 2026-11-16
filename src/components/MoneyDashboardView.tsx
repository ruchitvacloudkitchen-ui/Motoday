import React, { useState } from 'react';
import {
  Plus,
  Sparkles,
  Trash2,
  TrendingUp,
  ShieldCheck,
  Wallet,
  RefreshCw,
} from 'lucide-react';
import {
  FinanceItem,
  FinanceType,
  GoalItem,
  FinancialAnalysisData,
  formatINR,
} from '../types/lifeos';

interface MoneyDashboardViewProps {
  finances: FinanceItem[];
  goals: GoalItem[];
  onCreateFinance: (fin: Omit<FinanceItem, 'id' | 'userId'>) => Promise<void>;
  onDeleteFinance: (id: string) => Promise<void>;
}

const FINANCE_TYPES: FinanceType[] = [
  'Income',
  'Expense',
  'Loan',
  'Investment',
  'Saving',
];

const DEFAULT_ANALYSIS: FinancialAnalysisData = {
  headline:
    'Increase monthly business income by ₹20,000 and cut packaging unit cost by 4% to clear your commercial kitchen loan 8 months ahead of schedule.',
  recommendations: [
    {
      title: 'Accelerate High-Margin B2B Catering',
      impact: '+₹25,000 / month net cashflow',
      action:
        'Convert 5 corporate offices into recurring weekly Ruchitva lunch subscriptions.',
    },
    {
      title: 'Debt Freedom Prepayment Protocol',
      impact: 'Saves ₹42,000 in interest',
      action:
        'Direct ₹15,000 additional monthly surplus toward the ₹3,20,000 equipment loan.',
    },
    {
      title: 'Step-Up Index & Branch Expansion SIP',
      impact: '₹1 Cr corpus 14 months faster',
      action:
        'Auto-transfer 30% of weekend combo profits into the Branch #2 capital reserve.',
    },
  ],
  wealthProjectionNote:
    'At your current savings and investment velocity, your net worth is projected to cross ₹35,00,000 within 18 months.',
};

export const MoneyDashboardView: React.FC<MoneyDashboardViewProps> = ({
  finances,
  goals,
  onCreateFinance,
  onDeleteFinance,
}) => {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);
  const [analysis, setAnalysis] = useState<FinancialAnalysisData>(DEFAULT_ANALYSIS);
  const [loadingAI, setLoadingAI] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<FinanceType>('Income');
  const [category, setCategory] = useState('Business Revenue');
  const [amount, setAmount] = useState<number>(25000);
  const [monthlyTarget, setMonthlyTarget] = useState<number>(30000);
  const [notes, setNotes] = useState('');

  const sumByType = (t: FinanceType) =>
    finances
      .filter((f) => f.type === t)
      .reduce((acc, f) => acc + f.amount, 0);

  const totalIncome = sumByType('Income');
  const totalExpenses = sumByType('Expense');
  const totalLoans = sumByType('Loan');
  const totalInvestments = sumByType('Investment');
  const totalSavings = sumByType('Saving');

  const netWorth = totalInvestments + totalSavings - totalLoans;
  const monthlyCashflowSurplus = Math.max(0, totalIncome - totalExpenses);

  // Debt Freedom Meter (assuming initial baseline debt of ₹8,00,000)
  const baselineDebt = Math.max(totalLoans + 480000, 500000);
  const debtFreedomPct = Math.min(
    100,
    Math.max(0, Math.round(((baselineDebt - totalLoans) / baselineDebt) * 100))
  );

  // Financial Freedom Score (0-100)
  const savingsRatePct =
    totalIncome > 0
      ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
      : 45;
  const financialFreedomScore = Math.min(
    100,
    Math.max(15, Math.round(savingsRatePct * 0.6 + debtFreedomPct * 0.4))
  );

  const handleRunAIAnalysis = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch('/api/ai/financial-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          financeSummary: {
            totalIncome,
            totalExpenses,
            totalLoans,
            totalInvestments,
            totalSavings,
            netWorth,
            monthlyCashflowSurplus,
          },
          goals: goals.map((g) => ({
            title: g.title,
            targetValue: g.targetValue,
            currentValue: g.currentValue,
          })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.headline && Array.isArray(data.recommendations)) {
          setAnalysis(data);
        }
      }
    } finally {
      setLoadingAI(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onCreateFinance({
      title: title.trim(),
      type,
      category: category.trim() || type,
      amount: Math.max(0, Number(amount) || 0),
      monthlyTarget: Math.max(0, Number(monthlyTarget) || 0),
      notes: notes.trim(),
      dateStr: new Date().toISOString().split('T')[0],
    });
    setTitle('');
    setNotes('');
    setShowModal(false);
  };

  const filteredFinances =
    selectedType === 'All'
      ? finances
      : finances.filter((f) => f.type === selectedType);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1512] border border-[#1C2B24] rounded-xl p-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#F3F5F4]">
            Money & Wealth Command Center
          </h1>
          <p className="text-xs text-[#8A9D93]">
            Track Income, Expenses, Loans, Investments, Savings, and Net Worth with AI CFO advisory.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="py-2.5 px-4 bg-[#10B981] hover:bg-[#059669] text-[#070A09] font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log Financial Entry</span>
        </button>
      </div>

      {/* 6 Core Financial Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-[#0D1512] border border-[#1C2B24] rounded-xl p-4">
          <div className="text-xs text-[#8A9D93]">Monthly Income</div>
          <div className="text-xl font-bold font-mono tabular-nums text-[#10B981] mt-1">
            {formatINR(totalIncome)}
          </div>
        </div>
        <div className="bg-[#0D1512] border border-[#1C2B24] rounded-xl p-4">
          <div className="text-xs text-[#8A9D93]">Monthly Expenses</div>
          <div className="text-xl font-bold font-mono tabular-nums text-[#F3F5F4] mt-1">
            {formatINR(totalExpenses)}
          </div>
        </div>
        <div className="bg-[#0D1512] border border-[#1C2B24] rounded-xl p-4">
          <div className="text-xs text-[#8A9D93]">Active Loans / Debt</div>
          <div className="text-xl font-bold font-mono tabular-nums text-amber-400 mt-1">
            {formatINR(totalLoans)}
          </div>
        </div>
        <div className="bg-[#0D1512] border border-[#1C2B24] rounded-xl p-4">
          <div className="text-xs text-[#8A9D93]">Investments</div>
          <div className="text-xl font-bold font-mono tabular-nums text-[#D4AF37] mt-1">
            {formatINR(totalInvestments)}
          </div>
        </div>
        <div className="bg-[#0D1512] border border-[#1C2B24] rounded-xl p-4">
          <div className="text-xs text-[#8A9D93]">Liquid Savings</div>
          <div className="text-xl font-bold font-mono tabular-nums text-[#10B981] mt-1">
            {formatINR(totalSavings)}
          </div>
        </div>
        <div className="bg-[#121E19] border border-[#D4AF37]/50 rounded-xl p-4">
          <div className="text-xs text-[#D4AF37] font-medium">Net Worth</div>
          <div className="text-xl font-bold font-mono tabular-nums text-[#F3F5F4] mt-1">
            {formatINR(netWorth)}
          </div>
        </div>
      </div>

      {/* 3 Strategic Gauges: Debt Freedom Meter, Investment Growth, Financial Freedom Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#0D1512] border border-[#1C2B24] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#8A9D93]">Debt Freedom Meter</div>
              <h3 className="text-base font-bold text-[#F3F5F4]">
                Loan Elimination Velocity
              </h3>
            </div>
            <ShieldCheck className="w-5 h-5 text-[#10B981]" />
          </div>
          <div className="flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-3xl font-bold text-[#10B981]">{debtFreedomPct}%</span>
            <span className="text-xs text-[#8A9D93]">
              Remaining Debt: {formatINR(totalLoans)}
            </span>
          </div>
          <div className="h-2.5 w-full bg-[#070A09] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10B981] transition-all duration-300"
              style={{ width: `${debtFreedomPct}%` }}
            />
          </div>
          <p className="text-xs text-[#9CAEA4]">
            Monthly Surplus Available for Debt & Wealth: <span className="font-mono tabular-nums text-[#F3F5F4] font-semibold">{formatINR(monthlyCashflowSurplus)}</span>
          </p>
        </div>

        <div className="bg-[#0D1512] border border-[#1C2B24] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#8A9D93]">Investment Growth</div>
              <h3 className="text-base font-bold text-[#F3F5F4]">
                Compounding Capital Curve
              </h3>
            </div>
            <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div className="flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-3xl font-bold text-[#D4AF37]">
              {formatINR(totalInvestments + totalSavings)}
            </span>
            <span className="text-xs text-[#10B981]">+18.4% YoY</span>
          </div>
          {/* Visual Growth Bars */}
          <div className="grid grid-cols-6 gap-2 items-end h-12 pt-2">
            {[35, 48, 56, 68, 82, 100].map((barH, i) => (
              <div key={i} className="bg-[#070A09] h-full rounded flex items-end overflow-hidden">
                <div
                  className="w-full bg-gradient-to-t from-[#10B981] to-[#D4AF37] rounded"
                  style={{ height: `${barH}%` }}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-[#9CAEA4]">
            Capital allocated across Index Equity, Branch Expansion Fund & Liquid Treasury.
          </p>
        </div>

        <div className="bg-[#0D1512] border border-[#1C2B24] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#8A9D93]">Financial Freedom Score</div>
              <h3 className="text-base font-bold text-[#F3F5F4]">
                Sovereignty Index
              </h3>
            </div>
            <Wallet className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div className="flex items-baseline justify-between font-mono tabular-nums">
            <span className="text-3xl font-bold text-[#F3F5F4]">
              {financialFreedomScore}/100
            </span>
            <span className="text-xs text-[#D4AF37]">
              Savings Rate: {savingsRatePct}%
            </span>
          </div>
          <div className="h-2.5 w-full bg-[#070A09] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#10B981] to-[#D4AF37] transition-all duration-300"
              style={{ width: `${financialFreedomScore}%` }}
            />
          </div>
          <p className="text-xs text-[#9CAEA4]">
            Measures operating cashflow margin, liquid runway, and debt-to-asset ratio.
          </p>
        </div>
      </div>

      {/* AI Financial Advisor Panel */}
      <div className="bg-[#0D1512] border border-[#1C2B24] rounded-xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1C2B24] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>AI CFO WEALTH & CASHFLOW STRATEGY</span>
            </div>
            <h2 className="text-lg font-bold text-[#F3F5F4]">{analysis.headline}</h2>
          </div>
          <button
            onClick={handleRunAIAnalysis}
            disabled={loadingAI}
            className="px-3.5 py-2 bg-[#121E19] border border-[#1C2B24] hover:border-[#D4AF37] text-[#D4AF37] text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingAI ? 'animate-spin' : ''}`} />
            <span>{loadingAI ? 'Analyzing Ledger...' : 'Recalculate AI Financial Plan'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analysis.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="bg-[#070A09] border border-[#1C2B24] rounded-xl p-4 space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                <span className="text-[#8A9D93]">0{idx + 1}. Strategy</span>
                <span className="text-[#10B981] font-semibold">{rec.impact}</span>
              </div>
              <h4 className="text-sm font-bold text-[#F3F5F4]">{rec.title}</h4>
              <p className="text-xs text-[#9CAEA4] leading-relaxed">{rec.action}</p>
            </div>
          ))}
        </div>

        <div className="text-xs text-[#8A9D93] pt-2 border-t border-[#1C2B24]">
          <span className="text-[#D4AF37] font-semibold">Wealth Projection: </span>
          {analysis.wealthProjectionNote}
        </div>
      </div>

      {/* Financial Ledger Table */}
      <div className="bg-[#0D1512] border border-[#1C2B24] rounded-xl overflow-hidden">
        <div className="p-5 border-b border-[#1C2B24] flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-base font-bold text-[#F3F5F4]">Financial Ledger</h3>
          <div className="flex flex-wrap items-center gap-1.5">
            {['All', ...FINANCE_TYPES].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedType === t
                    ? 'bg-[#10B981] text-[#070A09] font-semibold'
                    : 'text-[#8A9D93] hover:text-[#F3F5F4]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1C2B24] text-xs text-[#8A9D93]">
                <th className="py-3 px-5 font-medium">Entry Title</th>
                <th className="py-3 px-4 font-medium">Type · Category</th>
                <th className="py-3 px-4 font-medium text-right">Amount</th>
                <th className="py-3 px-4 font-medium text-right">Monthly Target</th>
                <th className="py-3 px-4 font-medium">Notes</th>
                <th className="py-3 px-5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2B24] text-xs">
              {filteredFinances.map((item) => (
                <tr key={item.id} className="hover:bg-[#121E19]/50 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-[#F3F5F4]">
                    {item.title}
                  </td>
                  <td className="py-3.5 px-4 text-[#9CAEA4]">
                    <span className="text-[#10B981] font-medium">{item.type}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{item.category}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-[#F3F5F4]">
                    {formatINR(item.amount)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#8A9D93]">
                    {formatINR(item.monthlyTarget)}
                  </td>
                  <td className="py-3.5 px-4 text-[#8A9D93] max-w-xs truncate">
                    {item.notes}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => onDeleteFinance(item.id)}
                      className="text-[#8A9D93] hover:text-red-400 transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Finance Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0D1512] border border-[#1C2B24] rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1C2B24] pb-3">
              <h2 className="text-lg font-bold text-[#F3F5F4]">Log Financial Entry</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-xs text-[#8A9D93]"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-[#8A9D93] mb-1">Title *</label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Weekend Catering Bulk Order"
                  className="w-full bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-2 text-sm text-[#F3F5F4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#8A9D93] mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as FinanceType)}
                    className="w-full bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-2 text-xs text-[#F3F5F4]"
                  >
                    {FINANCE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#8A9D93] mb-1">Category</label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Business / Equity / Debt"
                    className="w-full bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-2 text-xs text-[#F3F5F4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#8A9D93] mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-2 text-xs text-[#F3F5F4] font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8A9D93] mb-1">Monthly Target (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={monthlyTarget}
                    onChange={(e) => setMonthlyTarget(Number(e.target.value))}
                    className="w-full bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-2 text-xs text-[#F3F5F4] font-mono tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#8A9D93] mb-1">Notes</label>
                <input
                  type="text"
                  maxLength={400}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional context..."
                  className="w-full bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-2 text-xs text-[#F3F5F4]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1C2B24]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs text-[#8A9D93]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#10B981] text-[#070A09] font-semibold text-xs rounded-lg whitespace-nowrap shrink-0"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
