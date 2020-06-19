import { CasetaDeviceModel } from "./caseta-device-model";

export interface SmartBridgeModel {
  ipAddress: string;
  devices: CasetaDeviceModel[];
}


