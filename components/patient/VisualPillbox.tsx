import React from 'react';
import { IntakeRecord, Medication } from '../../types';

interface VisualPillboxProps {
    medications: Medication[];
    nextMedication: IntakeRecord | null;
}

const VisualPillbox: React.FC<VisualPillboxProps> = ({ medications, nextMedication }) => {
    const compartments = [1, 2, 3, 4];

    return (
        <section className="bg-white rounded-3xl shadow-lg p-6 sm:p-8" aria-labelledby="pillbox-title">
            <h2 id="pillbox-title" className="text-2xl font-bold text-pildhora-secondary mb-2">Tu Pastillero Virtual</h2>
            <p className="text-base text-gray-600 mb-8">Este es tu pastillero. El compartimento que se ilumina es el de tu próxima medicina.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                {compartments.map(compNum => {
                    const medsInCompartment = medications.filter(med => med.compartment === compNum);
                    const isNext = nextMedication?.compartment === compNum;
                    
                    return (
                        <div 
                            key={compNum}
                            className={`
                                rounded-3xl transition-all duration-300
                                ${isNext ? 'bg-blue-50 animate-pulse-outline' : 'bg-slate-50'}
                            `}
                        >
                            <div className="p-4 flex flex-col items-center space-y-4 h-full">
                                <div className={`
                                    w-16 h-16 text-white font-bold rounded-full flex items-center justify-center text-4xl shadow-md
                                    ${isNext ? 'bg-pildhora-secondary' : 'bg-slate-400'}
                                `}>
                                    {compNum}
                                </div>
                                <div className="w-full flex-grow space-y-2 text-center min-h-[70px] flex flex-col justify-center">
                                    {medsInCompartment.length > 0 ? (
                                        medsInCompartment.map(med => (
                                            <p key={med.id} className="font-bold text-gray-800 text-lg leading-tight" title={med.name}>
                                                {med.name}
                                            </p>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-base italic">Vacío</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default VisualPillbox;
