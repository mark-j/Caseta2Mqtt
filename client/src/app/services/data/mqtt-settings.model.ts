export interface MqttSettingsModel {
  host: string;
  port: number;
  username: string;
  password: string;
  qos: number;
  retain: boolean;
}
