import { EventEmitter } from "events";
import { Duplex } from "stream";
import { Logger } from "../logger";
import { Mapper } from "./mapper";
const Telnet = require("telnet-client");

export enum ConnectionStatus {
  Connecting,
  Connected,
  Failure,
  Closing,
  Closed
}

export enum DeviceType {
  ButtonOrSensor = 1,
  ControllableDevice = 2
}

export interface EventModel {
  deviceId: number;
  deviceType: DeviceType;
  property: string;
  value: string | number;
}

export class SmartBridgeConnection extends EventEmitter {
  private mapper = new Mapper();
  private _telnetConnection = new Telnet();
  private _telnetShell: Duplex;
  private _initialPromptTimeout = null;

  public status = ConnectionStatus.Connecting;

  constructor(private _ipAddress: string, private _logger: Logger) {
    super();
    this._telnetConnection.on('end', this._handleConnectionDropAsync);
    this._telnetConnection.on('close', this._handleConnectionDropAsync);
    this._telnetConnection.on('error', this._handleErrorAsync);
    setTimeout(this._initiateConnectionAsync);
  }

  public pingDeviceAsync = async (deviceId: number) => {
    this._telnetShell.write(`?OUTPUT,${deviceId},1\r\n`, 'utf-8');
  }

  public sendDeviceCommand = (deviceId: number, property: string, value: string) => {
    const attributeNumber = this.mapper.getDeviceAttributeNumber(property);
    const encodedValue = this.mapper.encodeDeviceAttributeValue(attributeNumber, value);
    this._telnetShell.write(`#OUTPUT,${deviceId},${attributeNumber},${encodedValue}\r\n`, 'utf-8');
  }

  public closeAsync = async () => {
    this._updateStatus(ConnectionStatus.Closing);
    await this._swallowErrorsAsync(async () => await this._telnetConnection.end());
    await this._swallowErrorsAsync(async () => await this._telnetConnection.destroy());
    this._updateStatus(ConnectionStatus.Closed);
  }

  private _initiateConnectionAsync = async () => {
    const config = {
      host: this._ipAddress,
      port: 23,
      username: 'lutron',
      password: 'integration',
      timeout: 60000,
      negotiationMandatory: false
    };

    this._updateStatus(ConnectionStatus.Connecting);

    try {
      await this._telnetConnection.connect(config)
      if (this.status !== ConnectionStatus.Connecting) return;

      this._telnetShell = await this._telnetConnection.shell();
      if (this.status !== ConnectionStatus.Connecting) return;

      this._telnetShell.on('data', this._handleIncomingData);
    } catch(error) {
      this._handleErrorAsync(error);
      return;
    }

    this._initialPromptTimeout = setTimeout(() => {
      this._handleErrorAsync(new Error('Did not receive expected response from Smart Bridge.'));
    }, 60000);
  }

  private _handleIncomingData = (data: Buffer) => {
    var message = data.toString().trim();
    if (this.status === ConnectionStatus.Connecting && message === 'GNET>') {
      clearTimeout(this._initialPromptTimeout);
      this._updateStatus(ConnectionStatus.Connected);
      return;
    }

    if (this.status === ConnectionStatus.Connected) {
      this._processMessage(message);
    }
  }

  private _processMessage = (message: string) => {
    this._logger.debug(`${this._ipAddress}: ${message}`)

    const match = /~(?<type>[A-Z]+)(,(?<arguments>.*))+/g.exec(message);
    if (!match) return;

    const messageType = match.groups.type;
    const parameters = match.groups.arguments.split(',');

    if (messageType === 'DEVICE') {
      const deviceId = parseInt(parameters[0]);
      const property = this.mapper.getButtonOrSensorName(parseInt(parameters[1]));
      const value = this.mapper.parseButtonOrSensorValue(parseInt(parameters[2]));
      this.emit('event', { deviceType: DeviceType.ButtonOrSensor, deviceId, property, value });
    }

    if (messageType === 'OUTPUT') {
      const deviceId = parseInt(parameters[0]);
      const property = this.mapper.getDeviceAttributeName(parseInt(parameters[1]));
      const value = this.mapper.parseDeviceAttributeNumber(parseInt(parameters[1]), parameters[2]);
      this.emit('event', { deviceType: DeviceType.ControllableDevice, deviceId, property, value });
    }

    if (messageType === 'ERROR') {
      this.emit('error', message);
    }
  }

  private _updateStatus = (newStatus: ConnectionStatus) => {
    this.status = newStatus;
    this.emit('status', newStatus);
  }

  private _handleConnectionDropAsync = async () => {
    if (this.status === ConnectionStatus.Connecting || this.status === ConnectionStatus.Connected) {
      await this._handleErrorAsync(new Error('Connection dropped unexpectedly.'));
    }
  }

  private _handleErrorAsync = async (error: Error) => {
    if (this.status === ConnectionStatus.Failure) return;
    this._updateStatus(ConnectionStatus.Failure);
    await this._swallowErrorsAsync(async () => await this._telnetConnection.end());
    await this._swallowErrorsAsync(async () => await this._telnetConnection.destroy());
    this.emit('error', error);
  }

  private _swallowErrorsAsync = async (func: { (): Promise<any>; }) => {
    try {
      await func();
    } catch {
      // gulp
    }
  }

}
