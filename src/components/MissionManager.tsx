import React, { useState } from 'react';
import {
  Plus,
  Play,
  Sparkles,
  Trash2,
  Copy,
  CheckCircle2,
  Clock,
  Search,
} from 'lucide-react';
import {
  MissionItem,
  MissionCategory,
  MissionStatus,
  MissionPriority,
  ImpactLevel,
  GoalItem,
  STATUS_SYMBOLS,
} from '../types/lifeos';

interface MissionManagerProps {
  missions: MissionItem[];
  goals: GoalItem[];
  onCreateMission: (mission: Omit<MissionItem, 'id' | 'userId'>) => Promise<void>;
  onUpdateMission: (id: string, updates: Partial<Omit<MissionItem, 'id' | 'userId'>>) => Promise<void>;
  onDeleteMission: (id: string) => Promise<void>;
  onStartFocusMission: (mission: MissionItem) => void;
}

const CATEGORIES: MissionCategory[] = [
  'Business',
  'Money',
  'Health',
  'Family',
  'Learning',
  'Personal',
];

const STATUSES: MissionStatus[] = [
  'Not Started',
  'Started',
  'Processing',
  'Paused',
  'Cancelled',
  'Completed',
  'Delayed',
];

const PRIORITIES: MissionPriority[] = ['Critical', 'High', 'Medium', 'Low'];
const IMPACT_LEVELS: ImpactLevel[] = ['High', 'Medium', 'Low'];

