import { SmartBridgeModel } from "./smart-bridge-model";
export interface ConfigModel {
  smartBridges: SmartBridgeModel[];
  mqtt?: {
    host: string,
    port: number,
    username: string,
    password: string,
    qos: number,
    retain: boolean
  };
}
