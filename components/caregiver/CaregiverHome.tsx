import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { IntakeStatus } from '../../types';
import PatientHeader from './PatientHeader';

const StatCard: React.FC<{ title: string; count: number; color: string; icon: React.ReactNode }> = ({ title, count, color, icon }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-3xl font-bold text-gray-800">{count}</p>
            <p className="text-sm font-medium text-gray-500">{title}</p>
        </div>
    </div>
);


const CaregiverHome: React.FC = () => {
    const { intakeHistory, loading } = useData();

    const { stats, nextMedication } = useMemo(() => {
        if (loading) return { stats: { taken: 0, missed: 0, pending: 0 }, nextMedication: null };
        
        const taken = intakeHistory.filter(r => r.status === IntakeStatus.TAKEN).length;
        const missed = intakeHistory.filter(r => r.status === IntakeStatus.MISSED).length;
        const pending = intakeHistory.filter(r => r.status === IntakeStatus.PENDING).length;

        const next = intakeHistory
            .filter(r => r.status === IntakeStatus.PENDING)
            .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())[0];

        return { stats: { taken, missed, pending }, nextMedication: next };
    }, [intakeHistory, loading]);

    return (
        <div className="space-y-8">
            <PatientHeader />
            
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Resumen del Día</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard title="Tomadas" count={stats.taken} color="bg-green-100" icon={<span className="text-2xl text-green-600">✓</span>} />
                    <StatCard title="Omitidas" count={stats.missed} color="bg-red-100" icon={<span className="text-2xl text-red-600">!</span>} />
                    <StatCard title="Pendientes" count={stats.pending} color="bg-blue-100" icon={<span className="text-2xl text-blue-600">…</span>} />
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Próxima Toma Pendiente</h3>
                {nextMedication ? (
                     <div className="bg-white p-6 rounded-lg shadow">
                         <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-gray-800">{nextMedication.medicationName}</p>
                                <p className="text-lg text-gray-600">{nextMedication.dosage}</p>
                            </div>
                            <p className="text-4xl font-black text-pildhora-secondary">{nextMedication.scheduledTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                         </div>
                     </div>
                ) : (
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                        <p className="text-lg font-semibold text-pildhora-success">No hay más tomas pendientes por hoy.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CaregiverHome;