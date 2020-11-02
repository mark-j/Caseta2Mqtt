import { EventEmitter } from "events";
import { Duplex } from "stream";
import { Logger } from "../logger";
const Telnet = require("telnet-client");

export enum ConnectionStatus {
  Connecting,
  Connected,
  Failure,
  Closing,
  Closed
}

export enum DeviceType {
  Control = 1,
  State = 2
}

export interface EventModel {
  deviceId: number;
  deviceType: DeviceType;
  property: string;
  value: string | number;
}

export class SmartBridgeConnection extends EventEmitter {
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

  // private _requestDeviceStatus = (deviceId: number, property: string) => {
  //   for (const propertyNumber in this._devicePropertyMap)
  //   if (this._devicePropertyMap[propertyNumber] === property) {
  //     this._telnetShell.write(`?OUTPUT,${deviceId},${propertyNumber}\r\n`, 'utf-8');
  //   }
  // }

  // private _setDeviceLevel = (deviceId: number, property: string, level: number) => {
  //   for (const propertyNumber in this._devicePropertyMap)
  //   if (this._devicePropertyMap[propertyNumber] === property) {
  //     this._telnetShell.write(`#OUTPUT,${deviceId},1,${level}\r\n`, 'utf-8');
  //   }
  // }

  private _sendCommand = (command: string, parameters: any[]) => {
    this._telnetShell.write(`?${command},${parameters.join(',')}\r\n`, 'utf-8');
  }

  private _handleIncomingData = (data: Buffer) => {
    var message = data.toString().trim();
    if (this.status === ConnectionStatus.Connecting && message === 'GNET>') {
      clearTimeout(this._initialPromptTimeout);
      this._updateStatus(ConnectionStatus.Connected);
      setTimeout(this._heartbeat);
      return;
    }

    if (this.status === ConnectionStatus.Connected) {
      this._processMessage(message);
    }
  }

  private _heartbeat = () => {
    if (this.status !== ConnectionStatus.Connected) return;
    this._sendCommand('SYSTEM', [10]);
    setTimeout(this._heartbeat, 5000);
  }

  private _processMessage = (message: string) => {
    this._logger.debug(`${this._ipAddress}: ${message}`)

    const match = /~(?<type>[A-Z]+)(,(?<arguments>.*))+/g.exec(message);
    if (!match) return;

    const messageType = match.groups.type;
    const parameters = match.groups.arguments.split(',');

    if (messageType === 'DEVICE') {
      const deviceId = parseInt(parameters[0]);
      const property = this._getControlName(parseInt(parameters[1]));
      const value = this._getControlValue(parseInt(parameters[2]));
      this.emit('event', { deviceType: DeviceType.Control, deviceId, property, value });
    }

    if (messageType === 'OUTPUT') {
      const deviceId = parseInt(parameters[0]);
      const property = this._getStateName(parseInt(parameters[1]));
      const value = this._getStateValue(parseInt(parameters[1]), parameters[2]);
      this.emit('event', { deviceType: DeviceType.State, deviceId, property, value });
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

  private _getStateName = (number: number) => {
    switch (number) {
      case 1: return 'level';
      case 2: return 'raising';
      case 3: return 'lowering';
      case 4: return 'stop';
      case 8: return 'occupancy';
      default: return `state-${number}`;
    }
  }

  private _getStateValue = (stateNumber: number, rawValue: string) => {
    switch (stateNumber) {
      case 1: return parseFloat(rawValue);
      case 8: return this._getControlValue(parseInt(rawValue));
      default: return rawValue;
    }
  }

  private _getControlName = (number: number) => {
    switch (number) {
      case 2: return 'on';
      case 3: return 'favorite';
      case 4: return 'off';
      case 5: return 'up';
      case 6: return 'down';
      case 8: return 'button-1';
      case 9: return 'button-2';
      case 10: return 'button-3';
      case 11: return 'button-4';
      default: return `control-${number}`;
    }
  }

  private _getControlValue = (number: number) => {
    switch (number) {
      case 3: return 'activated';
      case 4: return 'deactivated';
      default: return `state-${number}`;
    }
  }

}
