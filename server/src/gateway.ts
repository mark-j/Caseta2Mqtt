import { Logger } from "./logger";
import { ConfigStorage } from "./config-storage/config-storage";
import { ConnectionPump } from "./caseta-connection/connection-pump";
import { SmartBridgeModel } from "./config-storage/smart-bridge-model";
import { ConfigModel } from "./config-storage/config-model";
import { EventModel } from "./caseta-connection/smart-bridge-connection";
import { QoS, AsyncMqttClient, connectAsync } from "async-mqtt";

export class Gateway {
  private _mqttClient: AsyncMqttClient;
  private _lastTopicValues: { [topic: string] : string; } = {};
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
    const config = await this._configStorage.getLatestConfigAsync();
    await this._initializeBrokerAsync(config);
    config.smartBridges.forEach(this._startPump);
    this._logger.info('Gateway started');
  }

  private _initializeBrokerAsync = async (config: ConfigModel) => {
    if (!config.mqtt || !config.mqtt.host || !config.mqtt.port) {
      return;
    }

    if (this._mqttClient) {
      this._mqttClient.end();
    }

    this._lastTopicValues = {};
    this._mqttClient = await connectAsync(`${config.mqtt.host}:${config.mqtt.port}`, {
      username: config.mqtt.username,
      password: config.mqtt.password
    });
  }

  private _processEventAsync = async (event: EventModel, smartBridge: SmartBridgeModel) => {
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

    if (!config.mqtt || !this._mqttClient) {
      return;
    }

    const messageBody = event.value.toString();
    const messageTopic = device.room
      ? `casetas/${device.room}/${device.name}/${event.property}`
      : `casetas/${device.name}/${event.property}`;

    if (this._lastTopicValues[messageTopic] === messageBody) {
      this._logger.debug(`Not broadcasting, because ${event.property} was already set to ${event.value} on ${deviceDescription} previously.`);
      return;
    }

    this._logger.trace(`MQTT broadcast: ${messageTopic} = ${messageBody}`);

    this._lastTopicValues[messageTopic] = messageBody;
    this._mqttClient.publish(messageTopic, messageBody, {
      qos: <QoS>config.mqtt.qos,
      retain: config.mqtt.retain
    });
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
