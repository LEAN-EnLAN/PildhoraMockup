import React from 'react';
import { useDevice } from '../../context/DeviceContext';
import { ScanStatus, PillboxDevice } from '../../types';

const BatteryIcon: React.FC<{ level: number }> = ({ level }) => {
    const getBatteryPaths = () => {
        if (level > 80) return <path d="M15 6.67V17.33a1.33 1.33 0 01-1.33 1.34H6.33A1.33 1.33 0 015 17.33V6.67h10z" fill="#4CAF50" />;
        if (level > 40) return <path d="M15 12v5.33a1.33 1.33 0 01-1.33 1.34H6.33A1.33 1.33 0 015 17.33V12h10z" fill="#FFC107" />;
        if (level > 15) return <path d="M15 14.67v2.66a1.33 1.33 0 01-1.33 1.34H6.33A1.33 1.33 0 015 17.33v-2.66h10z" fill="#FF9800" />;
        return <path d="M15 16v1.33a1.33 1.33 0 01-1.33 1.34H6.33A1.33 1.33 0 015 17.33V16h10z" fill="#F44336" />;
    };
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2-1a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5z" clipRule="evenodd" fill="#6B7280" />
            <path d="M8.33 3H11.67C12.22 3 12.67 3.45 12.67 4V5H7.33V4C7.33 3.45 7.78 3 8.33 3z" fill="#6B7280" />
            {getBatteryPaths()}
        </svg>
    );
};


const DeviceManager: React.FC = () => {
    const { 
        deviceState, 
        foundDevices, 
        scanStatus, 
        startScan, 
        connectToDevice, 
        disconnectFromDevice,
        _mockOpenCompartment 
    } = useDevice();
    const { isConnected, device, batteryLevel } = deviceState;

    const renderScanView = () => (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h3 className="text-xl font-bold text-gray-800">Conectar Pastillero</h3>
            <p className="text-gray-600">Busca el pastillero PILDHORA para vincularlo a la cuenta del paciente y habilitar el registro automático de tomas.</p>
            <button
                onClick={startScan}
                disabled={scanStatus === ScanStatus.SCANNING}
                className="w-full px-4 py-3 text-lg font-semibold text-white bg-pildhora-secondary rounded-xl hover:bg-blue-800 disabled:bg-gray-400 transition"
            >
                {scanStatus === ScanStatus.SCANNING ? 'Buscando...' : 'Buscar Dispositivos'}
            </button>
            {scanStatus === ScanStatus.SCANNING && (
                 <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pildhora-secondary"></div>
                </div>
            )}
            {scanStatus === ScanStatus.FINISHED && (
                <div className="space-y-3 pt-4">
                    <h4 className="font-semibold text-gray-700">Dispositivos Encontrados:</h4>
                    {foundDevices.length > 0 ? (
                        foundDevices.map((dev: PillboxDevice) => (
                            <div key={dev.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                                <p className="font-semibold text-gray-700">{dev.name}</p>
                                <button
                                    onClick={() => connectToDevice(dev.id)}
                                    className="px-3 py-1 text-sm font-semibold text-white bg-pildhora-primary rounded-md hover:bg-green-700"
                                >
                                    Conectar
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500">No se encontraron dispositivos. Asegúrate de que el pastillero esté encendido y cerca.</p>
                    )}
                </div>
            )}
        </div>
    );
    
    const renderConnectedView = () => (
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
            <div>
                 <h3 className="text-xl font-bold text-gray-800">Pastillero Conectado</h3>
                 <p className="text-pildhora-success font-semibold">El dispositivo está vinculado y funcionando.</p>
            </div>
           
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600">Dispositivo:</span>
                    <span className="font-bold text-gray-800">{device?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600">Nivel de Batería:</span>
                    <div className="flex items-center space-x-2">
                        <BatteryIcon level={batteryLevel} />
                        <span className="font-bold text-gray-800">{batteryLevel}%</span>
                    </div>
                </div>
            </div>

            <button
                onClick={disconnectFromDevice}
                className="w-full px-4 py-2 text-md font-semibold text-pildhora-error-dark bg-red-100 rounded-xl hover:bg-red-200 transition"
            >
                Desvincular Dispositivo
            </button>
        </div>
    );

    const renderSimulationView = () => (
        <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg shadow mt-6">
            <h4 className="font-bold text-yellow-800">Panel de Simulación</h4>
            <p className="text-sm text-yellow-700 mb-3">Usa estos botones para simular que el paciente abre un compartimento del pastillero físico.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(id => (
                    <button
                        key={id}
                        onClick={() => _mockOpenCompartment(id)}
                        disabled={!isConnected}
                        className="px-3 py-2 font-semibold bg-yellow-400 text-yellow-900 rounded-md hover:bg-yellow-500 disabled:bg-gray-300 disabled:text-gray-500"
                    >
                        Abrir #{id}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {isConnected ? renderConnectedView() : renderScanView()}
            {renderSimulationView()}
        </div>
    );
};

export default DeviceManager;
