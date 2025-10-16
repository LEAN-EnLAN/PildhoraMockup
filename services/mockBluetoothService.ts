import { PillboxDevice, PillboxDeviceState } from '../types';

class MockBluetoothService {
    private state: PillboxDeviceState = {
        isConnected: false,
        batteryLevel: 0,
        device: null,
        compartments: [
            { id: 1, isOpen: false },
            { id: 2, isOpen: false },
            { id: 3, isOpen: false },
            { id: 4, isOpen: false },
        ],
    };

    private onStateChange: ((newState: PillboxDeviceState) => void) | null = null;
    private onCompartmentOpen: ((compartmentId: number) => void) | null = null;
    private batteryInterval: number | null = null;

    init(
        onStateChange: (newState: PillboxDeviceState) => void,
        onCompartmentOpen: (compartmentId: number) => void
    ) {
        this.onStateChange = onStateChange;
        this.onCompartmentOpen = onCompartmentOpen;
    }

    private updateState(updates: Partial<PillboxDeviceState>) {
        this.state = { ...this.state, ...updates };
        if (this.onStateChange) {
            this.onStateChange(JSON.parse(JSON.stringify(this.state)));
        }
    }

    scanForDevices(): Promise<PillboxDevice[]> {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    { id: 'pildhora-001', name: 'Pastillero de Elena' },
                    { id: 'pildhora-002', name: 'Pastillero PILDHORA v2' },
                ]);
            }, 2000); // Simulate 2-second scan
        });
    }

    connect(deviceId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.state.isConnected) {
                reject(new Error("Already connected to a device."));
                return;
            }
            setTimeout(() => {
                const device: PillboxDevice = { id: deviceId, name: `Pastillero (${deviceId.slice(-4)})` };
                this.updateState({
                    isConnected: true,
                    device: device,
                    batteryLevel: 95,
                });
                
                // Simulate battery drain
                this.batteryInterval = window.setInterval(() => {
                    if (this.state.batteryLevel > 0) {
                        this.updateState({ batteryLevel: this.state.batteryLevel - 1 });
                    } else {
                        if (this.batteryInterval) clearInterval(this.batteryInterval);
                        this.disconnect();
                    }
                }, 60000); // Drain 1% every minute

                resolve();
            }, 1500); // Simulate connection time
        });
    }

    disconnect() {
        if (this.batteryInterval) {
            clearInterval(this.batteryInterval);
            this.batteryInterval = null;
        }
        this.updateState({
            isConnected: false,
            device: null,
            batteryLevel: 0,
        });
    }

    // This is called from the UI to simulate the patient opening a compartment
    mockOpenCompartment(compartmentId: number) {
        if (!this.state.isConnected) {
            console.warn("Cannot open compartment, device is not connected.");
            return;
        }
        if (this.onCompartmentOpen) {
            this.onCompartmentOpen(compartmentId);
        }
        // Simulate the door closing after a bit
        const updatedCompartments = this.state.compartments.map(c => 
            c.id === compartmentId ? { ...c, isOpen: true } : c
        );
        this.updateState({ compartments: updatedCompartments });

        setTimeout(() => {
             const closedCompartments = this.state.compartments.map(c => 
                c.id === compartmentId ? { ...c, isOpen: false } : c
            );
            this.updateState({ compartments: closedCompartments });
        }, 3000);
    }
}

export const mockBluetoothService = new MockBluetoothService();
