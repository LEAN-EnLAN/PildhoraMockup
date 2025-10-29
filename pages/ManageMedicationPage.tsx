



import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Medication, DayOfWeek } from '../types';
import { useData } from '../context/DataContext';

const doseForms = ['Sólido', 'Líquido'] as const;
type DoseForm = typeof doseForms[number];

const doseUnits = {
    'Sólido': ['mg', 'g'],
    'Líquido': ['ml']
} as const;
type DoseUnit = 'mg' | 'ml' | 'g';

const doseFormIcons: Record<DoseForm, string> = {
    'Sólido': 'pill',
    'Líquido': 'water_drop',
};

const doseUnitIcons: Record<DoseUnit, string> = {
    'mg': 'science',
    'g': 'science',
    'ml': 'water_drop'
};

const daysOfWeek: { label: string, value: DayOfWeek }[] = [
    { label: 'L', value: 'mon' },
    { label: 'M', value: 'tue' },
    { label: 'X', value: 'wed' },
    { label: 'J', value: 'thu' },
    { label: 'V', value: 'fri' },
    { label: 'S', value: 'sat' },
    { label: 'D', value: 'sun' },
];


const ManageMedicationPage: React.FC = () => {
    const navigate = useNavigate();
    const { medicationId } = useParams<{ medicationId?: string }>();
    const { medications, addMedication, updateMedication, deleteMedication, loading } = useData();
    const isEditMode = Boolean(medicationId);

    const [name, setName] = useState('');
    const [doseForm, setDoseForm] = useState<DoseForm>('Sólido');
    const [doseUnit, setDoseUnit] = useState<DoseUnit>('mg');
    const [doseQuantity, setDoseQuantity] = useState(1);
    const [frequency, setFrequency] = useState('Diariamente');
    const [times, setTimes] = useState<string[]>(['09:00']);
    const [selectedDays, setSelectedDays] = useState<Set<DayOfWeek>>(new Set());

    useEffect(() => {
        if (isEditMode && medications.length > 0) {
            const medToEdit = medications.find(m => m.id === medicationId);
            if (medToEdit) {
                setName(medToEdit.name);
                
                // Parse dosage, gracefully handling old formats
                const dosageMatch = medToEdit.dosage.match(/(\d*\.?\d+)\s*(\w+)/);
                if (dosageMatch) {
                    const quantity = parseFloat(dosageMatch[1]) || 1;
                    const unitStr = dosageMatch[2].toLowerCase();
    
                    if (unitStr === 'mg' || unitStr === 'g' || unitStr.includes('pastilla')) {
                        setDoseForm('Sólido');
                        setDoseUnit(unitStr === 'g' ? 'g' : 'mg');
                        setDoseQuantity(quantity);
                    } else if (unitStr === 'ml' || unitStr.includes('gota')) {
                        setDoseForm('Líquido');
                        setDoseUnit('ml');
                        setDoseQuantity(quantity);
                    } else {
                        // Default for unknown units to prevent crashes
                        setDoseForm('Sólido');
                        setDoseUnit('mg');
                        setDoseQuantity(1);
                    }
                } else {
                    // Default if regex doesn't match
                    setDoseQuantity(1);
                    setDoseUnit('mg');
                    setDoseForm('Sólido');
                }

                setFrequency(medToEdit.schedule?.frequency || 'Diariamente');
                setTimes(medToEdit.schedule?.times || ['09:00']);

                if (medToEdit.schedule?.frequency === 'Días específicos de la semana' && medToEdit.schedule.days) {
                    setSelectedDays(new Set(medToEdit.schedule.days));
                } else {
                    setSelectedDays(new Set());
                }
            }
        } else {
            // Reset state for 'new' mode, especially when navigating from an edit page
            setName('');
            setDoseForm('Sólido');
            setDoseUnit('mg');
            setDoseQuantity(1);
            setFrequency('Diariamente');
            setTimes(['09:00']);
            setSelectedDays(new Set());
        }
    }, [medicationId, medications, isEditMode]);
    
    const handleQuantityChange = (delta: number) => {
        setDoseQuantity(q => Math.max(0, q + delta));
    };

    const handleTimeChange = (index: number, value: string) => {
        const newTimes = [...times];
        newTimes[index] = value;
        setTimes(newTimes);
    };

    const addTime = () => setTimes([...times, '21:00']);
    const removeTime = (index: number) => {
        if (times.length > 1) {
            setTimes(times.filter((_, i) => i !== index));
        }
    };

    const handleDayToggle = (day: DayOfWeek) => {
        setSelectedDays(prev => {
            const newDays = new Set(prev);
            if (newDays.has(day)) {
                newDays.delete(day);
            } else {
                newDays.add(day);
            }
            return newDays;
        });
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('El nombre del medicamento es obligatorio.');
            return;
        }
        if (frequency === 'Días específicos de la semana' && selectedDays.size === 0) {
            alert('Por favor, seleccione al menos un día de la semana.');
            return;
        }

        const medData: Omit<Medication, 'id' | 'patientId'> = {
            name,
            dosage: `${doseQuantity} ${doseUnit}`,
            schedule: {
                frequency: frequency as any,
                times,
                days: frequency === 'Días específicos de la semana' ? Array.from(selectedDays) : undefined,
            },
            // Keeping these as default values for this simplified form
            stock: 50,
            refillReminderStockLevel: 10,
            compartment: 1,
            refillDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        };
        
        try {
            if(isEditMode && medicationId) {
                const medToUpdate = medications.find(m => m.id === medicationId);
                if (medToUpdate) {
                    await updateMedication({ ...medToUpdate, ...medData });
                }
            } else {
                await addMedication(medData);
            }
            navigate('/caregiver');
        } catch (error) {
            console.error("Failed to save medication", error);
            alert("Error al guardar el medicamento.");
        }
    };

    const handleDelete = async () => {
        if (isEditMode && medicationId && window.confirm(`¿Estás seguro de que quieres eliminar "${name}"?`)) {
            try {
                await deleteMedication(medicationId);
                navigate('/caregiver');
            } catch (error) {
                console.error("Failed to delete medication", error);
                alert("Error al eliminar el medicamento.");
            }
        }
    }

    if (loading && isEditMode) {
        return <div className="flex items-center justify-center h-screen">Cargando...</div>
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            <header className="flex items-center bg-slate-50 p-4 pb-2 justify-between sticky top-0 z-10 border-b border-slate-200">
                <button onClick={() => navigate(-1)} className="text-gray-800 flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-slate-900 text-lg font-bold flex-1 text-center">{isEditMode ? 'Editar Medicamento' : 'Añadir Medicamento'}</h1>
                <div className="w-12"></div>
            </header>

            <main className="flex-1 pb-40 px-4">
                <form id="medication-form" onSubmit={handleSubmit}>
                    {/* Section 1: Medication Name */}
                    <section className="pt-6">
                        <h2 className="text-slate-900 text-lg font-bold pb-2">¿Qué medicamento es?</h2>
                        <div className="py-3">
                            <label>
                                <p className="text-slate-600 text-base font-medium pb-2">Nombre del medicamento</p>
                                <input value={name} onChange={e => setName(e.target.value)} className="form-input flex w-full rounded-lg text-slate-900 border border-slate-300 bg-white h-14 p-4 text-base" placeholder="Ej: Paracetamol" />
                            </label>
                        </div>
                    </section>
                    
                    {/* Section 2: Dosage */}
                    <section className="pt-6">
                        <h2 className="text-slate-900 text-lg font-bold pb-2">¿Cuál es la dosis?</h2>
                        
                        <div className="py-3">
                            <p className="text-slate-600 text-base font-medium pb-2">Forma del medicamento</p>
                            <div className="grid grid-cols-2 gap-3">
                                {doseForms.map(form => (
                                    <button
                                        key={form}
                                        type="button"
                                        onClick={() => {
                                            setDoseForm(form);
                                            setDoseUnit(doseUnits[form][0] as DoseUnit);
                                        }}
                                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 font-semibold transition-all ${doseForm === form ? 'border-pildhora-secondary bg-pildhora-secondary/20 text-pildhora-secondary' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}
                                    >
                                        <span className="material-symbols-outlined !text-lg">{doseFormIcons[form]}</span> <span>{form}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="py-3">
                            <p className="text-slate-600 text-base font-medium pb-2">Unidad de medida</p>
                            <div className="flex flex-row gap-3">
                                {doseUnits[doseForm].map(unit => (
                                    <button
                                        key={unit}
                                        type="button"
                                        onClick={() => setDoseUnit(unit as DoseUnit)}
                                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 font-semibold transition-all flex-1 ${doseUnit === unit ? 'border-pildhora-secondary bg-pildhora-secondary/20 text-pildhora-secondary' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}
                                    >
                                        <span className="material-symbols-outlined !text-lg">{doseUnitIcons[unit as DoseUnit]}</span> <span>{unit}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="py-3">
                            <label>
                                <p className="text-slate-600 text-base font-medium pb-2">Cantidad</p>
                                <div className="relative flex items-center">
                                    <input type="number" value={doseQuantity} onChange={e => setDoseQuantity(parseInt(e.target.value, 10))} className="form-input text-center w-full rounded-lg text-slate-900 border border-slate-300 bg-white h-14 p-4 text-base" placeholder="Ej: 2" />
                                    <div className="absolute right-4 flex items-center gap-2">
                                        <button type="button" onClick={() => handleQuantityChange(-1)} className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors">-</button>
                                        <button type="button" onClick={() => handleQuantityChange(1)} className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors">+</button>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </section>

                    {/* Section 3: Frequency */}
                    <section className="pt-6">
                        <h2 className="text-slate-900 text-lg font-bold pb-2">¿Con qué frecuencia?</h2>
                        <div className="py-3">
                            <label>
                                <p className="text-slate-600 text-base font-medium pb-2">Frecuencia</p>
                                <div className="relative">
                                    <select value={frequency} onChange={e => setFrequency(e.target.value)} className="form-select w-full appearance-none rounded-lg border border-slate-300 bg-white h-14 p-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pildhora-secondary/50 text-base">
                                        <option>Diariamente</option>
                                        <option>Cada 8 horas</option>
                                        <option>Cada 12 horas</option>
                                        <option>Días específicos de la semana</option>
                                        <option>Según sea necesario</option>
                                    </select>
                                    <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">expand_more</span>
                                </div>
                            </label>
                        </div>

                        {frequency === 'Días específicos de la semana' && (
                            <div className="py-3">
                                <p className="text-slate-600 text-base font-medium pb-2">Días de la semana</p>
                                <div className="grid grid-cols-7 gap-2">
                                    {daysOfWeek.map(day => (
                                        <button
                                            key={day.value}
                                            type="button"
                                            onClick={() => handleDayToggle(day.value)}
                                            className={`flex items-center justify-center h-10 w-10 rounded-full font-bold transition-colors ${selectedDays.has(day.value) ? 'bg-pildhora-secondary text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Section 4: Time */}
                    <section className="pt-6">
                        <h2 className="text-slate-900 text-lg font-bold pb-2">¿A qué hora(s)?</h2>
                        <div className="py-3 space-y-4">
                            {times.map((time, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="relative flex-1">
                                        <input type="time" value={time} onChange={e => handleTimeChange(index, e.target.value)} className="form-input w-full rounded-lg border border-slate-300 bg-white h-14 p-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pildhora-secondary/50 text-base" />
                                    </div>
                                    <button type="button" onClick={() => removeTime(index)} className="flex size-10 items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10 transition-colors">
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={addTime} className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 py-3 text-slate-600 font-medium hover:border-pildhora-secondary hover:text-pildhora-secondary transition-colors">
                                <span className="material-symbols-outlined">add</span>
                                <span>Añadir otra hora</span>
                            </button>
                        </div>
                    </section>
                </form>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm p-4 border-t border-slate-200">
                <div className="flex flex-col gap-3">
                    <button form="medication-form" type="submit" className="w-full rounded-full bg-pildhora-primary py-4 px-6 text-center font-bold text-white transition-transform duration-200 hover:scale-105 active:scale-95">
                        {isEditMode ? 'Actualizar Medicamento' : 'Guardar Medicamento'}
                    </button>
                    {isEditMode && (
                        <button type="button" onClick={handleDelete} className="w-full rounded-full py-4 px-6 text-center font-bold text-red-500 transition-colors hover:bg-red-500/10 active:bg-red-500/20">
                            Eliminar Medicamento
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
};

export default ManageMedicationPage;