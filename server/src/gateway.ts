import { Logger } from "./logger";
import { ConfigStorage } from "./config-storage/config-storage";
import { ConnectionPump } from "./caseta-connection/connection-pump";
import { SmartBridgeModel } from "./config-storage/smart-bridge-model";
import { ConfigModel } from "./config-storage/config-model";
import { EventModel } from "./caseta-connection/smart-bridge-connection";
import { MqttConnection } from "./mqtt-connection/mqtt-connection";
import { MessageModel } from "./mqtt-connection/message-model";

export class Gateway {
  private _mqttConnection: MqttConnection;
  private _activeCasetaPumps: ConnectionPump[] = [];
  private _running = false;

  constructor(private _configStorage: ConfigStorage, private _logger: Logger) {
    _configStorage.on('update', this._handleConfigUpdate);
  }

  start = () => {
    this._running = true;
    this._startAsync();
  }

  stop = () => {
    this._running = false;
    this._activeCasetaPumps.forEach(p => p.stop());
    this._activeCasetaPumps = [];
    this._logger.info('Gateway stopped');
  }

  private _startAsync = async () => {
    try {
      const config = await this._configStorage.getLatestConfigAsync();
      await this._initializeBrokerAsync(config);
      config.smartBridges.forEach(this._startPump);
      this._logger.info('Gateway started');
    } catch (error) {
      this._running = false;
      this._logger.error('Failed to start gateway', error);
    }
  }

  private _initializeBrokerAsync = async (config: ConfigModel) => {
    if (!config.mqtt || !config.mqtt.host || !config.mqtt.port) {
      return;
    }

    if (this._mqttConnection) {
      this._mqttConnection.dispose();
    }

    this._mqttConnection = new MqttConnection(config, this._logger);
    this._mqttConnection.on('message', this._processMessage)
  }

  private _processMessage = (message: MessageModel) => {
    try {
      this._activeCasetaPumps.forEach(pump => pump.smartBridge.devices && pump.smartBridge.devices.forEach(device => {
        if (device.name === message.deviceName && device.room == message.roomName) {
          pump.sendDeviceCommand(device.id, message.propertyName, message.payload)
        }
      }));
    } catch (error) {
      this._logger.error('Failure processing message', error);
    }
  }

  private _processEventAsync = async (event: EventModel, smartBridge: SmartBridgeModel) => {
    try {
      const config = await this._configStorage.getLatestConfigAsync();

      let device = smartBridge.devices.find(d => d.id === event.deviceId);
      if (!device) {
        device = await this._configStorage.addDeviceAsync(smartBridge.ipAddress, event.deviceId, event.deviceType);
      }

      let deviceDescription = event.deviceId.toString();
      if (device) {
        deviceDescription += device.room
          ? ` (${device.room}/${device.name})`
          : ` (${device.name})`;
      }

      this._logger.trace(`Device ${deviceDescription} updated: ${event.property} = ${event.value}`);

      if (!config.mqtt || !this._mqttConnection) {
        return;
      }

      this._mqttConnection.publish({
        deviceName: device.name,
        roomName: device.room,
        propertyName: event.property,
        payload: event.value.toString()
      })

    } catch (error) {
      this._logger.error('Failure processing event', error);
    }
  }

  private _startPump = (smartBridge: SmartBridgeModel) => {
    const pump = new ConnectionPump(smartBridge, this._logger);
    pump.on('event', event => this._processEventAsync(event, smartBridge));
    this._activeCasetaPumps.push(pump);
    pump.start();
  }

  private _handleConfigUpdate = (config: ConfigModel) => {
    if (!this._running) return;

    this._initializeBrokerAsync(config);

    config.smartBridges.forEach(smartBridge => {
      const runningPump = this._activeCasetaPumps.find(p => p.smartBridge.ipAddress === smartBridge.ipAddress);
      if (runningPump) {
        runningPump.smartBridge = smartBridge;
      } else {
        this._startPump(smartBridge);
      }
    });

    [...this._activeCasetaPumps].forEach((pump) => {
      if (!config.smartBridges.find(b => b.ipAddress === pump.smartBridge.ipAddress)) {
        pump.stop();
        this._activeCasetaPumps.splice(this._activeCasetaPumps.indexOf(pump), 1);
      }
    });
  }

}
