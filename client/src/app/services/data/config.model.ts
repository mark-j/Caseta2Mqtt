import { SmartBridgeModel } from './smart-bridge.model';
import { MqttSettingsModel } from './mqtt-settings.model';

export interface ConfigModel {
  smartBridges: SmartBridgeModel[];
  mqtt: MqttSettingsModel;
}
