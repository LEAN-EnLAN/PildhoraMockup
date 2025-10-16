import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import CaregiverHome from '../components/caregiver/CaregiverHome';
import IntakeHistory from '../components/caregiver/IntakeHistory';
import MedicationManager from '../components/caregiver/MedicationManager';
import CaregiverTasks from '../components/caregiver/CaregiverTasks';
import AdherenceChart from '../components/caregiver/AdherenceChart';
import CaregiverBottomNav from '../components/caregiver/CaregiverBottomNav';
import NotificationBell from '../components/caregiver/NotificationBell';
import SyncStatusIndicator from '../components/common/SyncStatusIndicator';
import NotificationPreferencesModal from '../components/caregiver/NotificationPreferencesModal';
import DeviceManager from '../components/caregiver/DeviceManager';

export type View = 'home' | 'history' | 'meds' | 'tasks' | 'adherence' | 'device';

const CaregiverDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const { clearData, syncStatus, loading } = useData();
    const [activeView, setActiveView] = useState<View>('home');
    const [isPrefsModalOpen, setIsPrefsModalOpen] = useState(false);

    const handleLogout = () => {
        logout(clearData);
    };

    const renderContent = () => {
        if (loading && activeView === 'home') { // Show loader only on initial home screen load
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pildhora-primary"></div>
                </div>
            );
        }
        switch (activeView) {
            case 'home':
                return <CaregiverHome />;
            case 'history':
                return <IntakeHistory />;
            case 'meds':
                return <MedicationManager />;
            case 'tasks':
                return <CaregiverTasks />;
            case 'adherence':
                return <AdherenceChart />;
            case 'device':
                return <DeviceManager />;
            default:
                return <CaregiverHome />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans">
            <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-20 shadow-sm p-4">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Hola, {user?.name.split(' ')[0]}</h1>
                        <p className="text-sm text-gray-500">Panel de Cuidador</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <SyncStatusIndicator status={syncStatus} />
                        <NotificationBell />
                         <button onClick={() => setIsPrefsModalOpen(true)} title="Configuración de notificaciones" className="p-2 rounded-full hover:bg-slate-200 transition-colors">
                            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </button>
                        <button onClick={handleLogout} className="text-sm font-semibold text-pildhora-primary hover:underline">
                            Salir
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-4 sm:p-6 max-w-4xl mx-auto pb-24">
                {renderContent()}
            </main>
            
            <CaregiverBottomNav activeView={activeView} setActiveView={setActiveView} />
            
            <NotificationPreferencesModal 
                isOpen={isPrefsModalOpen}
                onClose={() => setIsPrefsModalOpen(false)}
            />
        </div>
    );
};

export default CaregiverDashboard;
