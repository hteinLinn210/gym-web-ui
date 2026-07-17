'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Flame, Dumbbell, Sparkles, Activity, Clock, X, RefreshCw, ChevronRight, Trash2, Edit2, Save, Plus, Sun, Moon } from 'lucide-react';
import SideRays from '@/components/SideRays';

interface WorkoutLog {
  id: number;
  timestamp: string;
  day_split: string;
  metrics: {
    status?: string;
    exercises: Array<{
      name: string;
      sets?: Array<{ set: number; reps: number; weight: string }>;
      duration?: string;
      status?: string;
    }>;
  };
}

export default function Home() {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<WorkoutLog | null>(null);
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'exercises' | 'kinesiology' | 'nutrition' | 'hype'>('exercises');

  // Edit / Delete states
  const [isEditing, setIsEditing] = useState(false);
  const [editedLog, setEditedLog] = useState<WorkoutLog | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Theme states
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  // Fetch logs
  async function fetchLogs() {
    try {
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

      if (!error && data) {
        const parsed = data.map((item: any) => ({
          ...item,
          metrics: typeof item.metrics === 'string' ? JSON.parse(item.metrics) : item.metrics
        }));
        setLogs(parsed as WorkoutLog[]);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  // Fetch feedbacks for selected log
  async function fetchFeedbacks(logId: number) {
    setFeedbacksLoading(true);
    setFeedbacks({});
    try {
      const { data, error } = await supabase
        .from('workout_feedbacks')
        .select('type, content')
        .eq('log_id', logId);

      if (!error && data) {
        const feedbackMap: Record<string, string> = {};
        data.forEach((fb: any) => {
          feedbackMap[fb.type] = fb.content;
        });
        setFeedbacks(feedbackMap);
      }
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
    } finally {
      setFeedbacksLoading(false);
    }
  }

  const handleLogClick = (log: WorkoutLog) => {
    setSelectedLog(log);
    setActiveTab('exercises');
    fetchFeedbacks(log.id);
  };

  async function handleDeleteLog(logId: number) {
    if (!confirm('Are you sure you want to delete this workout? This will delete it from everywhere.')) {
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('workout_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;

      await supabase
        .from('workout_feedbacks')
        .delete()
        .eq('log_id', logId);

      await fetch(`/api/logs/${logId}`, {
        method: 'DELETE',
      });

      setSelectedLog(null);
      setIsEditing(false);
      fetchLogs();
    } catch (err) {
      console.error('Error deleting log:', err);
      alert('Failed to delete workout');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEditedLog() {
    if (!selectedLog || !editedLog) return;
    setIsSaving(true);
    try {
      const payload = {
        exercises: editedLog.metrics.exercises,
        status: 'completed' // Saving the edited log marks it as completed
      };

      const { error } = await supabase
        .from('workout_logs')
        .update({
          metrics: JSON.stringify(payload),
          timestamp: editedLog.timestamp
        })
        .eq('id', selectedLog.id);

      if (error) throw error;

      await fetch(`/api/logs/${selectedLog.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          day_split: selectedLog.day_split,
          timestamp: editedLog.timestamp,
          metrics: payload
        })
      });

      setSelectedLog({
        ...selectedLog,
        timestamp: editedLog.timestamp,
        metrics: payload
      });
      setIsEditing(false);
      fetchLogs();
    } catch (err) {
      console.error('Error saving log:', err);
      alert('Failed to save workout log');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 max-w-lg mx-auto w-full pt-10 relative">
      {/* Dynamic WebGL Background Rays */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden -z-10 pointer-events-none opacity-25">
        <SideRays
          speed={2.5}
          rayColor1="#EAB308"
          rayColor2="#96c8ff"
          intensity={2}
          spread={2}
          origin="top-right"
          tilt={0}
          saturation={1.5}
          blend={0.75}
          falloff={1.6}
          opacity={1}
        />
      </div>

      {/* Theme Toggle Controls */}
      <div className="w-full flex justify-end mb-4 relative z-10">
        <button
          onClick={toggleTheme}
          className="glass rounded-xl p-2.5 text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-2 border border-white/10 shadow-sm"
          title={mounted ? `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode` : 'Switch Theme'}
        >
          {mounted && theme === 'light' ? (
            <Moon className="w-4 h-4 text-violet-500" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {mounted ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : 'Light Mode'}
          </span>
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-8 animate-fade-in-up">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter text-zinc-100 uppercase">
          ERIK'S MASTER PLAN
        </h1>
        <p className="text-[10px] text-zinc-500 mt-1.5 uppercase tracking-widest font-bold">
          Gym Automation System
        </p>
      </div>

      {/* Main CTA */}
      <div className="glass rounded-3xl p-6 w-full mb-6 border border-white/10 relative overflow-hidden animate-fade-in-up delay-75">
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl -z-10" />
        
        <div className="flex items-center gap-3 mb-4">
          <Dumbbell className="text-violet-400 w-6 h-6 animate-pulse" />
          <h2 className="text-lg font-bold text-zinc-100">Workout Logger</h2>
        </div>
        
        <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
          Completed a session? Log your sets, reps, and weights to trigger the subagent analysis pipeline instantly.
        </p>

        <Link
          href="/log"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-rose-500 text-white font-semibold py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-violet-500/20 transition-all active:scale-[0.98] glass-hover"
        >
          <Flame className="w-5 h-5 fill-current" />
          Log Today's Workout
        </Link>
      </div>

      {/* System Status */}
      <div className="glass rounded-2xl p-4 w-full mb-6 grid grid-cols-2 gap-4 animate-fade-in-up delay-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full absolute" />
          <span className="text-xs text-zinc-300 font-medium">Supabase Cloud</span>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <Activity className="text-rose-400 w-4 h-4" />
          <span className="text-xs text-zinc-300 font-medium">Parallel Agents Active</span>
        </div>
      </div>

      {/* Recent History */}
      <div className="w-full animate-fade-in-up delay-150">
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Activity
          </h3>
          <button 
            onClick={fetchLogs} 
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Refresh history"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center text-sm text-zinc-500">
            No workouts logged yet. Time to hit the gym! 🏋️‍♂️
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                onClick={() => handleLogClick(log)}
                className="glass glass-hover rounded-2xl p-4 transition-all duration-200 cursor-pointer flex justify-between items-center"
              >
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-100 text-sm">{log.day_split}</span>
                      {log.metrics.status === 'draft' && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                          Draft
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 flex flex-wrap gap-x-3 gap-y-1">
                    {log.metrics.exercises?.slice(0, 3).map((ex, idx) => (
                      <span key={idx} className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400/80" />
                        {ex.name}
                      </span>
                    ))}
                    {log.metrics.exercises?.length > 3 && (
                      <span className="text-zinc-600 font-medium">
                        +{log.metrics.exercises.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-600 ml-3" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail & Feedback Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="glass rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col border border-white/10 relative">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-zinc-950/40 flex-shrink-0">
              <div>
                <h3 className="font-bold text-zinc-100 text-base">{selectedLog.day_split}</h3>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  Logged on {new Date(selectedLog.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => { setSelectedLog(null); setIsEditing(false); }}
                className="bg-white/5 hover:bg-white/10 p-2 rounded-xl text-zinc-400 hover:text-zinc-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/5 overflow-x-auto bg-zinc-950/20 text-xs scrollbar-none flex-shrink-0">
              <button
                onClick={() => setActiveTab('exercises')}
                className={`flex-1 py-3.5 px-4 font-semibold border-b-2 text-center whitespace-nowrap transition-colors ${
                  activeTab === 'exercises'
                    ? 'border-violet-500 text-violet-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Log Data
              </button>
              <button
                onClick={() => setActiveTab('kinesiology')}
                className={`flex-1 py-3.5 px-4 font-semibold border-b-2 text-center whitespace-nowrap transition-colors ${
                  activeTab === 'kinesiology'
                    ? 'border-violet-500 text-violet-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Kinesiology
              </button>
              <button
                onClick={() => setActiveTab('nutrition')}
                className={`flex-1 py-3.5 px-4 font-semibold border-b-2 text-center whitespace-nowrap transition-colors ${
                  activeTab === 'nutrition'
                    ? 'border-violet-500 text-violet-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Nutrition
              </button>
              <button
                onClick={() => setActiveTab('hype')}
                className={`flex-1 py-3.5 px-4 font-semibold border-b-2 text-center whitespace-nowrap transition-colors ${
                  activeTab === 'hype'
                    ? 'border-violet-500 text-violet-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Hype-Man
              </button>
            </div>

            {/* Scrollable Body Content */}
            <div className="flex-grow overflow-y-auto p-5 space-y-4 min-h-0">
              
              {activeTab === 'exercises' && (
                isEditing && editedLog ? (
                  <div className="space-y-4">
                    {/* Edit Workout Date */}
                    <div className="bg-zinc-900/40 border border-white/10 p-4 rounded-2xl space-y-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Workout Date & Time</label>
                      <input
                        type="datetime-local"
                        value={(() => {
                          try {
                            const dateObj = new Date(editedLog.timestamp);
                            if (isNaN(dateObj.getTime())) return '';
                            const offset = dateObj.getTimezoneOffset() * 60000;
                            const localISODate = new Date(dateObj.getTime() - offset).toISOString();
                            return localISODate.slice(0, 16);
                          } catch (err) {
                            return '';
                          }
                        })()}
                        onChange={(e) => {
                          const updated = { ...editedLog };
                          try {
                            const selectedDate = new Date(e.target.value);
                            if (!isNaN(selectedDate.getTime())) {
                              updated.timestamp = selectedDate.toISOString();
                            }
                          } catch (err) {
                            // ignore malformed typing
                          }
                          setEditedLog(updated);
                        }}
                        className="w-full bg-zinc-950/60 border border-white/10 text-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-500 font-mono"
                        required
                      />
                    </div>

                    {editedLog.metrics.exercises?.map((ex, exIdx) => (
                      <div key={exIdx} className="bg-zinc-900/40 border border-white/10 p-4 rounded-2xl space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-zinc-100 text-xs">{ex.name}</span>
                          {!ex.duration && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = { ...editedLog };
                                const sets = updated.metrics.exercises[exIdx].sets || [];
                                const lastSet = sets[sets.length - 1] || { set: 1, reps: 10, weight: '0kg' };
                                sets.push({
                                  set: sets.length + 1,
                                  reps: typeof lastSet.reps === 'string' ? parseInt(lastSet.reps) : lastSet.reps,
                                  weight: lastSet.weight
                                });
                                updated.metrics.exercises[exIdx].sets = sets;
                                setEditedLog(updated);
                              }}
                              className="flex items-center gap-1 text-[10px] font-semibold bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              <Plus className="w-3 h-3" /> Add Set
                            </button>
                          )}
                        </div>

                        {ex.duration ? (
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold text-zinc-500 uppercase">Duration</label>
                            <input
                              type="text"
                              value={ex.duration}
                              onChange={(e) => {
                                const updated = { ...editedLog };
                                updated.metrics.exercises[exIdx].duration = e.target.value;
                                setEditedLog(updated);
                              }}
                              className="w-full bg-zinc-950/60 border border-white/10 text-zinc-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-violet-500"
                            />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {ex.sets?.map((s, setIdx) => (
                              <div key={setIdx} className="flex items-center gap-2 bg-zinc-950/40 p-2 rounded-xl border border-white/5">
                                <span className="text-[10px] font-mono font-bold text-zinc-500 w-10 text-center">
                                  SET {s.set}
                                </span>
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                  <div className="flex items-center bg-zinc-950/60 rounded-lg px-2 border border-white/5">
                                    <input
                                      type="number"
                                      value={s.reps}
                                      onChange={(e) => {
                                        const updated = { ...editedLog };
                                        updated.metrics.exercises[exIdx].sets![setIdx].reps = parseInt(e.target.value) || 0;
                                        setEditedLog(updated);
                                      }}
                                      className="w-full bg-transparent border-none text-zinc-200 text-xs py-1 focus:outline-none text-center"
                                    />
                                    <span className="text-[9px] font-bold text-zinc-600 uppercase pr-0.5">Reps</span>
                                  </div>
                                  <div className="flex items-center bg-zinc-950/60 rounded-lg px-2 border border-white/5">
                                    <input
                                      type="text"
                                      value={s.weight.replace('kg', '')}
                                      onChange={(e) => {
                                        const updated = { ...editedLog };
                                        updated.metrics.exercises[exIdx].sets![setIdx].weight = `${e.target.value}kg`;
                                        setEditedLog(updated);
                                      }}
                                      className="w-full bg-transparent border-none text-zinc-200 text-xs py-1 focus:outline-none text-center"
                                    />
                                    <span className="text-[9px] font-bold text-zinc-600 uppercase pr-0.5">KG</span>
                                  </div>
                                </div>
                                {(ex.sets?.length || 0) > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = { ...editedLog };
                                      updated.metrics.exercises[exIdx].sets!.splice(setIdx, 1);
                                      updated.metrics.exercises[exIdx].sets!.forEach((set, idx) => {
                                        set.set = idx + 1;
                                      });
                                      setEditedLog(updated);
                                    }}
                                    className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedLog.metrics.exercises?.map((ex, idx) => (
                      <div key={idx} className="bg-zinc-900/30 border border-white/5 p-4 rounded-2xl">
                        <h4 className="font-bold text-zinc-200 text-xs mb-2 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          {ex.name}
                        </h4>
                        {ex.duration ? (
                          <span className="text-xs text-zinc-400 font-mono bg-zinc-950/60 py-1 px-2.5 rounded-lg border border-white/5 inline-block">
                            Duration: {ex.duration}
                          </span>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            {ex.sets?.map((s) => (
                              <div key={s.set} className="bg-zinc-950/50 p-2 rounded-xl text-center border border-white/5">
                                <span className="text-[9px] font-bold text-zinc-500 block mb-0.5">SET {s.set}</span>
                                <span className="text-xs font-semibold text-zinc-300 font-mono">{s.reps} × {s.weight}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}

              {activeTab !== 'exercises' && (
                <div>
                  {feedbacksLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-zinc-500">Loading subagent analysis...</span>
                    </div>
                  ) : feedbacks[activeTab] ? (
                    <div className="space-y-1">
                      {parseMarkdownToHtml(feedbacks[activeTab])}
                    </div>
                  ) : (
                    <div className="text-center py-12 px-4 space-y-3">
                      <div className="bg-white/5 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-zinc-500">
                        <Clock className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-300 text-sm">Agent Still Analyzing</h4>
                        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                          Your parallel agents are running the analysis pipeline right now. Check back in a few seconds.
                        </p>
                      </div>
                      <button
                        onClick={() => fetchFeedbacks(selectedLog.id)}
                        className="bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 text-xs font-semibold px-4 py-2 rounded-xl transition-all inline-flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh Feedback
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/5 bg-zinc-950/40 flex gap-2 flex-shrink-0">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                    className="flex-1 bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-zinc-300 font-semibold py-2.5 px-4 text-xs rounded-xl transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEditedLog}
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-violet-500 to-rose-500 text-white font-semibold py-2.5 px-4 text-xs rounded-xl shadow-lg hover:shadow-violet-500/10 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleDeleteLog(selectedLog.id)}
                    className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-semibold p-2.5 rounded-xl text-xs transition-all flex items-center justify-center"
                    title="Delete Session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {activeTab === 'exercises' && (
                    <button
                      onClick={() => {
                        setEditedLog(JSON.parse(JSON.stringify(selectedLog)));
                        setIsEditing(true);
                      }}
                      className="bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-400 font-semibold p-2.5 rounded-xl text-xs transition-all flex items-center justify-center"
                      title="Edit Session"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => { setSelectedLog(null); setIsEditing(false); }}
                    className="flex-grow bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-zinc-300 font-semibold py-2.5 px-4 text-xs rounded-xl transition-all text-center"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple Parser to convert subagent Markdown summaries to elegant HTML
function parseMarkdownToHtml(markdown: string): React.ReactNode[] {
  if (!markdown) return [];
  
  const lines = markdown.split('\n');
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];

  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Table parsing
    if (line.startsWith('|')) {
      inTable = true;
      const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (line.includes('---')) {
        continue;
      }
      if (tableHeaders.length === 0) {
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      elements.push(
        <div key={`table-${i}`} className="overflow-x-auto my-4 rounded-xl border border-white/5 bg-zinc-950/30">
          <table className="w-full text-[10px] text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {tableHeaders.map((h, idx) => (
                  <th key={idx} className="p-2.5 font-semibold text-zinc-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-2.5 text-zinc-400 font-mono">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      inTable = false;
      tableHeaders = [];
      tableRows = [];
    }

    if (!line) {
      continue;
    }

    // Headers
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-base font-bold text-zinc-100 mt-4 mb-2 border-b border-white/5 pb-1">{line.replace('# ', '')}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-sm font-bold text-zinc-200 mt-3 mb-2">{line.replace('## ', '')}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-xs font-bold text-zinc-300 mt-2.5 mb-1.5">{line.replace('### ', '')}</h3>);
    } 
    // Alerts
    else if (line.startsWith('> [!TIP]')) {
      elements.push(<div key={i} className="bg-violet-500/10 border-l-4 border-violet-500 p-3 rounded-r-xl my-3 text-[11px] text-violet-300 font-medium">💡 Recommendation:</div>);
    } else if (line.startsWith('> [!IMPORTANT]')) {
      elements.push(<div key={i} className="bg-amber-500/10 border-l-4 border-amber-500 p-3 rounded-r-xl my-3 text-[11px] text-amber-300 font-medium">⚠️ Important:</div>);
    }
    // Blockquote text
    else if (line.startsWith('>')) {
      elements.push(<blockquote key={i} className="border-l-2 border-zinc-700 pl-3 italic text-zinc-400 text-xs my-2">{line.replace(/^>\s*/, '')}</blockquote>);
    }
    // Lists
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      const cleanLine = line.replace(/^[-*]\s*/, '');
      elements.push(<li key={i} className="text-xs text-zinc-400 list-disc list-inside ml-2 py-0.5">{parseInlineFormatting(cleanLine)}</li>);
    } else if (/^\d+\.\s*/.test(line)) {
      const cleanLine = line.replace(/^\d+\.\s*/, '');
      elements.push(<li key={i} className="text-xs text-zinc-400 list-decimal list-inside ml-2 py-0.5">{parseInlineFormatting(cleanLine)}</li>);
    }
    // Paragraph text
    else {
      elements.push(<p key={i} className="text-xs leading-relaxed text-zinc-400 my-1">{parseInlineFormatting(line)}</p>);
    }
  }

  // Fallback for trailing table
  if (inTable && tableHeaders.length > 0) {
    elements.push(
      <div key={`table-end`} className="overflow-x-auto my-4 rounded-xl border border-white/5 bg-zinc-950/30">
        <table className="w-full text-[10px] text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {tableHeaders.map((h, idx) => (
                <th key={idx} className="p-2.5 font-semibold text-zinc-300">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, rIdx) => (
              <tr key={rIdx} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="p-2.5 text-zinc-400 font-mono">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return elements;
}

function parseInlineFormatting(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="font-semibold text-zinc-200">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
