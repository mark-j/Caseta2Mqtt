import { createServer } from "net";
import { Aedes, AedesPublishPacket, Client, Subscription } from "aedes";
import e = require("express");
import { cli } from "cypress";

const getAedes = require('aedes');
const getPort = require('get-port');

export class MockMqttBroker {
    private _recordedMessages: {[topic: string]: string} = {};
    private _clientSubscribed = false;

    public static StartAsync(): Promise<MockMqttBroker> {
        return new Promise<MockMqttBroker>((resolve, reject) => {
            const aedes = getAedes();
            const server = createServer(aedes.handle);
            getPort().then(port => {
                server.listen(port, () => resolve(new MockMqttBroker(port, aedes)));
            });
        });
    }

    private constructor(public port: number, private _aedes: Aedes) {
        _aedes.on('publish', this._recordMqttMessage);
        _aedes.on('subscribe', this._recordSubscriptions);
    }

    public waitForMessageAsync = (topic: string, message: string) => new Promise<boolean>((resolve, reject) => {
        const startTime = new Date().getTime();
        const poller = () => {
            if (this._recordedMessages[topic] === message) {
                resolve(true);
            } else if ((new Date().getTime() - startTime) < 1000) {
                setTimeout(poller, 10);
            } else {
                resolve(false);
            }
        };

        poller();
    })

    public waitForClient = () => new Promise<boolean>((resolve, reject) => {
        const startTime = new Date().getTime();
        const poller = () => {
            if (this._clientSubscribed) {
                resolve(true);
            } else if ((new Date().getTime() - startTime) < 1000) {
                setTimeout(poller, 100);
            } else {
                resolve(false);
            }
        };

        poller();
    })

    private _recordMqttMessage = (packet: AedesPublishPacket, client: Client) => {
        this._recordedMessages[packet.topic] = packet.payload.toString();
    }

    private _recordSubscriptions = (subscriptions: Subscription[], client: Client) => {
        if (subscriptions.some(s => s.topic.indexOf('caseta') >= 0)) {
            this._clientSubscribed = true;
        }
    }
}