
import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { IntakeRecord, IntakeStatus } from '../types';
import NextMedicationCard from '../components/patient/NextMedicationCard';
import DailyMedicationItem from '../components/patient/DailyMedicationItem';
import VisualPillbox from '../components/patient/VisualPillbox';
import EmergencyModal from '../components/patient/EmergencyModal';

const PatientDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const { intakeHistory, loading, updateIntakeStatus, clearData } = useData();
    const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
    const emergencyButtonRef = React.useRef<HTMLButtonElement>(null);


    const { nextMedication, upcomingSchedule, pastSchedule } = useMemo(() => {
        if (!intakeHistory) return { nextMedication: null, upcomingSchedule: [], pastSchedule: [] };
        const pending = intakeHistory
            .filter(r => r.status === IntakeStatus.PENDING)
            .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
        
        const past = intakeHistory
            .filter(r => r.status !== IntakeStatus.PENDING)
            .sort((a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime());

        return {
            nextMedication: pending[0] || null,
            upcomingSchedule: pending.slice(1),
            pastSchedule: past,
        };
    }, [intakeHistory]);

    const handleLogout = () => {
        logout(clearData);
    };

    const handleTake = (record: IntakeRecord) => {
        updateIntakeStatus(record, IntakeStatus.TAKEN);
    };

    const handleSkip = (record: IntakeRecord) => {
        updateIntakeStatus(record, IntakeStatus.MISSED);
    };
    
    const renderLoader = () => (
         <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-pildhora-primary"></div>
        </div>
    );
    
    const renderEmptyState = () => (
        <div className="text-center bg-white rounded-3xl shadow-lg p-10">
            <h2 className="text-3xl font-bold text-pildhora-success">¡Todo listo por hoy!</h2>
            <p className="text-lg text-gray-600 mt-2">No tienes más medicinas pendientes.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-pildhora-background font-sans text-gray-800">
            <header className="p-4 sm:p-6">
                 <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-pildhora-primary">PILDHORA</h1>
                        <p className="text-lg text-gray-600">Hola, {user?.name.split(' ')[0]}</p>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <button
                            ref={emergencyButtonRef}
                            onClick={() => setIsEmergencyModalOpen(true)}
                            className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-base font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 active:scale-95 transition-transform"
                            aria-label="Botón de emergencia"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <span className="hidden sm:inline">EMERGENCIA</span>
                        </button>
                        <button 
                            onClick={handleLogout} 
                            className="px-4 py-2 text-sm font-semibold text-white bg-pildhora-secondary rounded-xl hover:bg-blue-800 active:scale-95 transition-transform"
                        >
                            Salir
                        </button>
                    </div>
                 </div>
            </header>

            <main className="p-4 sm:p-6 max-w-4xl mx-auto space-y-8 pb-8">
                {loading ? renderLoader() : (
                    nextMedication ? (
                        <NextMedicationCard 
                            medication={nextMedication}
                            onTake={handleTake}
                            onSkip={handleSkip}
                        />
                    ) : (
                        renderEmptyState()
                    )
                )}

                <div className="space-y-6">
                    {(upcomingSchedule.length > 0 || pastSchedule.length > 0) && (
                        <div className="bg-white rounded-3xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold text-pildhora-secondary mb-4" id="plan-hoy-heading">Tu plan para hoy</h2>
                             <ul className="space-y-4" aria-labelledby="plan-hoy-heading">
                                {/* Upcoming */}
                                {upcomingSchedule.map(record => (
                                    <DailyMedicationItem key={record.id} record={record} />
                                ))}
                                
                                {/* Divider */}
                                {upcomingSchedule.length > 0 && pastSchedule.length > 0 && (
                                     <li className="py-2" aria-hidden="true">
                                        <hr className="border-gray-200"/>
                                    </li>
                                )}

                                {/* Past */}
                                {pastSchedule.map(record => (
                                    <DailyMedicationItem key={record.id} record={record} />
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    <VisualPillbox intakeHistory={intakeHistory} nextMedication={nextMedication} />
                </div>
            </main>
            
            <EmergencyModal 
                isOpen={isEmergencyModalOpen}
                onClose={() => setIsEmergencyModalOpen(false)}
                triggerRef={emergencyButtonRef}
            />
        </div>
    );
};

export default PatientDashboard;
