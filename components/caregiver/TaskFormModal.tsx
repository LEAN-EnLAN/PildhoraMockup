
import React, { useState, useEffect } from 'react';
import { Task } from '../../types';

interface TaskFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (taskData: Omit<Task, 'id' | 'caregiverId' | 'status'>) => void;
    task: Task | null;
}

const getIsoDate = (date: Date) => date.toISOString().split('T')[0];

const initialFormState = {
    title: '',
    description: '',
    dueDate: getIsoDate(new Date(Date.now() + 24 * 60 * 60 * 1000)), // Default to tomorrow
};

const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, onSave, task }) => {
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title,
                description: task.description,
                dueDate: getIsoDate(new Date(task.dueDate)),
            });
        } else {
            setFormData(initialFormState);
        }
    }, [task, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.dueDate) {
            alert('Por favor, complete el título y la fecha de vencimiento.');
            return;
        }
        // Add time to the date to avoid timezone issues where it might be the previous day
        const [year, month, day] = formData.dueDate.split('-').map(Number);
        const dueDate = new Date(year, month - 1, day, 12, 0, 0); // Set to midday
        
        onSave({ ...formData, dueDate });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <h3 className="text-xl font-bold text-gray-800 mb-6">{task ? 'Editar' : 'Nueva'} Tarea</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
                            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pildhora-secondary focus:border-pildhora-secondary" required />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
                            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pildhora-secondary focus:border-pildhora-secondary"></textarea>
                        </div>
                         <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Fecha de Vencimiento</label>
                            <input type="date" name="dueDate" id="dueDate" value={formData.dueDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pildhora-secondary focus:border-pildhora-secondary" required />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">
                            Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 bg-pildhora-secondary text-white font-semibold rounded-md hover:bg-blue-800">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskFormModal;
