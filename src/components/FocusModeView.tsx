import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Award,
  Zap,
  ShieldAlert,
} from 'lucide-react';
import { MissionItem } from '../types/lifeos';

interface FocusModeViewProps {
  missions: MissionItem[];
  activeMission: MissionItem | null;
  onSelectMission: (mission: MissionItem) => void;
  onCompleteSprint: (mission: MissionItem, focusedMinutes: number) => Promise<void>;
}

const FOCUS_QUOTES = [
  'Your future is built during focused minutes.',
  'Every 25-minute block of deep work separates builders from scrollers.',
  'Discipline in the quiet hours creates freedom in the public years.',
  'Protect your attention like your most valuable capital reserve.',
];

export const FocusModeView: React.FC<FocusModeViewProps> = ({
  missions,
  activeMission,
  onSelectMission,
  onCompleteSprint,
}) => {
  const activePool = missions.filter(
    (m) => m.status !== 'Completed' && m.status !== 'Cancelled'
  );
  const currentMission = activeMission || activePool[0] || missions[0] || null;

  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [quoteIdx, setQuoteIdx] = useState<number>(0);
  const [celebrationBanner, setCelebrationBanner] = useState<{
    xpEarned: number;
    missionTitle: string;
    minutesLogged: number;
  } | null>(null);

  useEffect(() => {
    setSecondsLeft(durationMinutes * 60);
    setIsRunning(false);
  }, [durationMinutes, currentMission?.id]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const totalSeconds = durationMinutes * 60;
  const elapsedSeconds = totalSeconds - secondsLeft;
  const progressPct = Math.min(100, Math.round((elapsedSeconds / totalSeconds) * 100));

  const minsDisplay = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secsDisplay = String(secondsLeft % 60).padStart(2, '0');

  const handleFinishSprint = async () => {
    if (!currentMission) return;
    setIsRunning(false);
    const loggedMins = Math.max(
      5,
      Math.round(elapsedSeconds / 60) || durationMinutes
    );
    await onCompleteSprint(currentMission, loggedMins);
    setCelebrationBanner({
      xpEarned: 150,
      missionTitle: currentMission.title,
      minutesLogged: loggedMins,
    });
    setQuoteIdx((prev) => (prev + 1) % FOCUS_QUOTES.length);
    setSecondsLeft(durationMinutes * 60);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Celebration Banner on Sprint Completion */}
      {celebrationBanner && (
        <div className="bg-[#121E19] border border-[#D4AF37] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37]">
              <Award className="w-4 h-4" />
              <span>FOCUS SPRINT COMPLETED · ACHIEVEMENT RECORDED</span>
            </div>
            <h3 className="text-lg font-bold text-[#F3F5F4]">
              +{celebrationBanner.xpEarned} XP Earned on &ldquo;{celebrationBanner.missionTitle}&rdquo;
            </h3>
            <p className="text-xs text-[#9CAEA4]">
              Added {celebrationBanner.minutesLogged} minutes to your Future Building Time and updated mission execution progress.
            </p>
          </div>
          <button
            onClick={() => setCelebrationBanner(null)}
            className="px-4 py-2 bg-[#D4AF37] text-[#070A09] font-semibold text-xs rounded-lg whitespace-nowrap shrink-0"
          >
            Continue Building
          </button>
        </div>
      )}

      {/* Main Distraction-Free Focus Cockpit */}
      <div className="bg-[#0D1512] border border-[#1C2B24] rounded-2xl p-8 sm:p-12 text-center space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1C2B24] pb-6">
          <div className="text-left">
            <div className="text-xs text-[#8A9D93]">Distraction-Free Execution Chamber</div>
            <h1 className="text-xl font-bold text-[#F3F5F4]">Focus Mode</h1>
          </div>

          {/* Preset Duration Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-[#070A09] border border-[#1C2B24] rounded-lg">
            {[25, 45, 60].map((preset) => (
              <button
                key={preset}
                onClick={() => setDurationMinutes(preset)}
                className={`px-3 py-1.5 text-xs font-mono tabular-nums font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  durationMinutes === preset
                    ? 'bg-[#10B981] text-[#070A09] font-semibold'
                    : 'text-[#8A9D93] hover:text-[#F3F5F4]'
                }`}
              >
                {preset}m Sprint
              </button>
            ))}
          </div>
        </div>

        {/* Mission Selector & Active Mission Details */}
        {currentMission ? (
          <div className="space-y-3 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-xs text-[#8A9D93]">
              <span>Current Mission</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#10B981] font-semibold">{currentMission.category}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#D4AF37] font-mono tabular-nums">
                Dream Impact: {currentMission.dreamImpact}%
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#F3F5F4] text-balance">
              {currentMission.title}
            </h2>

            <p className="text-xs text-[#9CAEA4]">
              Connected Dream: <span className="text-[#F3F5F4]">{currentMission.connectedDream}</span>
            </p>

            {activePool.length > 1 && (
              <div className="pt-2">
                <select
                  value={currentMission.id}
                  onChange={(e) => {
                    const found = missions.find((m) => m.id === e.target.value);
                    if (found) onSelectMission(found);
                  }}
                  className="bg-[#070A09] border border-[#1C2B24] rounded-lg px-3 py-1.5 text-xs text-[#9CAEA4] focus:outline-none focus:border-[#10B981]"
                >
                  {activePool.map((m) => (
                    <option key={m.id} value={m.id}>
                      Switch Mission: {m.title} ({m.estimatedMinutes}m)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-[#8A9D93]">
            Select or create an active mission to begin a Focus Mode sprint.
          </div>
        )}

        {/* Precision Monospace Timer Display */}
        <div className="py-6 space-y-6">
          <div className="font-mono tabular-nums text-6xl sm:text-8xl font-bold tracking-tight text-[#F3F5F4]">
            {minsDisplay}:{secsDisplay}
          </div>

          {/* Progress Bar */}
          <div className="max-w-lg mx-auto space-y-2">
            <div className="flex items-center justify-between text-xs font-mono tabular-nums text-[#8A9D93]">
              <span>Sprint Progress</span>
              <span className="text-[#10B981]">{progressPct}%</span>
            </div>
            <div className="h-2.5 w-full bg-[#070A09] border border-[#1C2B24] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#10B981] to-[#D4AF37] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <p className="text-sm sm:text-base font-medium text-[#D4AF37] italic max-w-xl mx-auto">
            &ldquo;{FOCUS_QUOTES[quoteIdx]}&rdquo;
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-[#1C2B24]">
          <button
            onClick={() => setIsRunning((prev) => !prev)}
            className="py-3 px-8 bg-[#10B981] hover:bg-[#059669] text-[#070A09] font-bold text-sm rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Timer</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Focus Sprint</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              setSecondsLeft(durationMinutes * 60);
            }}
            className="py-3 px-5 bg-[#070A09] border border-[#1C2B24] hover:border-[#2A4237] text-[#9CAEA4] hover:text-[#F3F5F4] text-xs font-medium rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          {currentMission && (
            <button
              onClick={handleFinishSprint}
              className="py-3 px-6 bg-[#121E19] border border-[#D4AF37]/60 hover:bg-[#D4AF37] hover:text-[#070A09] text-[#D4AF37] font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Sprint (+150 XP)</span>
            </button>
          )}
        </div>

        {/* Anti-Distraction Protocol Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#1C2B24] text-left text-xs">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-[#F3F5F4]">Social Shield Active</div>
              <div className="text-[#8A9D93]">Zero Instagram, YouTube, or Facebook tabs allowed during sprint.</div>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-[#F3F5F4]">+150 XP Reward</div>
              <div className="text-[#8A9D93]">Completing this session advances your Builder & Entrepreneur rank.</div>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Award className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-[#F3F5F4]">Future Time Credit</div>
              <div className="text-[#8A9D93]">Automatically logs focused minutes into your Daily Review ledger.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
