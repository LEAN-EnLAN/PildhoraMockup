import React from 'react';
import { IntakeRecord, IntakeStatus } from '../../types';

interface DailyMedicationItemProps {
    record: IntakeRecord;
}

// Fix: Replaced invalid 'title' prop with a <title> element for accessibility.
const BluetoothIcon: React.FC = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-4 h-4 text-blue-500 ml-1" 
        viewBox="0 0 20 20" 
        fill="currentColor"
        aria-label="Tomada con pastillero"
    >
      <title>Tomada con pastillero</title>
      <path fillRule="evenodd" d="M4.902 4.098a.75.75 0 011.06 0l4.25 4.25v-3.5a.75.75 0 011.5 0v8.5a.75.75 0 01-1.5 0v-3.5L5.962 15.9a.75.75 0 01-1.06-1.06L9.152 10 4.902 5.158a.75.75 0 010-1.06zM11.77 10.53a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06l4.25-4.25a.75.75 0 011.06 0zM10 8.811l4.25-4.25a.75.75 0 111.06 1.06L10.53 10l4.78 4.78a.75.75 0 11-1.06 1.06L10 11.189v3.561a.75.75 0 01-1.5 0V5.25a.75.75 0 011.5 0v3.561z" clipRule="evenodd" />
    </svg>
);


const StatusIndicator: React.FC<{ status: IntakeStatus; method?: string }> = ({ status, method }) => {
    switch (status) {
        case IntakeStatus.TAKEN:
            return (
                <div className="w-10 h-10 rounded-full bg-pildhora-primary flex items-center justify-center text-white font-bold text-2xl" aria-label="Tomada">
                   <div className="flex items-center">
                        <span>✓</span>
                        {method === 'bluetooth' && <BluetoothIcon />}
                   </div>
                </div>
            );
        case IntakeStatus.MISSED:
            return (
                <div className="w-10 h-10 rounded-full bg-pildhora-error-dark flex items-center justify-center text-white font-bold text-2xl" aria-label="Omitida">
                    !
                </div>
            );
        case IntakeStatus.PENDING:
        default:
            return <div className="w-10 h-10 rounded-full bg-gray-300" aria-label="Pendiente"></div>;
    }
};

const DailyMedicationItem: React.FC<DailyMedicationItemProps> = ({ record }) => {
    const isPending = record.status === IntakeStatus.PENDING;
    const itemClasses = `flex items-center justify-between p-4 rounded-2xl ${
        isPending ? 'bg-slate-50' : 'bg-slate-100 opacity-60'
    }`;

    return (
        <li className={itemClasses}>
            <div className="flex items-center space-x-4">
                <StatusIndicator status={record.status} method={record.method} />
                <div>
                    <p className={`text-xl font-bold ${isPending ? 'text-gray-800' : 'text-gray-500'}`}>
                        {record.medicationName}
                    </p>
                    <p className={`text-base ${isPending ? 'text-gray-600' : 'text-gray-400'}`}>
                        {record.dosage}
                    </p>
                </div>
            </div>
            <p className={`text-2xl font-extrabold ${isPending ? 'text-pildhora-secondary' : 'text-gray-500'}`}>
                {record.scheduledTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </p>
        </li>
    );
};

export default DailyMedicationItem;