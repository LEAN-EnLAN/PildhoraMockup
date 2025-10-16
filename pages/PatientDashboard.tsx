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
    const { intakeHistory, medications, loading, updateIntakeStatus, clearData } = useData();
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
                    <button onClick={handleLogout} className="text-sm font-semibold text-pildhora-secondary hover:underline">
                        Salir
                    </button>
                 </div>
            </header>

            <main className="p-4 sm:p-6 max-w-4xl mx-auto space-y-8">
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
                    
                    <VisualPillbox medications={medications} />
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t">
                 <div className="max-w-4xl mx-auto">
                    <button
                        ref={emergencyButtonRef}
                        onClick={() => setIsEmergencyModalOpen(true)}
                        className="w-full py-4 text-xl font-bold text-white bg-red-600 rounded-2xl hover:bg-red-700 active:scale-95 transition-transform"
                    >
                        EMERGENCIA
                    </button>
                 </div>
            </footer>
            
            <EmergencyModal 
                isOpen={isEmergencyModalOpen}
                onClose={() => setIsEmergencyModalOpen(false)}
                triggerRef={emergencyButtonRef}
            />
        </div>
    );
};

export default PatientDashboard;