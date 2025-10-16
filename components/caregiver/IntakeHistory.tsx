import React from 'react';
import { useData } from '../../context/DataContext';
import { IntakeStatus, IntakeRecord } from '../../types';

// Fix: Replaced invalid 'title' prop with a <title> element for accessibility.
const BluetoothIcon: React.FC = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-4 h-4 text-blue-500" 
        viewBox="0 0 20 20" 
        fill="currentColor"
        aria-label="Registrada por pastillero"
    >
        <title>Registrada por pastillero</title>
        <path fillRule="evenodd" d="M4.902 4.098a.75.75 0 011.06 0l4.25 4.25v-3.5a.75.75 0 011.5 0v8.5a.75.75 0 01-1.5 0v-3.5L5.962 15.9a.75.75 0 01-1.06-1.06L9.152 10 4.902 5.158a.75.75 0 010-1.06zM11.77 10.53a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06l4.25-4.25a.75.75 0 011.06 0zM10 8.811l4.25-4.25a.75.75 0 111.06 1.06L10.53 10l4.78 4.78a.75.75 0 11-1.06 1.06L10 11.189v3.561a.75.75 0 01-1.5 0V5.25a.75.75 0 011.5 0v3.561z" clipRule="evenodd" />
    </svg>
);

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
                {intakeHistory.map((record: IntakeRecord) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                        <div className="flex items-center space-x-4">
                            <StatusIcon status={record.status} />
                            <div>
                                <p className="font-semibold text-gray-700">{record.medicationName}</p>
                                <div className="flex items-center space-x-2">
                                    <p className="text-sm text-gray-500">{record.dosage}</p>
                                    {record.method === 'bluetooth' && <BluetoothIcon />}
                                </div>
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