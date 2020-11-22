import fs = require('fs');
import path = require('path');
import { paramCase } from "param-case";
import { EventEmitter } from 'events';
import { Logger } from '../logger';
import { ConfigModel } from './config-model';
import { IntegrationReportModel } from './integration-report-model';
import { SmartBridgeModel } from './smart-bridge-model';
import { DeviceType } from '../caseta-connection/smart-bridge-connection';
import { CasetaDeviceModel } from './caseta-device-model';

const invalidTopicCharacterPattern = new RegExp(`[^A-Za-z\d\-~._]`);
const configFilePath = path.join(__dirname, 'data/config.json');
const configFileEncoding = 'utf8';

export class ConfigStorage extends EventEmitter {
  private _config: ConfigModel;
  private _initialLoadPromise: Promise<void>;

  constructor(private _logger: Logger) {
    super();
    this._initialLoadPromise = this._loadFromDiskAsync();
  }

  public getLatestConfigAsync = async () => {
    await this._initialLoadPromise;
    return this._config;
  }

  public deleteSmartBridgeAsync = async (ipAddress: string) => {
    await this._initialLoadPromise;

    const existingSmartBridgeIndex = this._config.smartBridges.findIndex(b => b.ipAddress === ipAddress);
    if (existingSmartBridgeIndex < 0) {
      return;
    }

    this._config.smartBridges.splice(existingSmartBridgeIndex, 1);
    await this._writeToDiskAsync();
    this.emit('update', this._config);
  }

  public addSmartBridgeAsync = async (ipAddress: string, integrationReport: IntegrationReportModel) => {
    await this._initialLoadPromise;

    if (this._config.smartBridges.find(b => b.ipAddress === ipAddress)) {
      throw new Error(`Smart Bridge at '${ipAddress}' already exists.`);
    }

    const newSmartBridge = { ipAddress, devices: [] };

    if (integrationReport) {
      this._parseIntegrationReport(integrationReport, newSmartBridge);
    }

    this._config.smartBridges.push(newSmartBridge);
    await this._writeToDiskAsync();
    this.emit('update', this._config);

    return newSmartBridge;
  }

  public addDeviceAsync = async (ipAddress: string, deviceId: number, deviceType: DeviceType) => {
    await this._initialLoadPromise;

    const smartBridge = this._config.smartBridges.find(b => b.ipAddress === ipAddress);
    if (!smartBridge) {
      throw new Error(`Could not save new device. There is no smart bridge configured at '${ipAddress}'.`);
    }

    if (smartBridge.devices.find(d => d.id === deviceId)) {
      throw new Error(`Could not save new device. There is already a device configured with ID '${deviceId}' for smart bridge '${ipAddress}'.`);
    }

    const newDevice = { id: deviceId, type: deviceType, name: `device-${deviceId}`, room: undefined };
    smartBridge.devices.push(newDevice);
    await this._writeToDiskAsync();
    this.emit('update', this._config);

    return newDevice;
  }

  public modifyDeviceAsync = async (ipAddress: string, deviceId: number, deviceName: string, deviceRoom: string) => {
    await this._initialLoadPromise;

    const smartBridge = this._config.smartBridges.find(b => b.ipAddress === ipAddress);
    if (!smartBridge) {
      throw new Error(`Could not modify device. There is no smart bridge configured at '${ipAddress}'.`);
    }

    const existingDevice = smartBridge.devices.find(d => d.id === deviceId);
    if (!existingDevice) {
      throw new Error(`Could not modify device. There is no device configured with ID '${deviceId}' for smart bridge '${ipAddress}'.`);
    }

    existingDevice.name = deviceName;
    existingDevice.room = deviceRoom || undefined;
    await this._writeToDiskAsync();
    this.emit('update', this._config);
  }

  public modifyMqttAsync = async (host: string, port: number, username: string, password: string, qos: number, retain: boolean) => {
    await this._initialLoadPromise;
    this._config.mqtt = { host, port, username, password, qos, retain };
    await this._writeToDiskAsync();
    this.emit('update', this._config);
  }

  private _writeToDiskAsync = () => new Promise((resolve, reject) => {
    fs.writeFile(configFilePath, JSON.stringify(this._config), configFileEncoding, error=> error ? reject(error) : resolve());
  })

  private _loadFromDiskAsync = async () => {
    const exists = await new Promise<boolean>((resolve, reject) => fs.exists(configFilePath, resolve));
    if (exists) {
      const fileContents = await new Promise<string>((resolve, reject) =>
        fs.readFile(configFilePath, configFileEncoding, (error, data) => error ? reject(error) : resolve(data))
      );
      this._config = JSON.parse(fileContents);
      this._config.smartBridges.forEach(s => s.devices && s.devices.forEach(this._stripInvalidCharacters))
    } else {
      this._config = { smartBridges: [] }
    }
  }

  private _stripInvalidCharacters = (device: CasetaDeviceModel) => {
    device.name = device.name.replace(invalidTopicCharacterPattern, '-');
    if (device.room) {
      device.room = device.room.replace(invalidTopicCharacterPattern, '-');
    }
  }

  private _parseIntegrationReport = (integrationReport: IntegrationReportModel, smartBridge: SmartBridgeModel) => {
    if (!integrationReport.LIPIdList) {
      throw new Error('LIPIdList not found. Invalid integration report.');
    }

    integrationReport.LIPIdList.Devices && integrationReport.LIPIdList.Devices.forEach(device => {
      if (device.ID === 1) {
        return; // Skip device 1, because it's a virtual device used by the smart bridge to manage scenes.
      }

      smartBridge.devices.push({
        id: device.ID,
        type: DeviceType.ButtonOrSensor,
        name: paramCase(device.Name || `device-${device.ID}`),
        room: paramCase(device.Area && device.Area.Name || undefined)
      });
    });

    integrationReport.LIPIdList.Zones && integrationReport.LIPIdList.Zones.forEach(zone => {
      smartBridge.devices.push({
        id: zone.ID,
        type: DeviceType.ControllableDevice,
        name: paramCase(zone.Name || `device-${zone.ID}`),
        room: paramCase(zone.Area && zone.Area.Name || undefined)
      });
    });
  }
}
