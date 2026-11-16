import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  TrendingUp,
  Home,
  Utensils,
  Briefcase,
  HeartPulse,
  Users,
} from 'lucide-react';
import {
  GoalItem,
  GoalCategory,
  MissionItem,
  formatINR,
} from '../types/lifeos';

interface DreamBoardViewProps {
  goals: GoalItem[];
  missions: MissionItem[];
  onCreateGoal: (goal: Omit<GoalItem, 'id' | 'userId'>) => Promise<void>;
  onUpdateGoal: (id: string, updates: Partial<Omit<GoalItem, 'id' | 'userId'>>) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
}

const GOAL_CATEGORIES: GoalCategory[] = [
  'House',
  'Business',
  'Investment',
  'Health',
  'Family',
];

const CATEGORY_IMAGES: Record<GoalCategory, string> = {
  House: '/src/assets/images/dream_luxury_house_1794797319148.jpg',
  Business: '/src/assets/images/dream_cloud_kitchen_1794797321463.jpg',
  Investment: '/src/assets/images/dream_wealth_portfolio_1794797321389.jpg',
  Health: '/src/assets/images/dream_luxury_house_1794797319148.jpg',
  Family: '/src/assets/images/dream_wealth_portfolio_1794797321389.jpg',
};

function renderAsciiBar(pct: number): string {
  const filled = Math.max(0, Math.min(10, Math.round(pct / 10)));
  return '█'.repeat(filled) + '░'.repeat(10 - filled);
}

