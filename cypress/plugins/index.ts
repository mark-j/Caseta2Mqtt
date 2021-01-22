/// <reference types="cypress" />

import { MockMqttBroker } from "./mock-mqtt-broker";
import { MockSmartBridge } from "./mock-smart-bridge";

const startMockBroker = MockMqttBroker.StartAsync();
const startMockBridge = MockSmartBridge.StartAsync();

module.exports = (on, config) => {

  on('task', {

    async startMocks() {
      const mqttBroker = await startMockBroker;
      const smartBridge = await startMockBridge;
      return { mqttPort: mqttBroker.port, smartBridgePort: smartBridge.port };
    },

    async waitForConnections() {
      const mqttBroker = await startMockBroker;
      const smartBridge = await startMockBridge;
      const brokerConnected = await mqttBroker.waitForClient();
      const bridgeConnected = await smartBridge.waitForClient();
      return brokerConnected && bridgeConnected;
    },

    async triggerSmartBridgeMessage(data) {
      const smartBridge = await startMockBridge;
      smartBridge.sendToClients(data.content);
      return null;
    },

    async checkMqttValue(data) {
      const broker = await startMockBroker;
      return await broker.waitForMessageAsync(data.topic, data.message);
    }

  });

}
