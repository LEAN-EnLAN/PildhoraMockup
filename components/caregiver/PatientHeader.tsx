
import React from 'react';

// In a real app, this would come from context or props
const patientName = 'Elena Rodríguez';

const PatientHeader: React.FC = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-500">Monitoreando a:</h2>
            <p className="text-3xl font-bold text-gray-800">{patientName}</p>
        </div>
    );
};

export default PatientHeader;