export const DreamBoardView: React.FC<DreamBoardViewProps> = ({
  goals,
  missions,
  onCreateGoal,
  onUpdateGoal,
  onDeleteGoal,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategory>('Business');
  const [targetLabel, setTargetLabel] = useState('');
  const [targetValue, setTargetValue] = useState<number>(5000000);
  const [currentValue, setCurrentValue] = useState<number>(1500000);
  const [timeline, setTimeline] = useState('Dec 2027');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const tVal = Math.max(1, Number(targetValue) || 100);
    const cVal = Math.max(0, Number(currentValue) || 0);
    const pct = Math.min(100, Math.round((cVal / tVal) * 100));

    await onCreateGoal({
      title: title.trim(),
      category,
      targetLabel: targetLabel.trim() || formatINR(tVal),
      targetValue: tVal,
      currentValue: cVal,
      progressPct: pct,
      timeline: timeline.trim() || 'Dec 2027',
      notes: notes.trim(),
    });

    setTitle('');
    setTargetLabel('');
    setNotes('');
    setShowModal(false);
  };

  const handleAdjustProgress = async (goal: GoalItem, deltaPct: number) => {
    const nextPct = Math.max(0, Math.min(100, goal.progressPct + deltaPct));
    const nextCurrentVal = Math.round((goal.targetValue * nextPct) / 100);
    await onUpdateGoal(goal.id, {
      progressPct: nextPct,
      currentValue: nextCurrentVal,
    });
  };

  const getCategoryIcon = (cat: GoalCategory) => {
    switch (cat) {
      case 'House':
        return <Home className="w-4 h-4 text-[#D4AF37]" />;
      case 'Business':
        return <Utensils className="w-4 h-4 text-[#10B981]" />;
      case 'Investment':
        return <Briefcase className="w-4 h-4 text-[#D4AF37]" />;
      case 'Health':
        return <HeartPulse className="w-4 h-4 text-[#10B981]" />;
      case 'Family':
        return <Users className="w-4 h-4 text-[#D4AF37]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1512] border border-[#1C2B24] rounded-xl p-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#F3F5F4]">
            Visual Dream Board & North Star Goals
          </h1>
          <p className="text-xs text-[#8A9D93]">
            Keep your House, Business Expansion, Investment, Health, and Family dreams visible every single day.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="py-2.5 px-4 bg-[#10B981] hover:bg-[#059669] text-[#070A09] font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Life Dream</span>
        </button>
      </div>

      {/* Visual Dream Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const imgPath = CATEGORY_IMAGES[goal.category];
          const isImgFailed = failedImages[goal.id];
          const connectedCount = missions.filter((m) =>
            m.connectedDream.toLowerCase().includes(goal.title.toLowerCase().slice(0, 8))
          ).length;

          return (
            <div
              key={goal.id}
              className="bg-[#0D1512] border border-[#1C2B24] hover:border-[#2A4237] rounded-xl overflow-hidden flex flex-col justify-between transition-colors"
            >
              <div>
                {/* Visual Media Header with Scrim & Zero-Broken-Image Fallback */}
                <div className="relative h-44 w-full bg-gradient-to-br from-[#121E19] via-[#0D1512] to-[#070A09] overflow-hidden">
                  {!isImgFailed && (
                    <img
                      src={imgPath}
                      alt={goal.title}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedImages((prev) => ({ ...prev, [goal.id]: true }))
                      }
                      className="w-full h-full object-cover opacity-80"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1512] via-[#0D1512]/50 to-transparent" />
                  <div className="absolute bottom-3 left-5 right-5 flex items-end justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-[#D4AF37] font-medium">
                        {getCategoryIcon(goal.category)}
                        <span>{goal.category} Goal</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{goal.timeline}</span>
                      </div>
                      <h3 className="text-lg font-bold text-[#F3F5F4] leading-snug">
                        {goal.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="text-[#8A9D93] hover:text-red-400 p-1 transition-colors"
                      title="Remove Goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Goal Body */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8A9D93]">Target Milestone</span>
                    <span className="text-[#F3F5F4] font-semibold">{goal.targetLabel}</span>
                  </div>

                  {/* Block Progress Representation + Smooth Bar */}
                  <div className="space-y-2 bg-[#070A09] border border-[#1C2B24] rounded-lg p-3">
                    <div className="flex items-center justify-between font-mono tabular-nums text-xs">
                      <span className="text-[#10B981] tracking-widest">
                        {renderAsciiBar(goal.progressPct)}
                      </span>
                      <span className="text-[#D4AF37] font-bold">{goal.progressPct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#121E19] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#10B981] to-[#D4AF37] transition-all duration-300"
                        style={{ width: `${goal.progressPct}%` }}
                      />
                    </div>
                    {goal.targetValue > 100 && (
                      <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-[#8A9D93] pt-1">
                        <span>Current: {formatINR(goal.currentValue)}</span>
                        <span>Target: {formatINR(goal.targetValue)}</span>
                      </div>
                    )}
                  </div>

                  {goal.notes && (
                    <p className="text-xs text-[#9CAEA4] leading-relaxed">{goal.notes}</p>
                  )}
                </div>
              </div>

              {/* Interactive Progress Adjustment Footer */}
              <div className="px-5 py-3.5 border-t border-[#1C2B24] flex items-center justify-between text-xs">
                <span className="text-[#8A9D93] font-mono tabular-nums">
                  {connectedCount} Connected Mission{connectedCount === 1 ? '' : 's'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAdjustProgress(goal, -5)}
                    className="px-2.5 py-1 bg-[#070A09] border border-[#1C2B24] hover:border-[#2A4237] text-[#9CAEA4] rounded font-mono tabular-nums whitespace-nowrap shrink-0"
                  >
                    -5%
                  </button>
                  <button
                    onClick={() => handleAdjustProgress(goal, 5)}
                    className="px-2.5 py-1 bg-[#10B981]/15 border border-[#10B981]/40 hover:bg-[#10B981] hover:text-[#070A09] text-[#10B981] font-semibold rounded font-mono tabular-nums flex items-center gap-1 whitespace-nowrap shrink-0"
                  >
                    <TrendingUp className="w-3 h-3" />
                    <span>+5%</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0D1512] border border-[#1C2B24] rounded-xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#1C2B24] pb-3">
              <h2 className="text-lg font-bold text-[#F3F5F4]">Add New Life Dream</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-xs text-[#8A9D93] hover:text-[#F3F5F4]"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-[#8A9D93] mb-1">Dream Title *</label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Expand Ruchitva Kitchen to 5 Branches"
                  className="w-full bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-2 text-sm text-[#F3F5F4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#8A9D93] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as GoalCategory)}
                    className="w-full bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-2 text-xs text-[#F3F5F4]"
                  >
                    {GOAL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c} Goal
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#8A9D93] mb-1">Target Timeline</label>
                  <input
                    type="text"
                    required
                    maxLength={60}
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    placeholder="Dec 2027"
                    className="w-full bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-2 text-xs text-[#F3F5F4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#8A9D93] mb-1">Target Milestone Label</label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={targetLabel}
                  onChange={(e) => setTargetLabel(e.target.value)}
                  placeholder="e.g., ₹1.5 Cr Modern Villa or 5 Cloud Kitchen Outlets"
                  className="w-full bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-2 text-xs text-[#F3F5F4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#8A9D93] mb-1">Target Value (₹ or Units)</label>
                  <input
                    type="number"
                    min={1}
                    value={targetValue}
                    onChange={(e) => setTargetValue(Number(e.target.value))}
                    className="w-full bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-2 text-xs text-[#F3F5F4] font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8A9D93] mb-1">Current Progress Value</label>
                  <input
                    type="number"
                    min={0}
                    value={currentValue}
                    onChange={(e) => setCurrentValue(Number(e.target.value))}
                    className="w-full bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-2 text-xs text-[#F3F5F4] font-mono tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#8A9D93] mb-1">Execution Strategy Notes</label>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How will daily missions compound into this dream?"
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
                  Save Dream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
