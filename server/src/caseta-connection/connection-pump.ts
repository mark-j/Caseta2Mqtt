import { Logger } from "../logger";
import { SmartBridgeConnection, ConnectionStatus, DeviceType, EventModel } from "./smart-bridge-connection";
import { SmartBridgeModel } from "../config-storage/smart-bridge-model";
import { EventEmitter } from "events";
const PumpIntervalMilliseconds = 1000;
const HeartbeatIntervalMilliseconds = 5000;

export class ConnectionPump extends EventEmitter {
  private _cancellationToken: { signalled: boolean } = { signalled: false };
  private _activeConnection: SmartBridgeConnection;
  private _lastHeartbeatDeviceId: number;
  private _cachedValues: { [deviceId: number]: string | number; } = { };

  constructor(public smartBridge: SmartBridgeModel, private _logger: Logger) {
    super();
  }

  updateConfig = (updatedConfig: SmartBridgeModel) => {
    if (updatedConfig.ipAddress !== this.smartBridge.ipAddress) {
      throw new Error(`The specified config (${updatedConfig.ipAddress}) doesn't match the current config (${this.smartBridge.ipAddress})`);
    }

    this.smartBridge = updatedConfig;
  }

  start = () => {
    this._cancellationToken = { signalled: false };
    setTimeout(() => this._pumpAsync(this._cancellationToken), PumpIntervalMilliseconds);
    setTimeout(() => this._heartbeatAsync(this._cancellationToken), HeartbeatIntervalMilliseconds);
  }

  stop = () => {
    this._cancellationToken.signalled = true;
  }

  private _heartbeatAsync = async (cancellationToken: { signalled: boolean }) => {
    if (cancellationToken.signalled) {
      return;
    }

    const deviceIds = this.smartBridge.devices && this.smartBridge.devices
      .filter(d => d.type === DeviceType.State)
      .map(d => d.id)
      .sort((a, b) => a - b)
      || [];

    if (deviceIds.length === 0 || !this._activeConnection || this._activeConnection.status !== ConnectionStatus.Connected) {
      setTimeout(() => this._heartbeatAsync(cancellationToken), HeartbeatIntervalMilliseconds);
      return;
    }

    const nextDeviceIdToCheck = !this._lastHeartbeatDeviceId || this._lastHeartbeatDeviceId < deviceIds[0] || this._lastHeartbeatDeviceId >= deviceIds[deviceIds.length - 1]
      ? deviceIds[0]
      : deviceIds[deviceIds.indexOf(this._lastHeartbeatDeviceId) + 1];

    await this._activeConnection.pingDeviceAsync(nextDeviceIdToCheck);

    this._lastHeartbeatDeviceId = nextDeviceIdToCheck;

    setTimeout(() => this._heartbeatAsync(cancellationToken), HeartbeatIntervalMilliseconds);
  }

  private _pumpAsync = async (cancellationToken: { signalled: boolean }) => {
    this._activeConnection = this._activeConnection || this._createNewConnection();
    const isHealthy = this._activeConnection.status === ConnectionStatus.Connected || this._activeConnection.status === ConnectionStatus.Connecting;

    if (!isHealthy) {
      await this._safeCloseConnectionAsync();
    }

    if (cancellationToken.signalled) {
      await this._safeCloseConnectionAsync();
      return;
    }

    setTimeout(() => this._pumpAsync(cancellationToken), PumpIntervalMilliseconds);
  }

  private _createNewConnection = () => {
    const newConnection = new SmartBridgeConnection(this.smartBridge.ipAddress);
    newConnection.on('error', error => this._logger.error(`${this.smartBridge.ipAddress} - ${error}`));
    newConnection.on('status', status => this._logger.info(`${this.smartBridge.ipAddress} - ${ConnectionStatus[status]}`));
    newConnection.on('event', event => this._updateValueFromEvent(event));
    return newConnection;
  }

  private _updateValueFromEvent = (event: EventModel) => {
    if (this._cachedValues[event.deviceId] == event.value) {
      return;
    }

    this._cachedValues[event.deviceId] = event.value;
    this.emit('event', event);
  }

  private _safeCloseConnectionAsync = async () => {
    if (!this._activeConnection) return;

    const isClosedOrClosing = this._activeConnection.status === ConnectionStatus.Closed || this._activeConnection.status == ConnectionStatus.Closing;

    try {
      if (!isClosedOrClosing) {
        await this._activeConnection.closeAsync();
      }
    } finally {
      this._activeConnection = undefined;
    }
  }
}
