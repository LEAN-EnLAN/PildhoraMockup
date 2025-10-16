import React, { useState, useEffect } from 'react';
import { Medication } from '../../types';

interface MedicationFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (medData: Omit<Medication, 'id' | 'patientId'>) => void;
    medication: Medication | null;
}

// Fix: Define a specific type for the form state with refillDueDate as a string
// to ensure type safety for the date input field.
interface MedicationFormData {
    name: string;
    dosage: string;
    stock: number;
    refillReminderStockLevel: number;
    compartment: number;
    refillDueDate: string;
}

const initialFormState: MedicationFormData = {
    name: '',
    dosage: '',
    stock: 0,
    refillReminderStockLevel: 0,
    compartment: 1,
    refillDueDate: '',
};

const MedicationFormModal: React.FC<MedicationFormModalProps> = ({ isOpen, onClose, onSave, medication }) => {
    const [formData, setFormData] = useState<MedicationFormData>(initialFormState);
    const [errors, setErrors] = useState<{ name?: string; dosage?: string }>({});

    useEffect(() => {
        if (isOpen) {
            if (medication) {
                // Fix: Explicitly map medication properties to form data to avoid state pollution
                // and ensure `refillDueDate` is always a string in 'YYYY-MM-DD' format.
                setFormData({
                    name: medication.name,
                    dosage: medication.dosage,
                    stock: medication.stock,
                    refillReminderStockLevel: medication.refillReminderStockLevel,
                    compartment: medication.compartment,
                    refillDueDate: medication.refillDueDate ? new Date(medication.refillDueDate).toISOString().split('T')[0] : '',
                });
            } else {
                setFormData(initialFormState);
            }
            setErrors({}); // Reset errors when modal opens or medication changes
        }
    }, [medication, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let { name, value } = e.target;

        // Auto-capitalize the first letter of the medication name
        if (name === 'name') {
            value = value.charAt(0).toUpperCase() + value.slice(1);
        }

        setFormData(prev => ({
            ...prev,
            [name]: e.target.type === 'number' ? parseInt(value, 10) || 0 : value,
        }));
        
        // Clear the error for the field being edited to provide real-time feedback
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: { name?: string; dosage?: string } = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'El nombre del medicamento es obligatorio.';
        }

        // Regex to check for at least one digit and at least one common unit
        const dosageRegex = /(?=.*\d)(?=.*(mg|g|ml|iu|pastilla|tableta|cucharada))/i;
        if (!formData.dosage.trim()) {
            newErrors.dosage = 'La dosis es obligatoria.';
        } else if (!dosageRegex.test(formData.dosage)) {
            newErrors.dosage = 'La dosis debe incluir un número y una unidad (ej. 10mg, 1 pastilla).';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSave(formData);
        }
    };

    if (!isOpen) return null;

    const inputClasses = "mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-pildhora-secondary focus:border-pildhora-secondary";
    const labelClasses = "block text-sm font-medium text-gray-700";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                <form onSubmit={handleSubmit} noValidate>
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">{medication ? 'Editar' : 'Nuevo'} Medicamento</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className={labelClasses}>Nombre del Medicamento</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={inputClasses} required />
                            {errors.name && <p className="text-pildhora-error text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="dosage" className={labelClasses}>Dosis (ej. 10mg, 1 pastilla)</label>
                            <input type="text" name="dosage" id="dosage" value={formData.dosage} onChange={handleChange} className={inputClasses} required />
                            {errors.dosage && <p className="text-pildhora-error text-xs mt-1">{errors.dosage}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="stock" className={labelClasses}>Stock actual</label>
                                <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} className={inputClasses} min="0" />
                            </div>
                            <div>
                                <label htmlFor="refillReminderStockLevel" className={labelClasses}>Aviso de stock bajo</label>
                                <input type="number" name="refillReminderStockLevel" id="refillReminderStockLevel" value={formData.refillReminderStockLevel} onChange={handleChange} className={inputClasses} min="0" />
                            </div>
                        </div>
                         <div>
                            <label htmlFor="refillDueDate" className={labelClasses}>Fecha de Reposición (Opcional)</label>
                            <input type="date" name="refillDueDate" id="refillDueDate" value={formData.refillDueDate} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div>
                            <label htmlFor="compartment" className={labelClasses}>Compartimento (1-4)</label>
                            <input type="number" name="compartment" id="compartment" value={formData.compartment} onChange={handleChange} className={inputClasses} min="1" max="4" required />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-pildhora-secondary rounded-full hover:bg-pildhora-secondary/10">
                            Cancelar
                        </button>
                        <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-pildhora-secondary rounded-full hover:bg-blue-800 shadow-sm">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MedicationFormModal;