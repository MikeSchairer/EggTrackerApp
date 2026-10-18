import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { DashboardTab } from './components/tabs/DashboardTab';
import { EggsTab } from './components/tabs/EggsTab';
import { FlockTab } from './components/tabs/FlockTab';
import { CoopsTab } from './components/tabs/CoopsTab';
import { FeedInventoryTab } from './components/tabs/FeedInventoryTab';
import { IncubationTab } from './components/tabs/IncubationTab';
import { HealthTab } from './components/tabs/HealthTab';
import { FinancesTab } from './components/tabs/FinancesTab';
import { BreedsTab } from './components/tabs/BreedsTab';
import { AnalyticsTab } from './components/tabs/AnalyticsTab';

import { EggLoggerModal } from './components/EggLoggerModal';
import { ChickenModal } from './components/ChickenModal';
import { CoopModal } from './components/CoopModal';
import { PrintReportModal } from './components/PrintReportModal';
import { ThemeModal } from './components/ThemeModal';
import { LoginModal } from './components/LoginModal';
import { LoginScreen } from './components/LoginScreen';
import { Egg } from 'lucide-react';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { loadFlockState, saveFlockState, resetToSampleData, clearAllFlockData, exportBackupJson } from './utils/storage';
import { fetchUserFlockData, saveUserFlockData } from './services/flockSyncService';
import { 
  FlockState, 
  Chicken, 
  Coop, 
  EggLog, 
  WeightRecord, 
  FeedItem, 
  EggBatch, 
  IncubationBatch, 
  HealthRecord, 
  FinancialTransaction, 
  PredatorIncident, 
  SecurityChecklist, 
  CoopEnvironmentLog, 
  CoopMaintenanceItem 
} from './types/flock';

