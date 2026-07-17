'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Plus, Trash2, CheckCircle, AlertCircle, Calendar, Edit3, Save, X, Check } from 'lucide-react';

interface ExerciseTemplate {
  name: string;
  sets: number;
  reps: string;
  weight: string;
  duration?: string;
  status?: string;
}

interface SplitTemplate {
  day_name: string;
  split_name: string;
  exercises: ExerciseTemplate[];
}

// Fallback splits if DB is not seeded yet
const FALLBACK_SPLITS: Record<string, SplitTemplate> = {
  "Day 1": {
    day_name: "Day 1",
    split_name: "Day 1: Push (High-Efficiency Aesthetic Focus)",
    exercises: [
      { name: "Machine Incline Chest Press", sets: 3, reps: "8-10", weight: "0kg" },
      { name: "Machine Flat Chest Press", sets: 3, reps: "8-10", weight: "0kg" },
      { name: "Pec Deck", sets: 3, reps: "12-15", weight: "0kg" },
      { name: "Machine Shoulder Press", sets: 3, reps: "8-10", weight: "0kg" },
      { name: "Standing Lateral Raise Machine", sets: 3, reps: "12-15", weight: "0kg" },
      { name: "Overhead Cable Triceps Extension (Rope)", sets: 3, reps: "10-12", weight: "0kg" },
      { name: "Cardio: Stairmaster", sets: 1, reps: "1", weight: "0kg", duration: "15 mins" }
    ]
  },
  "Day 2": {
    day_name: "Day 2",
    split_name: "Day 2: Pull (High-Efficiency V-Taper Focus)",
    exercises: [
      { name: "Seated Cable Row", sets: 3, reps: "8-10", weight: "0kg" },
      { name: "Lat Pulldown (Wide or Neutral Grip)", sets: 3, reps: "8-10", weight: "0kg" },
      { name: "Front Pulldown Machine (Reverse Grip)", sets: 3, reps: "10-12", weight: "0kg" },
      { name: "Rear Delt Fly (Pec Deck Machine reversed)", sets: 3, reps: "12-15", weight: "0kg" },
      { name: "Longhead Bicep Machine", sets: 3, reps: "10-12", weight: "0kg" },
      { name: "EZ-Bar Preacher Curl", sets: 3, reps: "10-12", weight: "0kg" },
      { name: "Cardio: Stairmaster", sets: 1, reps: "1", weight: "0kg", duration: "15 mins" }
    ]
  },
  "Day 3": {
    day_name: "Day 3",
    split_name: "Day 3: Legs (Quad Focus) & Abs",
    exercises: [
      { name: "Machine Hack Squat", sets: 3, reps: "8-10", weight: "0kg" },
      { name: "Leg Press (Standard Stance)", sets: 3, reps: "8-10", weight: "0kg" },
      { name: "Leg Extension", sets: 3, reps: "12-15", weight: "0kg" },
      { name: "Standing Calf Raise", sets: 3, reps: "12-15", weight: "0kg" },
      { name: "Crunch Machine", sets: 3, reps: "12-15", weight: "0kg" },
      { name: "Cardio: Stairmaster", sets: 1, reps: "1", weight: "0kg", duration: "15 mins" }
    ]
  },
  "Day 4": {
    day_name: "Day 4",
    split_name: "Day 4: Rest & Active Recovery",
    exercises: [
      { name: "Low-Intensity Steady-State (LISS) Walk", sets: 1, reps: "1", weight: "0kg", duration: "30-45 mins" },
      { name: "Lower-Body Mobility Routine", sets: 1, reps: "1", weight: "0kg", duration: "15 mins" }
    ]
  },
  "Day 5": {
    day_name: "Day 5",
    split_name: "Day 5: Upper Body (Balanced Power)",
    exercises: [
      { name: "Machine Flat Chest Press", sets: 3, reps: "8-10", weight: "0kg" },
      { name: "Seated Cable Row", sets: 3, reps: "8-10", weight: "0kg" },
      { name: "Machine Shoulder Press", sets: 3, reps: "8-10", weight: "0kg" },
      { name: "Lat Pulldown (Wide Overhand Grip)", sets: 3, reps: "8-10", weight: "0kg" },
      { name: "Cable Lateral Raise", sets: 3, reps: "12-15", weight: "0kg" },
      { name: "EZ-Bar Bicep Curl", sets: 3, reps: "10-12", weight: "0kg" },
      { name: "Overhead Dumbbell Triceps Extension", sets: 3, reps: "10-12", weight: "0kg" },
      { name: "Cardio: Stairmaster", sets: 1, reps: "1", weight: "0kg", duration: "15 mins" }
    ]
  },
  "Day 6": {
    day_name: "Day 6",
    split_name: "Day 6: Lower Body (Posterior Chain) & Core",
    exercises: [
      { name: "Machine Hip Thrust", sets: 3, reps: "8-10", weight: "0kg" },
      { name: "Reverse / Lying Leg Curl", sets: 3, reps: "10-12", weight: "0kg" },
      { name: "High-Stance Machine Leg Press", sets: 3, reps: "8-10", weight: "0kg" },
      { name: "Standing Machine Calf Raise", sets: 3, reps: "12-15", weight: "0kg" },
      { name: "Abdominal Crunch Machine", sets: 3, reps: "12-15", weight: "0kg" },
      { name: "Cardio: Stairmaster", sets: 1, reps: "1", weight: "0kg", duration: "15 mins" }
    ]
  }
};

