import React, { useState } from 'react';
import { IntakeRecord } from '../../types';

interface NextMedicationCardProps {
    medication: IntakeRecord;
    onTake: (record: IntakeRecord) => void;
    onSkip: (record: IntakeRecord) => void;
}

const NextMedicationCard: React.FC<NextMedicationCardProps> = ({ medication, onTake, onSkip }) => {
    const [showSkipConfirm, setShowSkipConfirm] = useState(false);

    const handleConfirmSkip = () => {
        onSkip(medication);
        setShowSkipConfirm(false);
    };

    return (
        <>
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
                        onClick={() => setShowSkipConfirm(true)}
                        className="w-full py-5 text-2xl font-bold text-gray-700 transition-transform transform bg-gray-200 rounded-2xl hover:bg-gray-300 active:scale-95"
                    >
                        Omitir
                    </button>
                </div>
            </div>

            {showSkipConfirm && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" 
                    role="dialog" 
                    aria-modal="true" 
                    aria-labelledby="skip-confirm-title"
                >
                    <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 w-full max-w-md text-center animate-fade-in-up">
                        <h2 id="skip-confirm-title" className="text-2xl font-bold text-gray-800">¿Estás seguro de que quieres omitir tu dosis?</h2>
                        
                        <div className="text-left space-y-4 my-6 text-gray-600">
                            <div className="flex items-start">
                                <svg className="w-6 h-6 mr-3 mt-0.5 text-pildhora-warning flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                <p>Esta acción será <span className="font-semibold">notificada a tu cuidador.</span></p>
                            </div>
                             <div className="flex items-start">
                                <svg className="w-6 h-6 mr-3 mt-0.5 text-pildhora-error-dark flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                <p>Hacer esto en contra del tratamiento recetado podría <span className="font-semibold">ponerte en riesgo.</span></p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => setShowSkipConfirm(false)}
                                className="w-full py-4 text-xl font-bold text-gray-700 bg-gray-200 rounded-2xl hover:bg-gray-300 active:scale-95 transition-transform"
                            >
                                No, Volver
                            </button>
                            <button
                                onClick={handleConfirmSkip}
                                className="w-full py-4 text-xl font-bold text-white bg-pildhora-error-dark rounded-2xl hover:bg-red-700 active:scale-95 transition-transform"
                            >
                                Sí, Omitir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NextMedicationCard;