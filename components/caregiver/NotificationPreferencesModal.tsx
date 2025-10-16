
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { NotificationPreferences } from '../../types';

interface NotificationPreferencesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({ isOpen, onClose }) => {
    const { notificationPreferences, updateNotificationPreferences } = useData();
    const [prefs, setPrefs] = useState<NotificationPreferences>(notificationPreferences);

    useEffect(() => {
        setPrefs(notificationPreferences);
    }, [notificationPreferences, isOpen]);

    const handleToggle = (key: keyof NotificationPreferences) => {
        setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        updateNotificationPreferences(prefs);
        onClose();
    };
    
    const handleCancel = () => {
        setPrefs(notificationPreferences); // Reset changes
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Configurar Notificaciones</h3>
                
                <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                        <div>
                            <p className="font-semibold text-gray-700">Dosis Omitida</p>
                            <p className="text-sm text-gray-500">Recibir alerta si se omite una dosis.</p>
                        </div>
                        <input 
                            type="checkbox" 
                            className="toggle-checkbox"
                            checked={prefs.missedDose}
                            onChange={() => handleToggle('missedDose')}
                        />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                         <div>
                            <p className="font-semibold text-gray-700">Dosis Tomada</p>
                            <p className="text-sm text-gray-500">Recibir confirmación cuando se toma una dosis.</p>
                        </div>
                        <input 
                            type="checkbox" 
                            className="toggle-checkbox"
                            checked={prefs.doseTaken}
                            onChange={() => handleToggle('doseTaken')}
                        />
                    </label>
                     <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                         <div>
                            <p className="font-semibold text-gray-700">Stock Bajo</p>
                            <p className="text-sm text-gray-500">Recibir alerta cuando queden pocas medicinas.</p>
                        </div>
                        <input 
                            type="checkbox" 
                            className="toggle-checkbox"
                            checked={prefs.lowStock}
                            onChange={() => handleToggle('lowStock')}
                        />
                    </label>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-pildhora-secondary text-white font-semibold rounded-md hover:bg-blue-800"
                    >
                        Guardar Cambios
                    </button>
                </div>
            </div>
             {/* Simple styles for the toggle switch */}
            <style>{`
                .toggle-checkbox {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 48px;
                    height: 28px;
                    background-color: #cbd5e1;
                    border-radius: 9999px;
                    position: relative;
                    cursor: pointer;
                    transition: background-color 0.2s ease-in-out;
                }
                .toggle-checkbox::before {
                    content: '';
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background-color: white;
                    top: 4px;
                    left: 4px;
                    transition: transform 0.2s ease-in-out;
                }
                .toggle-checkbox:checked {
                    background-color: #3b82f6; /* pildhora-secondary */
                }
                .toggle-checkbox:checked::before {
                    transform: translateX(20px);
                }
            `}</style>
        </div>
    );
};

export default NotificationPreferencesModal;
