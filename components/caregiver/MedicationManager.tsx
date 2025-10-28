
import React from 'react';
import { useData } from '../../context/DataContext';
import { Medication, IntakeRecord } from '../../types';
import { useNavigate } from 'react-router-dom';

interface Alarm extends IntakeRecord {
    medication: Medication;
}

const AlarmItem: React.FC<{ 
    alarm: Alarm; 
    onEdit: (medId: string) => void;
    onDelete: (medId: string) => void;
}> = ({ alarm, onEdit, onDelete }) => (
     <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
        <div className="text-pildhora-secondary flex items-center justify-center rounded-lg bg-pildhora-secondary/20 shrink-0 size-12">
            <span className="material-symbols-outlined">alarm</span>
        </div>
        <div className="flex-grow">
            <p className="text-gray-800 text-lg font-medium leading-normal">{alarm.scheduledTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="text-gray-500 text-sm font-normal leading-normal">{alarm.medicationName}, {alarm.dosage}</p>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => onEdit(alarm.medicationId)} className="p-2 text-gray-500 hover:text-pildhora-secondary"><span className="material-symbols-outlined">edit</span></button>
            <button onClick={() => onDelete(alarm.medicationId)} className="p-2 text-gray-500 hover:text-red-500"><span className="material-symbols-outlined">delete</span></button>
        </div>
    </div>
);


const MedicationManager: React.FC = () => {
    const { medications, intakeHistory, loading, deleteMedication } = useData();
    const navigate = useNavigate();

    const alarms = React.useMemo(() => {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        const todaysIntake = intakeHistory.filter(r => {
             const recordDate = new Date(r.scheduledTime);
             return recordDate >= startOfToday && recordDate.toDateString() === today.toDateString();
        });

        const alarmList: Alarm[] = todaysIntake.map(intake => {
            const medication = medications.find(m => m.id === intake.medicationId);
            return { ...intake, medication: medication! };
        }).filter(a => a.medication); // Filter out any intakes with no matching med

        return {
            morning: alarmList.filter(a => a.scheduledTime.getHours() < 12).sort((a,b) => a.scheduledTime.getTime() - b.scheduledTime.getTime()),
            afternoon: alarmList.filter(a => a.scheduledTime.getHours() >= 12 && a.scheduledTime.getHours() < 18).sort((a,b) => a.scheduledTime.getTime() - b.scheduledTime.getTime()),
            evening: alarmList.filter(a => a.scheduledTime.getHours() >= 18).sort((a,b) => a.scheduledTime.getTime() - b.scheduledTime.getTime()),
        }

    }, [intakeHistory, medications]);

    const handleEdit = (medId: string) => {
        navigate(`/caregiver/medication/${medId}`);
    };

    const handleAddNew = () => {
        navigate('/caregiver/medication/new');
    };
    
    const handleDeleteMedication = (medId: string) => {
        const med = medications.find(m => m.id === medId);
        if(window.confirm(`¿Estás seguro de que quieres eliminar "${med?.name}" y todas sus alarmas?`)) {
            deleteMedication(medId);
        }
    };

    if (loading) {
        return <div className="bg-white p-6 rounded-lg shadow">Cargando alarmas...</div>;
    }
    
    const allAlarms = [...alarms.morning, ...alarms.afternoon, ...alarms.evening];

    return (
        <div className="space-y-6 pb-20">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Alarmas de Medicación</h3>
            </div>
            
            {allAlarms.length === 0 ? (
                 <div className="flex flex-col items-center justify-center text-center p-10 bg-white rounded-lg shadow-sm">
                    <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">notifications_off</span>
                    <p className="text-lg font-medium text-gray-700">No hay alarmas programadas.</p>
                    <p className="text-gray-500">Toca el '+' para añadir tu primera medicina.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {alarms.morning.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-gray-700">Mañana</h3>
                            <div className="flex flex-col gap-4">
                                {alarms.morning.map(alarm => <AlarmItem key={alarm.id} alarm={alarm} onEdit={handleEdit} onDelete={handleDeleteMedication} />)}
                            </div>
                        </div>
                    )}
                     {alarms.afternoon.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-gray-700">Tarde</h3>
                            <div className="flex flex-col gap-4">
                                {alarms.afternoon.map(alarm => <AlarmItem key={alarm.id} alarm={alarm} onEdit={handleEdit} onDelete={handleDeleteMedication} />)}
                            </div>
                        </div>
                    )}
                     {alarms.evening.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-gray-700">Noche</h3>
                            <div className="flex flex-col gap-4">
                                {alarms.evening.map(alarm => <AlarmItem key={alarm.id} alarm={alarm} onEdit={handleEdit} onDelete={handleDeleteMedication} />)}
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            <div className="fixed bottom-24 right-6">
                <button 
                    onClick={handleAddNew}
                    className="flex items-center justify-center rounded-full h-16 w-16 bg-pildhora-warning text-white shadow-lg hover:bg-amber-500 transition-colors"
                >
                    <span className="material-symbols-outlined text-4xl">add</span>
                </button>
            </div>
        </div>
    );
};

export default MedicationManager;