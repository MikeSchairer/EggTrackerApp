import React, { useState } from 'react';
import { 
  HeartPulse, 
  ShieldCheck, 
  CloudSun, 
  AlertTriangle, 
  Plus, 
  CheckCircle2, 
  Thermometer, 
  Clock, 
  Calendar, 
  Activity, 
  Eye, 
  Feather, 
  Lock, 
  ShieldAlert, 
  Check 
} from 'lucide-react';
import { 
  HealthRecord, 
  Chicken, 
  PredatorIncident, 
  SecurityChecklist 
} from '../../types/flock';
import { getWeatherCareAdvisories } from '../../utils/flockCalculations';

interface HealthTabProps {
  healthRecords: HealthRecord[];
  chickens: Chicken[];
  predatorIncidents: PredatorIncident[];
  securityChecklists: SecurityChecklist[];
  onSaveHealthRecord: (record: HealthRecord) => void;
  onSavePredatorIncident: (incident: PredatorIncident) => void;
  onSaveSecurityChecklist: (checklist: SecurityChecklist) => void;
}

export const HealthTab: React.FC<HealthTabProps> = ({
  healthRecords,
  chickens,
  predatorIncidents,
  securityChecklists,
  onSaveHealthRecord,
  onSavePredatorIncident,
  onSaveSecurityChecklist,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'health' | 'weather' | 'predators' | 'lockdown'>('health');
  const [selectedChickenFilter, setSelectedChickenFilter] = useState<string>('all');
  const [isHealthModalOpen, setIsHealthModalOpen] = useState<boolean>(false);
  const [isPredatorModalOpen, setIsPredatorModalOpen] = useState<boolean>(false);

  // Weather simulation state
  const [simulatedTempF, setSimulatedTempF] = useState<number>(62);

  // Health Form State
  const [targetChickenId, setTargetChickenId] = useState<string>(chickens[0]?.id || '');
  const [recordType, setRecordType] = useState<HealthRecord['type']>('symptom');
  const [recordTitle, setRecordTitle] = useState<string>('');
  const [symptomTag, setSymptomTag] = useState<string>('');
  const [treatmentGiven, setTreatmentGiven] = useState<string>('');
  const [medicationName, setMedicationName] = useState<string>('');
  const [withdrawalDays, setWithdrawalDays] = useState<number>(0);
  const [recordOutcome, setRecordOutcome] = useState<HealthRecord['outcome']>('monitoring');
  const [recordNotes, setRecordNotes] = useState<string>('');

  // Predator Form State
  const [predatorType, setPredatorType] = useState<PredatorIncident['predatorType']>('Hawk / Raptor');
  const [predatorTime, setPredatorTime] = useState<PredatorIncident['timeOfDay']>('daylight');
  const [predatorSeverity, setPredatorSeverity] = useState<PredatorIncident['severity']>('sighting');
  const [predatorAction, setPredatorAction] = useState<string>('');
  const [predatorNotes, setPredatorNotes] = useState<string>('');

  // Night Lockdown Checklist State
  const todayStr = new Date().toISOString().split('T')[0];
  const existingTodayChecklist = securityChecklists.find(c => c.date === todayStr);

  const [doorConfirmed, setDoorConfirmed] = useState<boolean>(existingTodayChecklist?.automaticDoorConfirmed ?? true);
  const [windowsLatched, setWindowsLatched] = useState<boolean>(existingTodayChecklist?.windowsLatched ?? true);
  const [apronChecked, setApronChecked] = useState<boolean>(existingTodayChecklist?.predatorApronChecked ?? true);
  const [feedLocked, setFeedLocked] = useState<boolean>(existingTodayChecklist?.feedBucketsLocked ?? true);
  const [watererClean, setWatererClean] = useState<boolean>(existingTodayChecklist?.watererCleanAndUnfrozen ?? true);
  const [headcountConfirmed, setHeadcountConfirmed] = useState<boolean>(existingTodayChecklist?.roostHeadcountConfirmed ?? true);
  const [checklistSaved, setChecklistSaved] = useState<boolean>(false);

  const weatherAdvice = getWeatherCareAdvisories(simulatedTempF);

  const filteredRecords = healthRecords.filter(r => {
    if (selectedChickenFilter === 'all') return true;
    return r.chickenId === selectedChickenFilter;
  });

  const handleSaveHealth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetChickenId || !recordTitle.trim()) return;

    const newRecord: HealthRecord = {
      id: `health-${Date.now()}`,
      chickenId: targetChickenId,
      date: new Date().toISOString().split('T')[0],
      type: recordType,
      title: recordTitle.trim(),
      symptoms: symptomTag.trim() ? [symptomTag.trim()] : undefined,
      treatmentGiven: treatmentGiven.trim() || undefined,
      medicationName: medicationName.trim() || undefined,
      withdrawalDaysEggs: Number(withdrawalDays) > 0 ? Number(withdrawalDays) : undefined,
      outcome: recordOutcome,
      notes: recordNotes.trim() || undefined,
    };

    onSaveHealthRecord(newRecord);
    setIsHealthModalOpen(false);
  };

  const handleSavePredator = (e: React.FormEvent) => {
    e.preventDefault();
    const incident: PredatorIncident = {
      id: `pred-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      timeOfDay: predatorTime,
      predatorType,
      severity: predatorSeverity,
      actionTaken: predatorAction.trim() || 'Coop security reinforced and birds counted safe.',
      notes: predatorNotes.trim() || undefined,
    };

    onSavePredatorIncident(incident);
    setIsPredatorModalOpen(false);
  };

  const handleSaveLockdownChecklist = () => {
    const checklist: SecurityChecklist = {
      id: `sec-${Date.now()}`,
      date: todayStr,
      automaticDoorConfirmed: doorConfirmed,
      windowsLatched,
      predatorApronChecked: apronChecked,
      feedBucketsLocked: feedLocked,
      watererCleanAndUnfrozen: watererClean,
      roostHeadcountConfirmed: headcountConfirmed,
      notes: 'Night roost checklist verified by flock manager.',
    };

    onSaveSecurityChecklist(checklist);
    setChecklistSaved(true);
    setTimeout(() => setChecklistSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <HeartPulse className="w-6 h-6 text-rose-600 dark:text-rose-500" />
            Flock Health, Weather Care & Predator Security
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Individual bird medical logs, weather-triggered care advisories, predator deterrence, and night lockdown routines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHealthModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 dark:bg-rose-600 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Log Health Event
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2 text-xs">
        {[
          { id: 'health', label: `Health Dossiers (${healthRecords.length})`, icon: HeartPulse },
          { id: 'weather', label: 'Weather-Aware Care', icon: CloudSun },
          { id: 'predators', label: `Predator Logs (${predatorIncidents.length})`, icon: ShieldAlert },
          { id: 'lockdown', label: 'Night Lockdown Checklist', icon: Lock },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'bg-amber-700 text-white dark:bg-amber-600'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* VIEW 1: HEALTH DOSSIERS & TIMELINE */}
      {activeSubTab === 'health' && (
        <div className="space-y-4">
          {/* Bird Filter Selector */}
          <div className="flex items-center justify-between text-xs p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-700 dark:text-stone-300">Filter by Bird:</span>
              <select
                value={selectedChickenFilter}
                onChange={e => setSelectedChickenFilter(e.target.value)}
                className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1 text-xs text-stone-800 dark:text-stone-200 font-medium"
              >
                <option value="all">Entire Flock ({chickens.length} birds)</option>
                {chickens.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.legBandId || 'No band'})</option>
                ))}
              </select>
            </div>

            <span className="text-stone-400">
              Showing {filteredRecords.length} health events
            </span>
          </div>

          {/* Timeline List */}
          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">No Health Issues Recorded</h3>
              <p className="text-xs text-stone-500">Your flock is in clean standing with no active treatments or injuries.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map(record => {
                const bird = chickens.find(c => c.id === record.chickenId);
                return (
                  <div
                    key={record.id}
                    className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs space-y-3 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-3.5 h-3.5 rounded-full shrink-0"
                          style={{ backgroundColor: bird?.avatarColor || '#D97706' }}
                        />
                        <div>
                          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                            {record.title}
                          </h3>
                          <p className="text-xs text-stone-500 dark:text-stone-400">
                            Bird: <strong>{bird?.name || 'Unknown'}</strong> · Band: {bird?.legBandId || 'None'} · Date: <strong>{record.date}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                          {record.type.replace(/_/g, ' ')}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          record.outcome === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : record.outcome === 'recovering'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}>
                          {record.outcome}
                        </span>
                      </div>
                    </div>

                    {/* Symptoms & Treatment Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-stone-50/70 dark:bg-stone-850/60 p-3 rounded-lg border border-stone-200/60 dark:border-stone-800">
                      {record.symptoms && record.symptoms.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold uppercase text-stone-400 block">Symptoms / Observations</span>
                          <span className="text-stone-800 dark:text-stone-200">{record.symptoms.join(', ')}</span>
                        </div>
                      )}

                      {record.treatmentGiven && (
                        <div>
                          <span className="text-[10px] font-bold uppercase text-stone-400 block">Treatment / Intervention</span>
                          <span className="text-stone-800 dark:text-stone-200">{record.treatmentGiven}</span>
                        </div>
                      )}
                    </div>

                    {/* Egg Withdrawal Warning Banner if active */}
                    {record.withdrawalDaysEggs && record.withdrawalDaysEggs > 0 && (
                      <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-center gap-2 text-xs text-red-900 dark:text-red-200">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>
                          <strong>Egg Withdrawal Active:</strong> Do not consume eggs from this hen for <strong>{record.withdrawalDaysEggs} days</strong> post medication.
                        </span>
                      </div>
                    )}

                    {record.notes && (
                      <p className="text-xs text-stone-600 dark:text-stone-400 italic">
                        "{record.notes}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: WEATHER-AWARE FLOCK CARE */}
      {activeSubTab === 'weather' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Homestead Weather Sensor
                </span>
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 mt-0.5">
                  <CloudSun className="w-5 h-5 text-amber-600" />
                  Local Ambient Conditions: {simulatedTempF}°F
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Automated seasonal prompts for comb frostbite, extreme heat panting, waterer icing, and ventilation.
                </p>
              </div>

              {/* Temperature simulation controller */}
              <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-800 text-xs space-y-1.5 shrink-0">
                <span className="font-semibold text-stone-700 dark:text-stone-300 block">
                  Simulate Seasonal Weather:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSimulatedTempF(18)}
                    className={`px-2 py-1 rounded text-[11px] font-bold ${simulatedTempF === 18 ? 'bg-blue-600 text-white' : 'bg-stone-200 dark:bg-stone-700'}`}
                  >
                    18°F Freeze
                  </button>
                  <button
                    onClick={() => setSimulatedTempF(62)}
                    className={`px-2 py-1 rounded text-[11px] font-bold ${simulatedTempF === 62 ? 'bg-amber-600 text-white' : 'bg-stone-200 dark:bg-stone-700'}`}
                  >
                    62°F Normal
                  </button>
                  <button
                    onClick={() => setSimulatedTempF(92)}
                    className={`px-2 py-1 rounded text-[11px] font-bold ${simulatedTempF === 92 ? 'bg-red-600 text-white' : 'bg-stone-200 dark:bg-stone-700'}`}
                  >
                    92°F Heatwave
                  </button>
                </div>
              </div>
            </div>

            {/* Weather Alert Banner */}
            <div className={`p-4 rounded-xl border space-y-2 ${
              weatherAdvice.type === 'freezing'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-100'
                : weatherAdvice.type === 'heat'
                ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-950 dark:text-red-100'
                : weatherAdvice.type === 'cold'
                ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-950 dark:text-sky-100'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {weatherAdvice.title}
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/80 dark:bg-stone-900/80">
                  {weatherAdvice.badge}
                </span>
              </div>

              <ul className="list-disc list-inside space-y-1 text-xs pt-1">
                {weatherAdvice.actions.map((act, idx) => (
                  <li key={idx}>{act}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: PREDATOR & SECURITY LOG */}
      {activeSubTab === 'predators' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
            <div>
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Predator Encounters & Perimeter Defense
              </h2>
              <p className="text-xs text-stone-500">
                Record wildlife sightings, attempted breaches, and defensive hardware upgrades.
              </p>
            </div>

            <button
              onClick={() => setIsPredatorModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Sighting / Incident
            </button>
          </div>

          <div className="space-y-3">
            {predatorIncidents.map(inc => (
              <div
                key={inc.id}
                className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                      {inc.predatorType}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 capitalize">
                      {inc.timeOfDay} sighting
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    inc.severity === 'damage_attempt'
                      ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}>
                    {inc.severity.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-stone-500">
                  Date: <strong>{inc.date}</strong>
                </p>

                <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-lg space-y-1">
                  <span className="text-[10px] font-bold uppercase text-stone-400 block">Defense Action Taken</span>
                  <p className="text-stone-800 dark:text-stone-200">{inc.actionTaken}</p>
                </div>

                {inc.notes && (
                  <p className="text-stone-500 italic">
                    "{inc.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: NIGHT LOCKDOWN CHECKLIST */}
      {activeSubTab === 'lockdown' && (
        <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Evening Routine Protocol
            </span>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 mt-0.5">
              <Lock className="w-5 h-5 text-amber-600" />
              Nightly Roost & Coop Lockdown Checklist
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Never lose a bird to nocturnal predators. Verify all physical safeguards every night at dusk.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'door',
                label: 'Automatic Coop Door Confirmed Closed & Latched',
                desc: 'Verify solar/electric timer triggered and all birds entered before pop-door closed.',
                checked: doorConfirmed,
                toggle: () => setDoorConfirmed(!doorConfirmed),
              },
              {
                id: 'windows',
                label: 'Windows & Screen Latches Locked',
                desc: 'Hardware cloth mesh secure with two-step predator-proof carabiners or barrel bolts.',
                checked: windowsLatched,
                toggle: () => setWindowsLatched(!windowsLatched),
              },
              {
                id: 'apron',
                label: 'Perimeter Hardware Cloth & Predator Skirt Clear',
                desc: 'Inspect ground perimeter for signs of raccoon or fox digging along skirt edge.',
                checked: apronChecked,
                toggle: () => setApronChecked(!apronChecked),
              },
              {
                id: 'feed',
                label: 'Feed Bins Sealed in Galvanized Cans',
                desc: 'Prevents attracting nocturnal rodents, raccoons, bears, or possums.',
                checked: feedLocked,
                toggle: () => setFeedLocked(!feedLocked),
              },
              {
                id: 'waterer',
                label: 'Drinkers Clean & Frost Protection Set',
                desc: 'Ensure heated water base plugged in if sub-freezing night is forecast.',
                checked: watererClean,
                toggle: () => setWatererClean(!watererClean),
              },
              {
                id: 'headcount',
                label: 'Roost Headcount Verified (All Birds Present)',
                desc: `Confirm count matches ${chickens.length} active birds safely roosting on perch bars.`,
                checked: headcountConfirmed,
                toggle: () => setHeadcountConfirmed(!headcountConfirmed),
              },
            ].map(item => (
              <div
                key={item.id}
                onClick={item.toggle}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                  item.checked
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850 hover:bg-stone-100'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  item.checked
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800'
                }`}>
                  {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div className="text-xs">
                  <h4 className={`font-bold ${item.checked ? 'text-emerald-950 dark:text-emerald-100' : 'text-stone-900 dark:text-stone-100'}`}>
                    {item.label}
                  </h4>
                  <p className="text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-800">
            <span className="text-xs text-stone-500">
              Date: <strong>{todayStr}</strong>
            </span>

            <button
              type="button"
              onClick={handleSaveLockdownChecklist}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              {checklistSaved ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {checklistSaved ? 'Lockdown Verified & Saved!' : 'Confirm Tonight’s Safe Lockdown'}
            </button>
          </div>
        </div>
      )}

      {/* Log Health Event Modal */}
      {isHealthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-600" />
                Log Chicken Health & Treatment Event
              </h2>
              <button
                type="button"
                onClick={() => setIsHealthModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveHealth} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Select Chicken *
                  </label>
                  <select
                    required
                    value={targetChickenId}
                    onChange={e => setTargetChickenId(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100"
                  >
                    {chickens.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.legBandId || 'No band'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Record Type *
                  </label>
                  <select
                    value={recordType}
                    onChange={e => setRecordType(e.target.value as any)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100"
                  >
                    <option value="symptom">Symptom Observed</option>
                    <option value="injury">Injury / Wound</option>
                    <option value="medication">Medication Administered</option>
                    <option value="routine_check">Routine Health Inspection</option>
                    <option value="vaccination">Vaccination / Deworming</option>
                    <option value="vet_visit">Veterinarian Visit</option>
                    <option value="recovery">Recovery Follow-up</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Title / Event Headline *
                </label>
                <input
                  type="text"
                  required
                  value={recordTitle}
                  onChange={e => setRecordTitle(e.target.value)}
                  placeholder="e.g. Mild bumblefoot check on right footpad"
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Symptoms / Clinical Signs
                </label>
                <input
                  type="text"
                  value={symptomTag}
                  onChange={e => setSymptomTag(e.target.value)}
                  placeholder="e.g. Limping, lethargy, sneezing, pale comb, feather loss"
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Treatment Given & Medication
                </label>
                <textarea
                  rows={2}
                  value={treatmentGiven}
                  onChange={e => setTreatmentGiven(e.target.value)}
                  placeholder="e.g. Cleaned with warm epsom salt soak, applied drawing salve & vet wrap."
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Egg Withdrawal Period (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={withdrawalDays}
                    onChange={e => setWithdrawalDays(Number(e.target.value))}
                    placeholder="0 if safe to eat"
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs font-mono text-stone-900 dark:text-stone-100"
                  />
                  <span className="text-[10px] text-stone-400">Days to discard eggs post-med</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Current Outcome Status
                  </label>
                  <select
                    value={recordOutcome}
                    onChange={e => setRecordOutcome(e.target.value as any)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100"
                  >
                    <option value="monitoring">Monitoring closely</option>
                    <option value="recovering">Recovering well</option>
                    <option value="resolved">Resolved / Clean</option>
                    <option value="chronic">Chronic condition</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Additional Notes
                </label>
                <textarea
                  rows={2}
                  value={recordNotes}
                  onChange={e => setRecordNotes(e.target.value)}
                  placeholder="e.g. Hen isolated in nursery hospital crate until swelling subsides."
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsHealthModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl"
                >
                  Save Health Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Predator Sighting Modal */}
      {isPredatorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                Log Predator Encounter
              </h2>
              <button
                type="button"
                onClick={() => setIsPredatorModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePredator} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Predator Identified
                  </label>
                  <select
                    value={predatorType}
                    onChange={e => setPredatorType(e.target.value as any)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100"
                  >
                    <option value="Hawk / Raptor">Hawk / Raptor</option>
                    <option value="Raccoon">Raccoon</option>
                    <option value="Fox">Fox</option>
                    <option value="Coyote">Coyote</option>
                    <option value="Possum">Possum</option>
                    <option value="Snake">Snake</option>
                    <option value="Owl">Owl</option>
                    <option value="Rat / Rodent">Rat / Rodent</option>
                    <option value="Stray Dog">Stray Dog</option>
                    <option value="Unknown">Unknown Predator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Time of Encounter
                  </label>
                  <select
                    value={predatorTime}
                    onChange={e => setPredatorTime(e.target.value as any)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100"
                  >
                    <option value="dawn">Early Dawn</option>
                    <option value="daylight">Daylight / Afternoon</option>
                    <option value="dusk">Dusk / Sunset</option>
                    <option value="night">Nighttime</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Severity Level
                </label>
                <select
                  value={predatorSeverity}
                  onChange={e => setPredatorSeverity(e.target.value as any)}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100"
                >
                  <option value="sighting">Sighting in vicinity (No contact)</option>
                  <option value="stalking_run">Stalking along run perimeter</option>
                  <option value="damage_attempt">Attempted break-in / scratching at door</option>
                  <option value="breach_prevented">Hardware cloth breach prevented</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Defense Action Taken *
                </label>
                <textarea
                  rows={2}
                  required
                  value={predatorAction}
                  onChange={e => setPredatorAction(e.target.value)}
                  placeholder="e.g. Secured birds in coop, checked overhead run netting."
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsPredatorModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl"
                >
                  Record Sighting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
