
import React, { useState, useEffect } from 'react';
import { generateSimpleInstructions } from '../../services/geminiService';

interface InstructionGeneratorProps {
    isOpen: boolean;
    onClose: () => void;
    medicationName: string;
}

const InstructionGenerator: React.FC<InstructionGeneratorProps> = ({ isOpen, onClose, medicationName }) => {
    const [instructions, setInstructions] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && medicationName) {
            const fetchInstructions = async () => {
                setLoading(true);
                setError('');
                setInstructions('');
                try {
                    const result = await generateSimpleInstructions(medicationName);
                    setInstructions(result);
                } catch (err) {
                    setError('Error al generar instrucciones. Intente de nuevo.');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchInstructions();
        }
    }, [isOpen, medicationName]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-start">
                     <div>
                        <h3 className="text-xl font-bold text-gray-800">Instrucciones Simplificadas</h3>
                        <p className="text-pildhora-secondary font-semibold">{medicationName}</p>
                    </div>
                     <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
                </div>
               
                <div className="mt-6 min-h-[150px] bg-slate-50 p-4 rounded-md">
                    {loading && (
                         <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pildhora-secondary"></div>
                            <p className="mt-3 text-gray-600">Generando con IA...</p>
                        </div>
                    )}
                    {error && <p className="text-red-600 text-center">{error}</p>}
                    {instructions && (
                        <div className="whitespace-pre-wrap text-gray-700 text-lg leading-relaxed">
                            {instructions}
                        </div>
                    )}
                </div>
                
                 <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-pildhora-secondary text-white font-semibold rounded-md hover:bg-blue-800"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstructionGenerator;