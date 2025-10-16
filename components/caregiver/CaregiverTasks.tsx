import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Task, TaskStatus } from '../../types';
import TaskFormModal from './TaskFormModal';

// A single task item component
const TaskItem: React.FC<{ 
    task: Task; 
    onToggleStatus: (task: Task) => void;
    onEdit: (task: Task) => void;
    onDelete: (taskId: string) => void;
}> = ({ task, onToggleStatus, onEdit, onDelete }) => {
    const isDone = task.status === TaskStatus.DONE;
    const isOverdue = !isDone && new Date(task.dueDate) < new Date();

    return (
        <div className={`p-4 rounded-lg shadow-sm flex items-start space-x-4 ${isDone ? 'bg-slate-100' : 'bg-white'}`}>
            <button 
                onClick={() => onToggleStatus(task)}
                className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center ${
                    isDone ? 'bg-pildhora-success border-pildhora-success' : 'border-gray-400'
                }`}
                aria-label={isDone ? 'Marcar como pendiente' : 'Marcar como completada'}
            >
                {isDone && <span className="text-white font-bold">✓</span>}
            </button>
            <div className="flex-grow">
                <p className={`font-bold text-lg ${isDone ? 'line-through text-gray-500' : 'text-gray-800'}`}>{task.title}</p>
                {task.description && <p className={`text-sm ${isDone ? 'text-gray-400' : 'text-gray-600'}`}>{task.description}</p>}
                <div className="mt-2 text-sm flex items-center">
                    <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className={`${isOverdue ? 'text-red-600 font-bold' : isDone ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(task.dueDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    {isOverdue && <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Vencida</span>}
                </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
                <button onClick={() => onEdit(task)} className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200">Editar</button>
                <button onClick={() => onDelete(task.id)} className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-md hover:bg-red-200">Eliminar</button>
            </div>
        </div>
    );
};

// Main component for managing tasks
const CaregiverTasks: React.FC = () => {
    const { tasks, loading, addTask, updateTask, deleteTask } = useData();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const handleOpenForm = (task: Task | null = null) => {
        setSelectedTask(task);
        setIsFormModalOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormModalOpen(false);
        setSelectedTask(null);
    };

    const handleSaveTask = (taskData: Omit<Task, 'id' | 'caregiverId' | 'status'>) => {
        if (selectedTask) {
            updateTask({ 
                ...selectedTask, 
                ...taskData 
            });
        } else {
            addTask(taskData);
        }
        handleCloseForm();
    };
    
    const handleDeleteTask = (taskId: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            deleteTask(taskId);
        }
    };

    const handleToggleStatus = (task: Task) => {
        const newStatus = task.status === TaskStatus.TODO ? TaskStatus.DONE : TaskStatus.TODO;
        updateTask({ ...task, status: newStatus });
    };

    if (loading) {
        return <div className="bg-white p-6 rounded-lg shadow">Cargando tareas...</div>;
    }

    const todoTasks = tasks.filter(t => t.status === TaskStatus.TODO).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    const doneTasks = tasks.filter(t => t.status === TaskStatus.DONE).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Tareas Pendientes</h3>
                <button
                    onClick={() => handleOpenForm()}
                    className="px-4 py-2 bg-pildhora-secondary text-white font-semibold rounded-md hover:bg-blue-800 transition shadow-sm"
                >
                    + Nueva Tarea
                </button>
            </div>

            {tasks.length > 0 ? (
                <div className="space-y-4">
                    <section>
                        <h4 className="text-lg font-semibold text-gray-700 mb-3">Por Hacer ({todoTasks.length})</h4>
                        {todoTasks.length > 0 ? (
                            <div className="space-y-3">
                                {todoTasks.map(task => (
                                    <TaskItem 
                                        key={task.id} 
                                        task={task}
                                        onToggleStatus={handleToggleStatus}
                                        onEdit={handleOpenForm}
                                        onDelete={handleDeleteTask}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">¡No hay tareas pendientes!</p>
                        )}
                    </section>
                    
                    {doneTasks.length > 0 && (
                        <section>
                            <h4 className="text-lg font-semibold text-gray-700 mb-3">Completadas ({doneTasks.length})</h4>
                             <div className="space-y-3">
                                {doneTasks.map(task => (
                                    <TaskItem 
                                        key={task.id} 
                                        task={task}
                                        onToggleStatus={handleToggleStatus}
                                        onEdit={handleOpenForm}
                                        onDelete={handleDeleteTask}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                    No hay tareas asignadas.
                </div>
            )}
            
            <TaskFormModal 
                isOpen={isFormModalOpen}
                onClose={handleCloseForm}
                onSave={handleSaveTask}
                task={selectedTask}
            />
        </div>
    );
};

export default CaregiverTasks;
