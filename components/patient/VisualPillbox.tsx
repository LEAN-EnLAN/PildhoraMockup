import React from 'react';
import { Medication } from '../../types';

interface VisualPillboxProps {
    medications: Medication[];
}

const PillboxCompartment: React.FC<{ compartment: number; meds: Medication[] }> = ({ compartment, meds }) => {
    return (
        <div className="bg-slate-100 rounded-2xl p-4 flex flex-col">
            <div className="w-8 h-8 bg-pildhora-secondary text-white font-bold rounded-full flex items-center justify-center self-start mb-3">
                {compartment}
            </div>
            <div className="flex-grow space-y-2">
                {meds.length > 0 ? (
                    meds.map(med => (
                        <div key={med.id} className="bg-white p-2 rounded-lg shadow-sm text-center">
                            <p className="font-bold text-gray-800 text-sm truncate">{med.name}</p>
                            <p className="text-xs text-gray-500">{med.dosage}</p>
                        </div>
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400 text-sm">Vacío</p>
                    </div>
                )}
            </div>
        </div>
    );
};


const VisualPillbox: React.FC<VisualPillboxProps> = ({ medications }) => {
    const compartments = [1, 2, 3, 4];

    return (
        <div className="bg-white rounded-3xl shadow-lg p-6" aria-hidden="true">
            <h2 className="text-xl font-semibold text-pildhora-secondary mb-4">Tu Pastillero Visual</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {compartments.map(compNum => (
                    <PillboxCompartment
                        key={compNum}
                        compartment={compNum}
                        meds={medications.filter(med => med.compartment === compNum)}
                    />
                ))}
            </div>
        </div>
    );
};

export default VisualPillbox;