export default function LogPage() {
  const router = useRouter();
  const [day, setDay] = useState('Day 1');
  const [splitName, setSplitName] = useState('');
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | ''>('');

  // DatePicker state
  const [logDate, setLogDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Edit Template state
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [templateExercises, setTemplateExercises] = useState<any[]>([]);

  // Submitter action state (Save Draft vs Finish & Analyze)
  const [submitStatus, setSubmitStatus] = useState<'draft' | 'completed'>('completed');
  const [currentLogId, setCurrentLogId] = useState<number | null>(null);

  // Fetch from Supabase templates or fallback
  useEffect(() => {
    async function loadTemplate() {
      try {
        const { data, error } = await supabase
          .from('workout_templates')
          .select('*')
          .eq('day_name', day)
          .single();

        if (data && !error) {
          setSplitName(data.split_name);
          initializeExerciseData(data.exercises);
          setTemplateExercises(data.exercises || []);
        } else {
          // Fallback
          const fb = FALLBACK_SPLITS[day] || FALLBACK_SPLITS['Day 1'];
          setSplitName(fb.split_name);
          initializeExerciseData(fb.exercises);
          setTemplateExercises(fb.exercises || []);
        }
      } catch (err) {
        const fb = FALLBACK_SPLITS[day] || FALLBACK_SPLITS['Day 1'];
        setSplitName(fb.split_name);
        initializeExerciseData(fb.exercises);
        setTemplateExercises(fb.exercises || []);
      }
    }
    loadTemplate();
  }, [day]);

  function initializeExerciseData(templateExs: ExerciseTemplate[]) {
    const initialized = templateExs.map(ex => {
      const setsData = Array.from({ length: ex.sets || 1 }, (_, i) => ({
        setNum: i + 1,
        reps: ex.reps ? (ex.reps.includes('-') ? ex.reps.split('-')[0] : ex.reps) : '10',
        weight: '0' // Default added weight to 0
      }));
      
      const nameLower = ex.name.toLowerCase();
      const isDoubleDefault = nameLower.includes('plate-loaded') || nameLower.includes('hack squat') || nameLower.includes('leg press');

      return {
        name: ex.name,
        sets: setsData,
        duration: ex.duration || '',
        initialWeight: ex.weight ? ex.weight.replace('kg', '') : '0',
        loadType: isDoubleDefault ? 'double' : 'single'
      };
    });
    setExercises(initialized);
  }

  function handleSetChange(exIndex: number, setIndex: number, field: 'reps' | 'weight', value: string) {
    const updated = [...exercises];
    updated[exIndex].sets[setIndex][field] = value;
    setExercises(updated);
  }

  function addSet(exIndex: number) {
    const updated = [...exercises];
    const sets = updated[exIndex].sets;
    const lastSet = sets[sets.length - 1] || { reps: '10', weight: '0' };
    sets.push({
      setNum: sets.length + 1,
      reps: lastSet.reps,
      weight: lastSet.weight
    });
    setExercises(updated);
  }

  function removeSet(exIndex: number, setIndex: number) {
    const updated = [...exercises];
    updated[exIndex].sets.splice(setIndex, 1);
    // Re-index sets
    updated[exIndex].sets.forEach((set: any, idx: number) => {
      set.setNum = idx + 1;
    });
    setExercises(updated);
  }

  // Template editing handlers
  function handleTemplateExNameChange(idx: number, name: string) {
    const updated = [...templateExercises];
    updated[idx].name = name;
    setTemplateExercises(updated);
  }

  function handleTemplateExTypeToggle(idx: number, isCardio: boolean) {
    const updated = [...templateExercises];
    if (isCardio) {
      updated[idx].duration = '30 mins';
      updated[idx].sets = 1;
      updated[idx].reps = '1';
      updated[idx].weight = '0kg';
    } else {
      updated[idx].sets = 3;
      updated[idx].reps = '8-12';
      updated[idx].weight = '0kg';
      delete updated[idx].duration;
    }
    setTemplateExercises(updated);
  }

  function handleTemplateSetsChange(idx: number, sets: number) {
    const updated = [...templateExercises];
    updated[idx].sets = sets;
    setTemplateExercises(updated);
  }

  function handleTemplateRepsChange(idx: number, reps: string) {
    const updated = [...templateExercises];
    updated[idx].reps = reps;
    setTemplateExercises(updated);
  }

  function handleTemplateWeightChange(idx: number, weight: string) {
    const updated = [...templateExercises];
    updated[idx].weight = weight.endsWith('kg') ? weight : `${weight}kg`;
    setTemplateExercises(updated);
  }

  function handleTemplateDurationChange(idx: number, duration: string) {
    const updated = [...templateExercises];
    updated[idx].duration = duration;
    setTemplateExercises(updated);
  }

  function addTemplateExercise() {
    setTemplateExercises([
      ...templateExercises,
      { name: 'New Exercise', sets: 3, reps: '8-12', weight: '0kg' }
    ]);
  }

  function removeTemplateExercise(idx: number) {
    const updated = [...templateExercises];
    updated.splice(idx, 1);
    setTemplateExercises(updated);
  }

  async function handleSaveTemplate() {
    setLoading(true);
    setStatusMsg('');
    setStatusType('');
    try {
      // 1. Save to Supabase
      const { error } = await supabase
        .from('workout_templates')
        .upsert({
          day_name: day,
          split_name: splitName,
          exercises: templateExercises
        }, { onConflict: 'day_name' });

      if (error) throw error;

      // 2. Save to local SQLite
      const res = await fetch('/api/templates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          day_name: day,
          split_name: splitName,
          exercises: templateExercises
        })
      });

      if (!res.ok) {
        throw new Error('Failed to save template to local database');
      }

      setStatusType('success');
      setStatusMsg('Template saved successfully!');
      setIsEditingTemplate(false);
      
      // Reload template
      initializeExerciseData(templateExercises);
    } catch (err: any) {
      console.error('Save template error:', err);
      setStatusType('error');
      setStatusMsg(`Error saving template: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatusMsg('');
    setStatusType('');

    // Format metrics payload
    const formattedExercises = exercises.map(ex => {
      if (ex.duration) {
        return {
          name: ex.name,
          duration: ex.duration,
          status: 'completed'
        };
      }
      
      const baseWeight = parseFloat(ex.initialWeight) || 0;
      const isDouble = ex.loadType === 'double';
      
      return {
        name: ex.name,
        sets: ex.sets.map((s: any) => {
          const addedWeight = parseFloat(s.weight) || 0;
          const totalWeight = baseWeight + (addedWeight * (isDouble ? 2 : 1));
          return {
            set: s.setNum,
            reps: parseInt(s.reps) || 0,
            weight: `${totalWeight}kg`
          };
        })
      };
    });

    const payload = {
      exercises: formattedExercises,
      status: submitStatus
    };

    // Construct custom date timestamp using logDate + current time
    const now = new Date();
    const customTimestamp = new Date(`${logDate}T${now.toTimeString().split(' ')[0]}`).toISOString();

    try {
      let targetLogId = currentLogId;

      if (targetLogId) {
        // Update existing log
        const { error } = await supabase
          .from('workout_logs')
          .update({
            metrics: JSON.stringify(payload)
          })
          .eq('id', targetLogId);

        if (error) throw error;

        // Sync update locally
        const localRes = await fetch(`/api/logs/${targetLogId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            day_split: day,
            timestamp: customTimestamp,
            metrics: payload
          })
        });

        if (!localRes.ok) {
          console.error('Failed to sync log update to local SQLite database');
        }
      } else {
        // Insert new log
        const { data: insertedLog, error } = await supabase
          .from('workout_logs')
          .insert([{
            day_split: day,
            timestamp: customTimestamp,
            metrics: JSON.stringify(payload)
          }])
          .select('id')
          .single();

        if (error) throw error;
        targetLogId = insertedLog.id;
        setCurrentLogId(targetLogId);

        // Sync insert locally
        const localRes = await fetch('/api/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: targetLogId,
            day_split: day,
            timestamp: customTimestamp,
            metrics: payload
          })
        });

        if (!localRes.ok) {
          console.error('Failed to sync log to local SQLite database');
        }
      }

      setStatusType('success');
      if (submitStatus === 'draft') {
        setStatusMsg('Workout progress saved as draft successfully!');
        // Clear message after 3 seconds, do not redirect!
        setTimeout(() => {
          setStatusMsg('');
          setStatusType('');
        }, 3000);
      } else {
        setStatusMsg('Workout logged successfully! Sending data to subagents...');
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      setStatusType('error');
      setStatusMsg(`Error logging workout: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-grow flex flex-col p-4 max-w-lg mx-auto w-full pb-10 animate-fade-in">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="glass rounded-xl p-2.5 text-zinc-400 hover:text-zinc-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">{isEditingTemplate ? 'Edit Template' : 'Log Session'}</h1>
            <p className="text-xs text-zinc-400">{isEditingTemplate ? 'Configure exercise database targets' : 'Record your reps & weights'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsEditingTemplate(!isEditingTemplate);
            setStatusMsg('');
          }}
          className={`flex items-center gap-1.5 text-xs font-bold py-2.5 px-4 rounded-xl border transition-all ${
            isEditingTemplate 
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20' 
              : 'bg-violet-500/10 border-violet-500/20 text-violet-400 hover:bg-violet-500/20'
          }`}
        >
          {isEditingTemplate ? (
            <>
              <X className="w-4 h-4" /> Cancel Edit
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4" /> Edit Template
            </>
          )}
        </button>
      </div>

      {isEditingTemplate ? (
        /* Template Editor Mode Form */
        <form onSubmit={(e) => { e.preventDefault(); handleSaveTemplate(); }} className="space-y-6">
          {/* Day Select */}
          <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Select Day to Edit
              </label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 text-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              >
                {Object.keys(FALLBACK_SPLITS).map((key) => (
                  <option key={key} value={key}>
                    {key} - {FALLBACK_SPLITS[key].split_name.split(':')[1]?.trim() || FALLBACK_SPLITS[key].split_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t border-white/5 pt-3 space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Split Name</label>
              <input
                type="text"
                value={splitName}
                onChange={(e) => setSplitName(e.target.value)}
                className="w-full bg-zinc-900/50 border border-white/10 text-violet-400 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-violet-500"
                required
              />
            </div>
          </div>

          {/* Template Exercises Editor */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Exercises list</h3>
              <button
                type="button"
                onClick={addTemplateExercise}
                className="flex items-center gap-1.5 text-xs font-bold bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 px-3.5 py-2 rounded-xl border border-violet-500/20 transition-all animate-pulse"
              >
                <Plus className="w-4 h-4" /> Add Exercise
              </button>
            </div>

            {templateExercises.map((ex, exIdx) => {
              const isCardio = 'duration' in ex;
              return (
                <div key={exIdx} className="glass rounded-2xl p-5 border border-white/5 space-y-4">
                  <div className="flex gap-3 justify-between items-start">
                    <div className="flex-grow space-y-1">
                      <label className="text-[9px] font-bold text-zinc-500 uppercase">Exercise Name</label>
                      <input
                        type="text"
                        value={ex.name}
                        onChange={(e) => handleTemplateExNameChange(exIdx, e.target.value)}
                        className="w-full bg-zinc-900/50 border border-white/10 text-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-500 font-semibold"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTemplateExercise(exIdx)}
                      className="text-zinc-500 hover:text-rose-400 p-2 rounded-xl border border-white/5 hover:border-rose-500/20 bg-zinc-900/20 transition-all mt-5"
                      title="Remove Exercise"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
                    <div>
                      <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Exercise Type</label>
                      <select
                        value={isCardio ? 'cardio' : 'strength'}
                        onChange={(e) => handleTemplateExTypeToggle(exIdx, e.target.value === 'cardio')}
                        className="w-full bg-zinc-900 border border-white/10 text-zinc-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                      >
                        <option value="strength">💪 Strength</option>
                        <option value="cardio">🏃 Cardio / Duration</option>
                      </select>
                    </div>

                    {isCardio ? (
                      <div>
                        <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Target Duration</label>
                        <input
                          type="text"
                          value={ex.duration || ''}
                          onChange={(e) => handleTemplateDurationChange(exIdx, e.target.value)}
                          className="w-full bg-zinc-900/50 border border-white/10 text-zinc-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-violet-500"
                          placeholder="e.g. 20 mins"
                          required
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 col-span-1">
                        <div>
                          <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Sets</label>
                          <input
                            type="number"
                            value={ex.sets || 3}
                            onChange={(e) => handleTemplateSetsChange(exIdx, parseInt(e.target.value) || 1)}
                            className="w-full bg-zinc-900/50 border border-white/10 text-zinc-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none"
                            min="1"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Reps</label>
                          <input
                            type="text"
                            value={ex.reps || '8-12'}
                            onChange={(e) => handleTemplateRepsChange(exIdx, e.target.value)}
                            className="w-full bg-zinc-900/50 border border-white/10 text-zinc-200 rounded-lg px-1 py-1.5 text-xs text-center focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Weight</label>
                          <input
                            type="text"
                            value={ex.weight || '0kg'}
                            onChange={(e) => handleTemplateWeightChange(exIdx, e.target.value)}
                            className="w-full bg-zinc-900/50 border border-white/10 text-zinc-200 rounded-lg px-1 py-1.5 text-xs text-center focus:outline-none"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status Messages */}
          {statusMsg && (
            <div className={`p-4 rounded-xl flex items-center gap-3 border ${
              statusType === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              {statusType === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              <span className="text-xs font-medium leading-relaxed">{statusMsg}</span>
            </div>
          )}

          {/* Save Template Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-gradient-to-r from-violet-500 to-rose-500 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-violet-500/20 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Saving Template...' : 'Save Template Changes'}
          </button>
        </form>
      ) : (
        /* Standard Logging Mode Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Day Select & Datepicker */}
          <div className="glass rounded-2xl p-5 border border-white/5 space-y-4 animate-fade-in-up delay-75">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                  Select Workout Day
                </label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full min-w-0 appearance-none bg-zinc-900 border border-white/10 text-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                >
                  {Object.keys(FALLBACK_SPLITS).map((key) => (
                    <option key={key} value={key}>
                      {key} - {FALLBACK_SPLITS[key].split_name.split(':')[1]?.trim() || FALLBACK_SPLITS[key].split_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-0">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-rose-400" />
                  Workout Date
                </label>
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full min-w-0 appearance-none bg-zinc-900 border border-white/10 text-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                  style={{ WebkitAppearance: 'none' }}
                  required
                />
              </div>
            </div>

            <div className="border-t border-white/5 pt-3">
              <p className="text-xs text-zinc-400">Target Split:</p>
              <h2 className="text-sm font-semibold text-violet-400 mt-1">{splitName}</h2>
            </div>
          </div>

          {/* Exercises */}
          <div className="space-y-4 animate-fade-in-up delay-150">
            {exercises.map((ex, exIdx) => (
              <div key={ex.name} className="glass rounded-2xl p-5 border border-white/5 space-y-4">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="font-bold text-zinc-100 text-sm leading-tight mb-3">{ex.name}</h3>
                  {!ex.duration && (
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Load Type Segmented Toggle */}
                      <div className="flex bg-zinc-950/60 rounded-lg p-0.5 border border-white/5 items-center">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...exercises];
                            updated[exIdx].loadType = 'single';
                            setExercises(updated);
                          }}
                          className={`text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider transition-colors cursor-pointer ${
                            ex.loadType !== 'double' 
                              ? 'bg-zinc-800 text-zinc-100' 
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          Stack
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...exercises];
                            updated[exIdx].loadType = 'double';
                            setExercises(updated);
                          }}
                          className={`text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider transition-colors cursor-pointer ${
                            ex.loadType === 'double' 
                              ? 'bg-zinc-800 text-zinc-100' 
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          2-Sides
                        </button>
                      </div>

                      {/* Initial Machine/Bar Base Weight */}
                      <div className="flex items-center gap-1.5 bg-zinc-950/60 rounded-lg px-2 border border-white/5 py-1">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Base:</span>
                        <input
                          type="number"
                          step="any"
                          value={ex.initialWeight || '0'}
                          onChange={(e) => {
                            const updated = [...exercises];
                            updated[exIdx].initialWeight = e.target.value;
                            setExercises(updated);
                          }}
                          className="w-10 bg-transparent border-none text-zinc-200 text-xs focus:outline-none text-center font-bold"
                          title="Base carriage/bar weight of this exercise/machine"
                        />
                        <span className="text-[9px] font-bold text-zinc-600">KG</span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => addSet(exIdx)}
                        className="flex items-center gap-1 text-[11px] font-semibold bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ml-auto sm:ml-0"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Set
                      </button>
                    </div>
                  )}
                </div>

                {ex.duration ? (
                  /* Cardio/Duration inputs */
                  <div className="flex gap-4">
                    <div className="flex-grow">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Duration</label>
                      <input
                        type="text"
                        value={ex.duration}
                        onChange={(e) => {
                          const updated = [...exercises];
                          updated[exIdx].duration = e.target.value;
                          setExercises(updated);
                        }}
                        className="w-full bg-zinc-900/50 border border-white/10 text-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>
                ) : (
                  /* Strength Sets inputs */
                  <div className="space-y-2">
                    {ex.sets.map((set: any, setIdx: number) => (
                      <div key={set.setNum} className="flex items-center gap-3 bg-zinc-900/30 p-2.5 rounded-xl border border-white/5">
                        <span className="text-xs font-mono font-bold text-zinc-500 w-12 text-center">
                          SET {set.setNum}
                        </span>
                        
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div className="flex items-center bg-zinc-950/60 rounded-lg px-2 border border-white/5">
                            <input
                              type="number"
                              placeholder="Reps"
                              value={set.reps}
                              onChange={(e) => handleSetChange(exIdx, setIdx, 'reps', e.target.value)}
                              className="w-full bg-transparent border-none text-zinc-200 text-xs py-1.5 focus:outline-none text-center"
                              required
                            />
                            <span className="text-[10px] font-bold text-zinc-600 uppercase pr-1">Reps</span>
                          </div>

                          <div className="flex items-center bg-zinc-950/60 rounded-lg px-2 border border-white/5">
                            <span className="text-[10px] font-bold text-zinc-600 pl-1 pr-0.5">+</span>
                            <input
                              type="number"
                              step="any"
                              placeholder={ex.loadType === 'double' ? "Per Side" : "Plates"}
                              value={set.weight}
                              onChange={(e) => handleSetChange(exIdx, setIdx, 'weight', e.target.value)}
                              className="w-full bg-transparent border-none text-zinc-200 text-xs py-1.5 focus:outline-none text-center font-semibold"
                              required
                              title="Weight added to base weight"
                            />
                            {ex.loadType === 'double' && (
                              <span className="text-[10px] font-bold text-amber-500/80 pr-1 select-none">×2</span>
                            )}
                            <span className="text-[10px] font-bold text-zinc-600 uppercase pr-1">KG</span>
                          </div>
                        </div>

                        {ex.sets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSet(exIdx, setIdx)}
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

          {/* Sticky Submit & Save controls */}
          <div className="sticky bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-md p-4 border-t border-white/10 -mx-4 -mb-10 pb-8 z-20 space-y-4">
            {/* Status Messages */}
            {statusMsg && (
              <div className={`p-4 rounded-xl flex items-center gap-3 border ${
                statusType === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                {statusType === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                <span className="text-xs font-medium leading-relaxed">{statusMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                type="submit"
                disabled={loading}
                onClick={() => setSubmitStatus('draft')}
                className="flex items-center justify-center bg-zinc-900 border border-white/10 text-zinc-300 hover:bg-zinc-800 font-semibold py-4 rounded-2xl transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer text-sm"
              >
                {loading && submitStatus === 'draft' ? 'Saving Draft...' : 'Save Draft'}
              </button>
              <button
                type="submit"
                disabled={loading}
                onClick={() => setSubmitStatus('completed')}
                className="flex items-center justify-center bg-gradient-to-r from-violet-500 to-rose-500 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-violet-500/20 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer text-sm"
              >
                {loading && submitStatus === 'completed' ? 'Submitting...' : 'Finish & Analyze'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
