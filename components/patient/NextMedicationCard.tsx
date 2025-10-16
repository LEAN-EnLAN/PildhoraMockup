import React from 'react';
import { IntakeRecord } from '../../types';

interface NextMedicationCardProps {
    medication: IntakeRecord;
    onTake: (record: IntakeRecord) => void;
    onSkip: (record: IntakeRecord) => void;
}

const NextMedicationCard: React.FC<NextMedicationCardProps> = ({ medication, onTake, onSkip }) => {
    return (
        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 space-y-6">
            <div>
                <p className="text-xl font-semibold text-pildhora-secondary">Tu Próxima Medicina</p>
                <p className="text-5xl sm:text-6xl font-extrabold text-gray-800">{medication.scheduledTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-5 text-center">
                 <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">{medication.medicationName}</h3>
                 <p className="text-xl text-gray-600">{medication.dosage}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    onClick={() => onTake(medication)}
                    className="w-full py-5 text-2xl font-bold text-white transition-transform transform bg-pildhora-primary rounded-2xl hover:bg-green-800 active:scale-95"
                >
                    YA LA TOMÉ
                </button>
                <button
                    onClick={() => onSkip(medication)}
                    className="w-full py-5 text-2xl font-bold text-gray-700 transition-transform transform bg-gray-200 rounded-2xl hover:bg-gray-300 active:scale-95"
                >
                    Omitir
                </button>
            </div>
        </div>
    );
};

export default NextMedicationCard;