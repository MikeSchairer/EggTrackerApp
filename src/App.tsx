import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardTab } from './components/tabs/DashboardTab';
import { EggsTab } from './components/tabs/EggsTab';
import { FlockTab } from './components/tabs/FlockTab';
import { CoopsTab } from './components/tabs/CoopsTab';
import { BreedsTab } from './components/tabs/BreedsTab';
import { AnalyticsTab } from './components/tabs/AnalyticsTab';
import { EggLoggerModal } from './components/EggLoggerModal';
import { ChickenModal } from './components/ChickenModal';
import { CoopModal } from './components/CoopModal';
import { PrintReportModal } from './components/PrintReportModal';
import { ThemeModal } from './components/ThemeModal';
import { ThemeProvider } from './context/ThemeContext';
import { loadFlockState, saveFlockState, resetToSampleData, exportBackupJson } from './utils/storage';
import { FlockState, Chicken, Coop, EggLog, WeightRecord } from './types/flock';

function FlockAppContent() {
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

  // Sync state to local storage on change
  useEffect(() => {
    saveFlockState(state);
  }, [state]);

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
    setState(prev => ({
      ...prev,
      coops: prev.coops.map(c => (c.id === coopId ? { ...c, lastCleanedDate: '2026-10-09' } : c)),
    }));
  };

  // Reset to Sample Data
  const handleResetData = () => {
    if (window.confirm('Reset all flock and egg data to the default sample dataset?')) {
      const fresh = resetToSampleData();
      setState(fresh);
    }
  };

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
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-8 min-w-0 overflow-x-hidden">
        {activeTab === 'dashboard' && (
          <DashboardTab
            coops={state.coops}
            chickens={state.chickens}
            eggLogs={state.eggLogs}
            onOpenLogEggs={() => setIsLogEggsOpen(true)}
            onOpenAddChicken={handleOpenAddChicken}
            onSelectCoop={(coopId) => setState(prev => ({ ...prev, selectedCoopId: coopId }))}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'eggs' && (
          <EggsTab
            coops={state.coops}
            chickens={state.chickens}
            eggLogs={state.eggLogs}
            onOpenLogEggs={() => setIsLogEggsOpen(true)}
            onDeleteLog={handleDeleteEggLog}
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
            onOpenAddCoop={handleOpenAddCoop}
            onEditCoop={handleEditCoop}
            onDeleteCoop={handleDeleteCoop}
            onTransferChicken={handleTransferChicken}
            onCleanCoop={handleCleanCoop}
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
            <span className="font-semibold text-stone-700 dark:text-stone-200">Cluck & Clutch</span>
            <span>·</span>
            <span>Homestead Poultry & Egg Production Management</span>
          </div>
          <div className="flex items-center gap-4 text-stone-400 dark:text-stone-500">
            <span>Offline-Ready Local Storage</span>
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
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <FlockAppContent />
    </ThemeProvider>
  );
}

