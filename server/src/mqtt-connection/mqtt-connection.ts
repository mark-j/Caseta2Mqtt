import { AsyncMqttClient, connectAsync, Packet, QoS } from "async-mqtt";
import { EventEmitter } from "events";
import { ConfigModel } from "../config-storage/config-model";
import { Logger } from "../logger";
import { MessageModel } from "./message-model";

const mqttTopicPattern = new RegExp(`^casetas/((?<room>[A-Za-z\\d\\-~._]+)/)?(?<name>[A-Za-z\\d\\-~._]+)/(?<property>[A-Za-z\\d\\-~._]+)/set$`);

enum ConnectionState {
    Initializing,
    Connecting,
    Connected,
    Failed,
    Disposed
}

export class MqttConnection extends EventEmitter {
    private _state: ConnectionState;
    private _mqttClient: AsyncMqttClient;
    private _pendingMessages: MessageModel[];

    constructor(private _config: ConfigModel, private _logger: Logger) {
        super();
        this._state = ConnectionState.Initializing;
        this._checkConnection();
    }

    public publish = (message: MessageModel) => {
        if (this._state === ConnectionState.Connecting) {
            this._pendingMessages.push(message);
            return;
        }

        if (this._state !== ConnectionState.Connected) {
            return;
        }

        const messageBody = message.payload.toString();
        const messageTopic = message.roomName
          ? `casetas/${message.roomName}/${message.deviceName}/${message.propertyName}`
          : `casetas/${message.deviceName}/${message.propertyName}`;

        const options = {
            qos: <QoS>this._config.mqtt.qos,
            retain: this._config.mqtt.retain
        };

        this._mqttClient.publish(messageTopic, messageBody, options)
            .then(() => this._logger.trace(`Successfully published message ${messageTopic} = ${messageBody}`))
            .catch(error => this._logger.error(`Failure publishing message ${messageTopic} = ${messageBody}`, error));
    }

    public dispose = () => {
        this._state = ConnectionState.Disposed;
    }

    private _processMessageAsync = async (topic: string, payload: Buffer, packet: Packet) => {
        try {
            const value = payload.toString();
            this._logger.trace(`MQTT received: ${topic} = ${value}`)

            const match = mqttTopicPattern.exec(topic);
            if (!match || !match.groups) {
                this._logger.debug(`Ignoring message on topic: ${topic}`);
                return;
            }

            const message: MessageModel = {
                deviceName: match.groups.name,
                roomName: match.groups.room,
                propertyName: match.groups.property,
                payload: value.trim()
            }

            this.emit('message', message);

        } catch (error) {
            this._logger.error('Failure processing message', error);
        }
    }

    private _checkConnection = () => {
        if (this._state === ConnectionState.Disposed && this._mqttClient) {
            this._logger.info(`Disconnecting from MQTT broker`);
            this._mqttClient.end();
            this._mqttClient = null;
            return;
        }

        if (this._state === ConnectionState.Initializing || this._state === ConnectionState.Failed) {
            this._attemptConnection();
        }

        setTimeout(() => this._checkConnection(), 5000);
    }

    private _attemptConnection = () => {
        this._state = ConnectionState.Connecting;
        this._pendingMessages = [];
        const url = `${this._config.mqtt.host}:${this._config.mqtt.port}`;
        const options = { username: this._config.mqtt.username, password: this._config.mqtt.password };

        this._logger.info(`Connecting to MQTT broker at ${url}`);

        connectAsync(url, options)
            .then(client => {
                if (this._state === ConnectionState.Disposed) {
                    this._logger.info(`Disconnecting from MQTT broker at ${url}`);
                    client.end();
                    return;
                }

                this._mqttClient = client;
                client.on('error', (error: Error) => this._logger.error('MQTT connection error', error));
                client.on('message', this._processMessageAsync);
                client.subscribe('casetas/+/+/+/set');
                client.subscribe('casetas/+/+/+/+/set');
                this._state = ConnectionState.Connected;
                this._logger.info(`Successfully connected to MQTT broker at ${url}`);
                this._pendingMessages.forEach(this.publish);
            })
            .catch(error => {
                this._state = ConnectionState.Failed;
                this._logger.error(`Failed to connect to MQTT broker at ${url}`, error);
            });
    }
}