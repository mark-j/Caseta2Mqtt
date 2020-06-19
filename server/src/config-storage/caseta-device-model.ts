import { DeviceType } from "../caseta-connection/smart-bridge-connection";

export interface CasetaDeviceModel {
  id: number;
  type: DeviceType;
  name: string;
  room: string;
}