export const MissionManager: React.FC<MissionManagerProps> = ({
  missions,
  goals,
  onCreateMission,
  onUpdateMission,
  onDeleteMission,
  onStartFocusMission,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  // New Mission Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MissionCategory>('Business');
  const [priority, setPriority] = useState<MissionPriority>('High');
  const [connectedDream, setConnectedDream] = useState(
    goals[0]?.title || 'Grow Ruchitva Kitchen into multiple branches'
  );
  const [moneyImpact, setMoneyImpact] = useState<ImpactLevel>('High');
  const [dreamImpact, setDreamImpact] = useState<number>(90);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(45);
  const [startTime, setStartTime] = useState<string>('09:30 AM');
  const [notes, setNotes] = useState<string>('');
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [loadingModalAI, setLoadingModalAI] = useState(false);

  const filteredMissions = missions.filter((m) => {
    const matchesCat = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || m.status === selectedStatus;
    const matchesSearch =
      !searchQuery.trim() ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.connectedDream.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesStatus && matchesSearch;
  });

  const handleGenerateFormAISuggestion = async () => {
    if (!title.trim()) return;
    setLoadingModalAI(true);
    try {
      const res = await fetch('/api/ai/mission-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          connectedDream,
          estimatedMinutes,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.suggestion) setAiSuggestion(data.suggestion);
      }
    } catch {
      setAiSuggestion(
        'Execute this mission in a single distraction-free 25m sprint and define a clear deliverable before starting.'
      );
    } finally {
      setLoadingModalAI(false);
    }
  };

  const handleGenerateExistingMissionAI = async (mission: MissionItem) => {
    if (mission.status === 'Completed' || mission.status === 'Cancelled') return;
    setGeneratingId(mission.id);
    try {
      const res = await fetch('/api/ai/mission-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: mission.title,
          category: mission.category,
          connectedDream: mission.connectedDream,
          estimatedMinutes: mission.estimatedMinutes,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.suggestion) {
          await onUpdateMission(mission.id, { aiSuggestion: data.suggestion });
        }
      }
    } finally {
      setGeneratingId(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onCreateMission({
      title: title.trim(),
      description: description.trim() || 'Connected daily execution mission.',
      category,
      status: 'Not Started',
      priority,
      connectedDream: connectedDream.trim() || 'Build my future',
      moneyImpact,
      dreamImpact: Number(dreamImpact) || 85,
      estimatedMinutes: Number(estimatedMinutes) || 45,
      actualMinutes: 0,
      startTime: startTime.trim() || '09:00 AM',
      completionTime: '',
      notes: notes.trim(),
      aiSuggestion:
        aiSuggestion.trim() ||
        'Break into focused 25-minute execution blocks with zero social media notifications.',
    });
    setTitle('');
    setDescription('');
    setNotes('');
    setAiSuggestion('');
    setShowCreateModal(false);
  };

  const handleStatusChange = async (mission: MissionItem, newStatus: MissionStatus) => {
    // Terminal state lock check
    if (mission.status === 'Completed' || mission.status === 'Cancelled') {
      return;
    }
    const nowTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const updates: Partial<Omit<MissionItem, 'id' | 'userId'>> = {
      status: newStatus,
    };
    if (newStatus === 'Started' && !mission.startTime) {
      updates.startTime = nowTime;
    }
    if (newStatus === 'Completed') {
      updates.completionTime = nowTime;
      if (mission.actualMinutes === 0) {
        updates.actualMinutes = mission.estimatedMinutes;
      }
    }
    await onUpdateMission(mission.id, updates);
  };

  const handleCloneTerminalMission = async (mission: MissionItem) => {
    await onCreateMission({
      title: `${mission.title} (Next Sprint)`,
      description: mission.description,
      category: mission.category,
      status: 'Not Started',
      priority: mission.priority,
      connectedDream: mission.connectedDream,
      moneyImpact: mission.moneyImpact,
      dreamImpact: mission.dreamImpact,
      estimatedMinutes: mission.estimatedMinutes,
      actualMinutes: 0,
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      completionTime: '',
      notes: mission.notes,
      aiSuggestion: mission.aiSuggestion,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1512] border border-[#1C2B24] rounded-xl p-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#F3F5F4]">
            Mission Management System
          </h1>
          <p className="text-xs text-[#8A9D93]">
            We don&apos;t do random tasks. Every Mission is connected to a Life Dream, Money Impact, and Dream Impact percentage.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="py-2.5 px-4 bg-[#10B981] hover:bg-[#059669] text-[#070A09] font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New High-Impact Mission</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#0D1512] border border-[#1C2B24] rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#10B981] text-[#070A09] font-semibold'
                  : 'text-[#8A9D93] hover:text-[#F3F5F4]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-1.5 text-xs text-[#F3F5F4] focus:outline-none focus:border-[#10B981]"
          >
            <option value="All">All Statuses</option>
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {STATUS_SYMBOLS[st]}
              </option>
            ))}
          </select>

          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-[#8A9D93] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search missions or dreams..."
              className="w-full bg-[#070A09] border border-[#1C2B24] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F3F5F4] placeholder-[#6B7E74] focus:outline-none focus:border-[#10B981]"
            />
          </div>
        </div>
      </div>

      {/* Missions Grid */}
      {filteredMissions.length === 0 ? (
        <div className="bg-[#0D1512] border border-[#1C2B24] rounded-xl p-12 text-center space-y-3">
          <p className="text-base font-semibold text-[#F3F5F4]">
            No missions match your current filter
          </p>
          <p className="text-xs text-[#8A9D93] max-w-md mx-auto">
            Create a new mission connected to your business, wealth, or health goals to start building momentum.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="py-2 px-4 bg-[#10B981] text-[#070A09] text-xs font-semibold rounded-lg whitespace-nowrap shrink-0"
          >
            Create Mission
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredMissions.map((mission) => {
            const isTerminal =
              mission.status === 'Completed' || mission.status === 'Cancelled';
            return (
              <div
                key={mission.id}
                className="bg-[#0D1512] border border-[#1C2B24] hover:border-[#2A4237] rounded-xl p-6 flex flex-col justify-between space-y-4 transition-colors"
              >
                <div className="space-y-3">
                  {/* Unboxed Metadata Kicker */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#8A9D93]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#10B981] font-semibold">{mission.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>Priority: {mission.priority}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums text-[#D4AF37]">
                        {STATUS_SYMBOLS[mission.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isTerminal && (
                        <button
                          onClick={() => handleCloneTerminalMission(mission)}
                          className="text-[#8A9D93] hover:text-[#10B981] transition-colors flex items-center gap-1 text-xs whitespace-nowrap shrink-0"
                          title="Duplicate for next sprint"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Repeat</span>
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteMission(mission.id)}
                        className="text-[#8A9D93] hover:text-red-400 transition-colors"
                        title="Delete Mission"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-bold text-[#F3F5F4] leading-snug">
                      {mission.title}
                    </h3>
                    {mission.description && (
                      <p className="text-xs text-[#9CAEA4] mt-1 leading-relaxed">
                        {mission.description}
                      </p>
                    )}
                  </div>

                  {/* Connected Dream & Impact Telemetry */}
                  <div className="pt-3 border-t border-[#1C2B24] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <div className="text-[#8A9D93]">Connected Dream</div>
                      <div className="text-[#F3F5F4] font-medium truncate mt-0.5">
                        {mission.connectedDream}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#8A9D93]">Money Impact</div>
                      <div className="font-mono tabular-nums font-semibold text-[#D4AF37] mt-0.5">
                        {mission.moneyImpact}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#8A9D93]">Dream Impact</div>
                      <div className="font-mono tabular-nums font-semibold text-[#10B981] mt-0.5">
                        {mission.dreamImpact}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[#8A9D93]">Est. / Actual Time</div>
                      <div className="font-mono tabular-nums text-[#F3F5F4] mt-0.5">
                        {mission.estimatedMinutes}m / {mission.actualMinutes}m
                      </div>
                    </div>
                  </div>

                  {/* Time & Notes Metadata */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#8A9D93] font-mono tabular-nums">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#10B981]" />
                      Start: {mission.startTime || 'Unscheduled'}
                    </span>
                    {mission.completionTime && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#10B981]">
                          Completed: {mission.completionTime}
                        </span>
                      </>
                    )}
                    {mission.notes && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-sans text-[#9CAEA4] truncate max-w-xs">
                          Note: {mission.notes}
                        </span>
                      </>
                    )}
                  </div>

                  {/* AI Suggestion Block */}
                  <div className="p-3 rounded-lg bg-[#070A09] border border-[#1C2B24] flex items-start justify-between gap-3">
                    <div className="text-xs text-[#9CAEA4] leading-relaxed">
                      <span className="text-[#D4AF37] font-semibold">AI CEO Tip: </span>
                      {mission.aiSuggestion || 'Click refresh to generate an AI tactical execution plan.'}
                    </div>
                    {!isTerminal && (
                      <button
                        onClick={() => handleGenerateExistingMissionAI(mission)}
                        disabled={generatingId === mission.id}
                        className="text-xs text-[#10B981] hover:text-[#34D399] shrink-0 flex items-center gap-1 whitespace-nowrap"
                        title="Refresh AI Suggestion"
                      >
                        <Sparkles
                          className={`w-3.5 h-3.5 ${
                            generatingId === mission.id ? 'animate-spin' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>

                {/* Bottom Action Controls */}
                <div className="pt-4 border-t border-[#1C2B24] flex flex-wrap items-center justify-between gap-3">
                  {isTerminal ? (
                    <div className="text-xs text-[#8A9D93] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      <span>
                        Mission archived in {mission.status} state. Clone to schedule again.
                      </span>
                    </div>
                  ) : (
                    <>
                      <select
                        value={mission.status}
                        onChange={(e) =>
                          handleStatusChange(mission, e.target.value as MissionStatus)
                        }
                        className="bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-1.5 text-xs text-[#F3F5F4] focus:outline-none focus:border-[#10B981]"
                      >
                        {STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {STATUS_SYMBOLS[st]}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onStartFocusMission(mission)}
                          className="py-1.5 px-3 bg-[#10B981] hover:bg-[#059669] text-[#070A09] font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Enter Focus Mode</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Mission Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0D1512] border border-[#1C2B24] rounded-xl max-w-xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#1C2B24] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#F3F5F4]">Create New Mission</h2>
                <p className="text-xs text-[#8A9D93]">
                  Connect your action directly to a life dream and measurable impact
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-xs text-[#8A9D93] hover:text-[#F3F5F4]"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-[#8A9D93] mb-1">Mission Title *</label>
                <input
                  type="text"
                  required
                  maxLength={140}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Create Ruchitva food poster"
                  className="w-full bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-2 text-sm text-[#F3F5F4] focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-[#8A9D93] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MissionCategory)}
                    className="w-full bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-2 text-xs text-[#F3F5F4]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#8A9D93] mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as MissionPriority)}
                    className="w-full bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-2 text-xs text-[#F3F5F4]"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#8A9D93] mb-1">Money Impact</label>
                  <select
                    value={moneyImpact}
                    onChange={(e) => setMoneyImpact(e.target.value as ImpactLevel)}
                    className="w-full bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-2 text-xs text-[#F3F5F4]"
                  >
                    {IMPACT_LEVELS.map((imp) => (
                      <option key={imp} value={imp}>
                        {imp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-[#8A9D93] mb-1">Connected Dream</label>
                  <input
                    type="text"
                    required
                    maxLength={160}
                    value={connectedDream}
                    onChange={(e) => setConnectedDream(e.target.value)}
                    placeholder="Grow Ruchitva Kitchen into multiple branches"
                    className="w-full bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-2 text-xs text-[#F3F5F4]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8A9D93] mb-1">
                    Dream Impact ({dreamImpact}%)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={dreamImpact}
                    onChange={(e) => setDreamImpact(Number(e.target.value))}
                    className="w-full bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-2 text-xs text-[#F3F5F4] font-mono tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#8A9D93] mb-1">
                    Estimated Time (Minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={480}
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    className="w-full bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-2 text-xs text-[#F3F5F4] font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8A9D93] mb-1">Planned Start Time</label>
                  <input
                    type="text"
                    maxLength={40}
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="09:30 AM"
                    className="w-full bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-2 text-xs text-[#F3F5F4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#8A9D93] mb-1">Description & Deliverable</label>
                <textarea
                  rows={2}
                  maxLength={600}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the exact outcome that defines mission success..."
                  className="w-full bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-2 text-xs text-[#F3F5F4]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-[#8A9D93]">AI Execution Strategy</label>
                  <button
                    type="button"
                    onClick={handleGenerateFormAISuggestion}
                    disabled={loadingModalAI || !title.trim()}
                    className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{loadingModalAI ? 'Generating...' : 'Ask Gemini for Strategy'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={600}
                  value={aiSuggestion}
                  onChange={(e) => setAiSuggestion(e.target.value)}
                  placeholder="AI tactical suggestion for completing this mission faster..."
                  className="w-full bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-2 text-xs text-[#F3F5F4]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1C2B24]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#8A9D93] hover:text-[#F3F5F4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#10B981] hover:bg-[#059669] text-[#070A09] font-semibold text-xs rounded-lg whitespace-nowrap shrink-0"
                >
                  Save Mission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
