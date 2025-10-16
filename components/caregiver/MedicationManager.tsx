import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Medication } from '../../types';
import MedicationFormModal from './MedicationFormModal';
import InstructionGenerator from './InstructionGenerator';

const MedicationItem: React.FC<{ 
    med: Medication; 
    onEdit: (med: Medication) => void;
    onDelete: (medId: string) => void;
    onGenerateInstructions: (medName: string) => void;
}> = ({ med, onEdit, onDelete, onGenerateInstructions }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex-grow">
            <p className="font-bold text-lg text-gray-800">{med.name} <span className="text-sm font-normal text-gray-500">({med.dosage})</span></p>
            <p className="text-sm text-gray-600">
                Stock: <span className="font-semibold">{med.stock}</span> | 
                Aviso en: <span className="font-semibold">{med.refillReminderStockLevel}</span> |
                Pastillero: <span className="font-semibold">#{med.compartment}</span>
            </p>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
            <button 
                onClick={() => onGenerateInstructions(med.name)}
                className="px-3 py-1 text-xs font-semibold text-pildhora-primary bg-pildhora-primary/10 rounded-md hover:bg-pildhora-primary/20"
                title="Generar instrucciones con IA"
            >
                Instrucciones
            </button>
             <button 
                onClick={() => onEdit(med)}
                className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200"
            >
                Editar
            </button>
            <button 
                onClick={() => onDelete(med.id)}
                className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-md hover:bg-red-200"
            >
                Eliminar
            </button>
        </div>
    </div>
);


const MedicationManager: React.FC = () => {
    const { medications, loading, addMedication, updateMedication, deleteMedication } = useData();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);
    const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
    const [medicationNameToGenerate, setMedicationNameToGenerate] = useState('');

    const handleOpenForm = (med: Medication | null = null) => {
        setSelectedMed(med);
        setIsFormModalOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormModalOpen(false);
        setSelectedMed(null);
    };
    
    const handleSaveMedication = (medData: Omit<Medication, 'id' | 'patientId'>) => {
        if(selectedMed) {
            updateMedication({ ...medData, id: selectedMed.id, patientId: selectedMed.patientId });
        } else {
            addMedication(medData);
        }
        handleCloseForm();
    };
    
    const handleDeleteMedication = (medId: string) => {
        if(window.confirm('¿Estás seguro de que quieres eliminar este medicamento?')) {
            deleteMedication(medId);
        }
    };
    
    const handleGenerateInstructions = (medName: string) => {
        setMedicationNameToGenerate(medName);
        setIsInstructionModalOpen(true);
    }
    
    const handleCloseInstructions = () => {
        setIsInstructionModalOpen(false);
        setMedicationNameToGenerate('');
    }

    if (loading) {
        return <div className="bg-white p-6 rounded-lg shadow">Cargando medicamentos...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Gestionar Medicamentos</h3>
                <button
                    onClick={() => handleOpenForm()}
                    className="px-4 py-2 bg-pildhora-secondary text-white font-semibold rounded-md hover:bg-blue-800 transition shadow-sm"
                >
                    + Añadir Medicamento
                </button>
            </div>

            {medications.length > 0 ? (
                <div className="space-y-3">
                    {medications.map(med => (
                        <MedicationItem 
                            key={med.id} 
                            med={med}
                            onEdit={handleOpenForm}
                            onDelete={handleDeleteMedication}
                            onGenerateInstructions={handleGenerateInstructions}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                    No hay medicamentos configurados.
                </div>
            )}
            
            <MedicationFormModal 
                isOpen={isFormModalOpen}
                onClose={handleCloseForm}
                onSave={handleSaveMedication}
                medication={selectedMed}
            />
            
            <InstructionGenerator
                isOpen={isInstructionModalOpen}
                onClose={handleCloseInstructions}
                medicationName={medicationNameToGenerate}
            />
        </div>
    );
};

export default MedicationManager;
