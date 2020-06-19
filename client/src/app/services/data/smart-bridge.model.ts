import { DeviceModel } from './device.model';

export interface SmartBridgeModel {
  ipAddress: string;
  devices: DeviceModel[];
}


