import React from 'react';
import { IntakeRecord, IntakeStatus } from '../../types';

interface DailyMedicationItemProps {
    record: IntakeRecord;
}

const StatusIndicator: React.FC<{ status: IntakeStatus }> = ({ status }) => {
    switch (status) {
        case IntakeStatus.TAKEN:
            return (
                <div className="w-10 h-10 rounded-full bg-pildhora-primary flex items-center justify-center text-white font-bold text-2xl" aria-label="Tomada">
                    ✓
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
                <StatusIndicator status={record.status} />
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