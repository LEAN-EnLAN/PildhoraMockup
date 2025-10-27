import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { mockBluetoothService } from '../services/mockBluetoothService';
import { PillboxDevice, PillboxDeviceState, ScanStatus } from '../types';

interface DeviceContextType {
    deviceState: PillboxDeviceState;
    foundDevices: PillboxDevice[];
    scanStatus: ScanStatus;
    connectingDeviceId: string | null;
    isDisconnecting: boolean;
    connectionError: string | null;
    startScan: () => void;
    connectToDevice: (deviceId: string) => Promise<void>;
    disconnectFromDevice: () => void;
    subscribeToCompartmentOpen: (callback: (compartmentId: number) => void) => () => void;
    // For simulation purposes
    _mockOpenCompartment: (compartmentId: number) => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

const initialDeviceState: PillboxDeviceState = {
    isConnected: false,
    batteryLevel: 0,
    device: null,
    compartments: Array.from({ length: 29 }, (_, i) => ({ id: i + 1, isOpen: false })),
};

// Use a simple pub/sub for compartment open events
const compartmentOpenSubscribers = new Set<(compartmentId: number) => void>();

export const DeviceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [deviceState, setDeviceState] = useState<PillboxDeviceState>(initialDeviceState);
    const [foundDevices, setFoundDevices] = useState<PillboxDevice[]>([]);
    const [scanStatus, setScanStatus] = useState<ScanStatus>(ScanStatus.IDLE);
    const [connectingDeviceId, setConnectingDeviceId] = useState<string | null>(null);
    const [isDisconnecting, setIsDisconnecting] = useState<boolean>(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    useEffect(() => {
        mockBluetoothService.init(
            (newState) => {
                setDeviceState(newState);
            },
            (compartmentId) => {
                // Notify all subscribers
                compartmentOpenSubscribers.forEach(callback => callback(compartmentId));
            }
        );
    }, []);
    
    const subscribeToCompartmentOpen = useCallback((callback: (compartmentId: number) => void) => {
        compartmentOpenSubscribers.add(callback);
        // Return an unsubscribe function
        return () => {
            compartmentOpenSubscribers.delete(callback);
        };
    }, []);


    const startScan = useCallback(async () => {
        setScanStatus(ScanStatus.SCANNING);
        setConnectionError(null); // Clear previous errors on new scan
        setFoundDevices([]);
        const devices = await mockBluetoothService.scanForDevices();
        setFoundDevices(devices);
        setScanStatus(ScanStatus.FINISHED);
    }, []);

    const connectToDevice = useCallback(async (deviceId: string) => {
        setConnectionError(null);
        setConnectingDeviceId(deviceId);
        try {
            await mockBluetoothService.connect(deviceId);
        } catch (error) {
            console.error(`Failed to connect to device ${deviceId}`, error);
            setConnectionError(error instanceof Error ? error.message : 'No se pudo conectar. Intente de nuevo.');
        } finally {
            setConnectingDeviceId(null);
        }
    }, []);

    const disconnectFromDevice = useCallback(() => {
        setIsDisconnecting(true);
        // Simulate disconnect delay for visual feedback
        setTimeout(() => {
            mockBluetoothService.disconnect();
            setIsDisconnecting(false);
        }, 1000);
    }, []);


    // For simulation
    const _mockOpenCompartment = (compartmentId: number) => {
        mockBluetoothService.mockOpenCompartment(compartmentId);
    };

    return (
        <DeviceContext.Provider
            value={{
                deviceState,
                foundDevices,
                scanStatus,
                connectingDeviceId,
                isDisconnecting,
                connectionError,
                startScan,
                connectToDevice,
                disconnectFromDevice,
                subscribeToCompartmentOpen,
                _mockOpenCompartment,
            }}
        >
            {children}
        </DeviceContext.Provider>
    );
};

export const useDevice = () => {
    const context = useContext(DeviceContext);
    if (context === undefined) {
        throw new Error('useDevice must be used within a DeviceProvider');
    }
    return context;
};