
import React from 'react';
import { useData } from '../../context/DataContext';
import { IntakeStatus } from '../../types';

const StatusIcon: React.FC<{ status: IntakeStatus }> = ({ status }) => {
    switch (status) {
        case IntakeStatus.TAKEN:
            return <div className="w-6 h-6 rounded-full bg-pildhora-success flex items-center justify-center text-white font-bold">✓</div>;
        case IntakeStatus.MISSED:
            return <div className="w-6 h-6 rounded-full bg-pildhora-error flex items-center justify-center text-white font-bold">!</div>;
        case IntakeStatus.PENDING:
            return <div className="w-6 h-6 rounded-full bg-gray-300 animate-pulse"></div>;
        default:
            return null;
    }
};

const IntakeHistory: React.FC = () => {
    const { intakeHistory, loading } = useData();

    if (loading) {
        return <div className="bg-white p-6 rounded-lg shadow">Cargando historial...</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Historial de Tomas del Día</h3>
            <div className="space-y-3">
                {intakeHistory.map(record => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                        <div className="flex items-center space-x-4">
                            <StatusIcon status={record.status} />
                            <div>
                                <p className="font-semibold text-gray-700">{record.medicationName}</p>
                                <p className="text-sm text-gray-500">{record.dosage}</p>
                            </div>
                        </div>
                        <div className="text-right">
                           <p className="font-bold text-lg text-gray-800">{record.scheduledTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                           {record.status === IntakeStatus.MISSED && <p className="text-xs text-pildhora-error font-semibold">Omitida</p>}
                           {record.status === IntakeStatus.TAKEN && <p className="text-xs text-pildhora-success font-semibold">Tomada</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IntakeHistory;