function FlockAppContent() {
  const { user, loading } = useAuth();
  const [guestMode, setGuestMode] = useState<boolean>(false);
  const [state, setState] = useState<FlockState>(() => loadFlockState());
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals state
  const [isLogEggsOpen, setIsLogEggsOpen] = useState<boolean>(false);
  const [isChickenModalOpen, setIsChickenModalOpen] = useState<boolean>(false);
  const [editingChicken, setEditingChicken] = useState<Chicken | null>(null);
  const [isCoopModalOpen, setIsCoopModalOpen] = useState<boolean>(false);
  const [editingCoop, setEditingCoop] = useState<Coop | null>(null);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Cloud sync flag
  const isCloudLoadedRef = useRef<boolean>(false);

  // When user logs in or changes, sync with their private Firestore record
  useEffect(() => {
    if (!user) {
      isCloudLoadedRef.current = false;
      return;
    }

    let isMounted = true;
    async function syncUserData() {
      if (!user) return;
      try {
        const cloudData = await fetchUserFlockData(user.uid);
        if (isMounted) {
          const hasDemoData = cloudData && (
            (Array.isArray(cloudData.chickens) && cloudData.chickens.some((c: any) => 
              c.id === 'hen-pebble' || c.id === 'hen-dotty' || c.id === 'hen-winnie' ||
              c.id === 'hen-ruby' || c.id === 'hen-celeste' || c.id === 'hen-maple' ||
              c.id === 'hen-clover' || c.id === 'hen-opal' || c.id === 'hen-copper'
            )) ||
            (Array.isArray(cloudData.coops) && cloudData.coops.some((coop: any) => 
              coop.id === 'coop-meadow' || coop.id === 'coop-heritage-barn' || coop.id === 'coop-pullet-nursery'
            ))
          );
          if (hasDemoData) {
            const clean = loadFlockState();
            await saveUserFlockData(user.uid, clean);
            setState(clean);
            isCloudLoadedRef.current = true;
          } else if (cloudData && Array.isArray(cloudData.coops)) {
            setState(cloudData);
            isCloudLoadedRef.current = true;
          } else {
            // New user account: seed their cloud record with current clean state
            await saveUserFlockData(user.uid, state);
            isCloudLoadedRef.current = true;
          }
        }
      } catch (err) {
        console.warn('Initial cloud sync error:', err);
      }
    }

    syncUserData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Sync state to local storage and Firestore if authenticated
  useEffect(() => {
    saveFlockState(state);

    if (user && isCloudLoadedRef.current) {
      const timeout = setTimeout(() => {
        saveUserFlockData(user.uid, state).catch(console.error);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [state, user]);

  // Handlers for Eggs
  const handleSaveEggLog = (log: EggLog) => {
    setState(prev => ({
      ...prev,
      eggLogs: [log, ...prev.eggLogs],
    }));
  };

  const handleDeleteEggLog = (logId: string) => {
    setState(prev => ({
      ...prev,
      eggLogs: prev.eggLogs.filter(l => l.id !== logId),
    }));
  };

  const handleSaveEggBatch = (batch: EggBatch) => {
    setState(prev => {
      const existing = prev.eggBatches || [];
      const index = existing.findIndex(b => b.id === batch.id);
      return {
        ...prev,
        eggBatches: index >= 0
          ? existing.map(b => (b.id === batch.id ? batch : b))
          : [batch, ...existing],
      };
    });
  };

  // Handlers for Chickens
  const handleOpenAddChicken = () => {
    setEditingChicken(null);
    setIsChickenModalOpen(true);
  };

  const handleEditChicken = (chicken: Chicken) => {
    setEditingChicken(chicken);
    setIsChickenModalOpen(true);
  };

  const handleSaveChicken = (chicken: Chicken) => {
    setState(prev => {
      const exists = prev.chickens.some(c => c.id === chicken.id);
      return {
        ...prev,
        chickens: exists
          ? prev.chickens.map(c => (c.id === chicken.id ? chicken : c))
          : [chicken, ...prev.chickens],
      };
    });
  };

  const handleDeleteChicken = (chickenId: string) => {
    setState(prev => ({
      ...prev,
      chickens: prev.chickens.filter(c => c.id !== chickenId),
    }));
  };

  const handleSaveWeight = (chickenId: string, record: WeightRecord) => {
    setState(prev => ({
      ...prev,
      chickens: prev.chickens.map(c => {
        if (c.id !== chickenId) return c;
        const existing = c.weightRecords || [];
        return {
          ...c,
          weightRecords: [...existing, record],
        };
      }),
    }));
  };

  const handleTransferChicken = (chickenId: string, targetCoopId: string) => {
    setState(prev => ({
      ...prev,
      chickens: prev.chickens.map(c => {
        if (c.id !== chickenId) return c;
        return { ...c, coopId: targetCoopId };
      }),
    }));
  };

  // Handlers for Coops
  const handleOpenAddCoop = () => {
    setEditingCoop(null);
    setIsCoopModalOpen(true);
  };

  const handleEditCoop = (coop: Coop) => {
    setEditingCoop(coop);
    setIsCoopModalOpen(true);
  };

  const handleSaveCoop = (coop: Coop) => {
    setState(prev => {
      const exists = prev.coops.some(c => c.id === coop.id);
      return {
        ...prev,
        coops: exists
          ? prev.coops.map(c => (c.id === coop.id ? coop : c))
          : [...prev.coops, coop],
      };
    });
  };

  const handleDeleteCoop = (coopId: string) => {
    setState(prev => ({
      ...prev,
      coops: prev.coops.filter(c => c.id !== coopId),
    }));
  };

  const handleCleanCoop = (coopId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setState(prev => ({
      ...prev,
      coops: prev.coops.map(c => (c.id === coopId ? { ...c, lastCleanedDate: todayStr } : c)),
    }));
  };

  const handleSaveEnvLog = (log: CoopEnvironmentLog) => {
    setState(prev => ({
      ...prev,
      coopEnvironmentLogs: [log, ...(prev.coopEnvironmentLogs || [])],
    }));
  };

  const handleToggleMaintenance = (taskId: string) => {
    setState(prev => ({
      ...prev,
      coopMaintenanceItems: (prev.coopMaintenanceItems || []).map(m =>
        m.id === taskId ? { ...m, completed: !m.completed } : m
      ),
    }));
  };

  const handleSaveMaintenanceTask = (task: CoopMaintenanceItem) => {
    setState(prev => ({
      ...prev,
      coopMaintenanceItems: [task, ...(prev.coopMaintenanceItems || [])],
    }));
  };

  // Handlers for Feed Inventory
  const handleSaveFeedItem = (item: FeedItem) => {
    setState(prev => {
      const existing = prev.feedInventory || [];
      const index = existing.findIndex(f => f.id === item.id);
      return {
        ...prev,
        feedInventory: index >= 0
          ? existing.map(f => (f.id === item.id ? item : f))
          : [item, ...existing],
      };
    });
  };

  const handleDeleteFeedItem = (itemId: string) => {
    setState(prev => ({
      ...prev,
      feedInventory: (prev.feedInventory || []).filter(f => f.id !== itemId),
    }));
  };

  // Handlers for Incubation
  const handleSaveIncubationBatch = (batch: IncubationBatch) => {
    setState(prev => {
      const existing = prev.incubationBatches || [];
      const index = existing.findIndex(b => b.id === batch.id);
      return {
        ...prev,
        incubationBatches: index >= 0
          ? existing.map(b => (b.id === batch.id ? batch : b))
          : [batch, ...existing],
      };
    });
  };

  const handleDeleteIncubationBatch = (batchId: string) => {
    setState(prev => ({
      ...prev,
      incubationBatches: (prev.incubationBatches || []).filter(b => b.id !== batchId),
    }));
  };

  // Handlers for Health & Security
  const handleSaveHealthRecord = (record: HealthRecord) => {
    setState(prev => ({
      ...prev,
      healthRecords: [record, ...(prev.healthRecords || [])],
    }));
  };

  const handleSavePredatorIncident = (incident: PredatorIncident) => {
    setState(prev => ({
      ...prev,
      predatorIncidents: [incident, ...(prev.predatorIncidents || [])],
    }));
  };

  const handleSaveSecurityChecklist = (checklist: SecurityChecklist) => {
    setState(prev => {
      const existing = prev.securityChecklists || [];
      const index = existing.findIndex(c => c.date === checklist.date);
      return {
        ...prev,
        securityChecklists: index >= 0
          ? existing.map(c => (c.date === checklist.date ? checklist : c))
          : [checklist, ...existing],
      };
    });
  };

  // Handlers for Finances
  const handleSaveTransaction = (tx: FinancialTransaction) => {
    setState(prev => ({
      ...prev,
      transactions: [tx, ...(prev.transactions || [])],
    }));
  };

  const handleDeleteTransaction = (txId: string) => {
    setState(prev => ({
      ...prev,
      transactions: (prev.transactions || []).filter(t => t.id !== txId),
    }));
  };

  // Handlers for Smart Reminders
  const handleToggleReminder = (reminderId: string) => {
    setState(prev => ({
      ...prev,
      reminders: (prev.reminders || []).map(r =>
        r.id === reminderId ? { ...r, completed: !r.completed } : r
      ),
    }));
  };

  // Clear all data to fresh slate
  const handleResetData = () => {
    if (window.confirm('Clear all flock data to a fresh clean slate?')) {
      const clean = clearAllFlockData();
      setState(clean);
      if (user) {
        saveUserFlockData(user.uid, clean).catch(console.error);
      }
    }
  };

  // Show sleek splash loading while resolving auth status
  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--theme-bg-canvas,#fafaf9)] dark:bg-stone-950 text-stone-900 dark:text-stone-100 p-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-600 text-white flex items-center justify-center shadow-xl shadow-amber-600/20 animate-pulse mb-4">
          <Egg className="w-9 h-9" />
        </div>
        <p className="text-base font-bold text-stone-800 dark:text-stone-200">
          Loading Flocker...
        </p>
        <span className="text-xs text-stone-400 mt-1">Connecting to your homestead</span>
      </div>
    );
  }

  // Ask for login before loading app
  if (!user && !guestMode) {
    return <LoginScreen onContinueAsGuest={() => setGuestMode(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--theme-bg-canvas)] dark:bg-stone-950 text-stone-900 dark:text-stone-100 selection:bg-amber-200 selection:text-amber-950 font-sans transition-colors duration-200 overflow-x-hidden w-full max-w-full">
      {/* Universal Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogEggs={() => setIsLogEggsOpen(true)}
        onOpenAddChicken={handleOpenAddChicken}
        onResetData={handleResetData}
        onExportBackup={() => exportBackupJson(state)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-8 min-w-0 overflow-x-hidden">
        {activeTab === 'dashboard' && (
          <DashboardTab
            coops={state.coops}
            chickens={state.chickens}
            eggLogs={state.eggLogs}
            feedInventory={state.feedInventory || []}
            healthRecords={state.healthRecords || []}
            reminders={state.reminders || []}
            incubationBatches={state.incubationBatches || []}
            onOpenLogEggs={() => setIsLogEggsOpen(true)}
            onOpenAddChicken={handleOpenAddChicken}
            onSelectCoop={(coopId) => setState(prev => ({ ...prev, selectedCoopId: coopId }))}
            onNavigateToTab={setActiveTab}
            onToggleReminder={handleToggleReminder}
          />
        )}

        {activeTab === 'eggs' && (
          <EggsTab
            coops={state.coops}
            chickens={state.chickens}
            eggLogs={state.eggLogs}
            eggBatches={state.eggBatches || []}
            onOpenLogEggs={() => setIsLogEggsOpen(true)}
            onDeleteLog={handleDeleteEggLog}
            onSaveEggBatch={handleSaveEggBatch}
          />
        )}

        {activeTab === 'flock' && (
          <FlockTab
            coops={state.coops}
            chickens={state.chickens}
            eggLogs={state.eggLogs}
            onOpenAddChicken={handleOpenAddChicken}
            onEditChicken={handleEditChicken}
            onDeleteChicken={handleDeleteChicken}
            onSaveWeight={handleSaveWeight}
            onTransferChicken={handleTransferChicken}
          />
        )}

        {activeTab === 'coops' && (
          <CoopsTab
            coops={state.coops}
            chickens={state.chickens}
            eggLogs={state.eggLogs}
            coopEnvLogs={state.coopEnvironmentLogs || []}
            coopMaintenanceItems={state.coopMaintenanceItems || []}
            onOpenAddCoop={handleOpenAddCoop}
            onEditCoop={handleEditCoop}
            onDeleteCoop={handleDeleteCoop}
            onTransferChicken={handleTransferChicken}
            onCleanCoop={handleCleanCoop}
            onSaveEnvLog={handleSaveEnvLog}
            onToggleMaintenance={handleToggleMaintenance}
            onSaveMaintenanceTask={handleSaveMaintenanceTask}
          />
        )}

        {activeTab === 'feed' && (
          <FeedInventoryTab
            feedItems={state.feedInventory || []}
            chickens={state.chickens}
            eggLogs={state.eggLogs}
            onSaveFeedItem={handleSaveFeedItem}
            onDeleteFeedItem={handleDeleteFeedItem}
          />
        )}

        {activeTab === 'incubation' && (
          <IncubationTab
            batches={state.incubationBatches || []}
            onSaveBatch={handleSaveIncubationBatch}
          />
        )}

        {activeTab === 'health' && (
          <HealthTab
            healthRecords={state.healthRecords || []}
            chickens={state.chickens}
            predatorIncidents={state.predatorIncidents || []}
            securityChecklists={state.securityChecklists || []}
            onSaveHealthRecord={handleSaveHealthRecord}
            onSavePredatorIncident={handleSavePredatorIncident}
            onSaveSecurityChecklist={handleSaveSecurityChecklist}
          />
        )}

        {activeTab === 'finances' && (
          <FinancesTab
            transactions={state.transactions || []}
            eggLogs={state.eggLogs}
            onSaveTransaction={handleSaveTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'breeds' && (
          <BreedsTab
            chickens={state.chickens}
            onRegisterBreedBird={() => handleOpenAddChicken()}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab
            coops={state.coops}
            chickens={state.chickens}
            eggLogs={state.eggLogs}
            onOpenPrintReport={() => setIsPrintReportOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/70 py-6 text-stone-500 dark:text-stone-400 text-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700 dark:text-stone-200">Flocker</span>
            <span>·</span>
            <span>Homestead Poultry & Egg Production Management</span>
          </div>
          <div className="flex items-center gap-4 text-stone-400 dark:text-stone-500">
            <span>{user ? `Cloud Protected (${user.email})` : 'Offline / Guest Mode'}</span>
            <span>·</span>
            <span>CSV & JSON Export Supported</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isLogEggsOpen && (
        <EggLoggerModal
          isOpen={isLogEggsOpen}
          onClose={() => setIsLogEggsOpen(false)}
          onSaveLog={handleSaveEggLog}
          coops={state.coops}
          chickens={state.chickens}
          defaultCoopId={state.selectedCoopId !== 'all' ? state.selectedCoopId : undefined}
        />
      )}

      {isChickenModalOpen && (
        <ChickenModal
          isOpen={isChickenModalOpen}
          onClose={() => {
            setIsChickenModalOpen(false);
            setEditingChicken(null);
          }}
          onSaveChicken={handleSaveChicken}
          editingChicken={editingChicken}
          coops={state.coops}
        />
      )}

      {isCoopModalOpen && (
        <CoopModal
          isOpen={isCoopModalOpen}
          onClose={() => {
            setIsCoopModalOpen(false);
            setEditingCoop(null);
          }}
          onSaveCoop={handleSaveCoop}
          editingCoop={editingCoop}
        />
      )}

      {isPrintReportOpen && (
        <PrintReportModal
          isOpen={isPrintReportOpen}
          onClose={() => setIsPrintReportOpen(false)}
          coops={state.coops}
          chickens={state.chickens}
          eggLogs={state.eggLogs}
        />
      )}

      {isThemeModalOpen && (
        <ThemeModal
          isOpen={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
        />
      )}

      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <FlockAppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
