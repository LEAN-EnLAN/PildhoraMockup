import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { IntakeStatus, IntakeRecord } from '../../types';


const StatusIcon: React.FC<{ status: IntakeStatus }> = ({ status }) => {
    switch (status) {
        case IntakeStatus.TAKEN:
            return <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold" aria-label="Tomada">✓</div>;
        case IntakeStatus.MISSED:
            return <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold" aria-label="Omitida">!</div>;
        case IntakeStatus.PENDING:
        default:
            return <div className="w-8 h-8 rounded-full bg-gray-200" aria-label="Pendiente"></div>;
    }
};

// Fix: Add BluetoothIcon component definition to resolve reference error.
const BluetoothIcon: React.FC = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-4 h-4 text-blue-500 ml-1" 
        viewBox="0 0 20 20" 
        fill="currentColor"
        aria-label="Tomada con pastillero"
    >
      <title>Tomada con pastillero</title>
      <path fillRule="evenodd" d="M4.902 4.098a.75.75 0 011.06 0l4.25 4.25v-3.5a.75.75 0 011.5 0v8.5a.75.75 0 01-1.5 0v-3.5L5.962 15.9a.75.75 0 01-1.06-1.06L9.152 10 4.902 5.158a.75.75 0 010-1.06zM11.77 10.53a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06l4.25-4.25a.75.75 0 011.06 0zM10 8.811l4.25-4.25a.75.75 0 111.06 1.06L10.53 10l4.78 4.78a.75.75 0 11-1.06 1.06L10 11.189v3.561a.75.75 0 01-1.5 0V5.25a.75.75 0 011.5 0v3.561z" clipRule="evenodd" />
    </svg>
);

const HistoryItem: React.FC<{ record: IntakeRecord }> = ({ record }) => (
    <div className="bg-white p-4 rounded-lg flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
            <StatusIcon status={record.status} />
            <div>
                <p className="font-bold text-lg text-gray-800">{record.medicationName}</p>
                <p className="text-sm text-gray-500">{record.dosage}</p>
            </div>
        </div>
        <div className="text-right">
            <p className="text-lg font-bold text-pildhora-secondary">{record.scheduledTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
            <div className="flex items-center justify-end">
                <span className={`text-sm font-semibold ${
                    record.status === IntakeStatus.TAKEN ? 'text-green-600' :
                    record.status === IntakeStatus.MISSED ? 'text-red-600' : 'text-gray-500'
                }`}>
                    {record.status === IntakeStatus.TAKEN ? 'Tomada' : record.status === IntakeStatus.MISSED ? 'Omitida' : 'Pendiente'}
                </span>
                 {record.method === 'bluetooth' && <BluetoothIcon />}
            </div>
        </div>
    </div>
);

const IntakeHistory: React.FC = () => {
    const { intakeHistory, loading } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());

    const filteredHistory = useMemo(() => {
        return intakeHistory
            .filter(record => {
                const recordDate = record.scheduledTime;
                return recordDate.getFullYear() === selectedDate.getFullYear() &&
                       recordDate.getMonth() === selectedDate.getMonth() &&
                       recordDate.getDate() === selectedDate.getDate();
            })
            .filter(record => 
                record.medicationName.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
    }, [intakeHistory, searchTerm, selectedDate]);
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = new Date(e.target.value);
        // Adjust for timezone offset
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        setSelectedDate(new Date(date.getTime() + userTimezoneOffset));
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow">
                <p>Cargando historial...</p>
            </div>
        );
    }
    
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Historial de Tomas</h3>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        placeholder="Buscar medicamento..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-100 text-gray-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pildhora-secondary shadow-sm"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
                <input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={handleDateChange}
                    className="px-4 py-2 bg-slate-100 text-gray-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pildhora-secondary shadow-sm"
                />
            </div>
            
            {filteredHistory.length > 0 ? (
                 <div className="space-y-3">
                    {filteredHistory.map(record => <HistoryItem key={record.id} record={record} />)}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500">No hay tomas registradas para esta fecha o búsqueda.</p>
                </div>
            )}
        </div>
    );
};

export default IntakeHistory;