context('MQTT Config Tests', () => {

    beforeEach(() => {
        cy.visit('http://localhost:4600');
    });

    it('Happy path smoke test', () => {
        let mocks;
        cy.task('startMocks')
            .then(m => (mocks = m) && cy.fixture('integration-report.json'))
            .then(integrationReport => {
                cy.get('button#edit-mqtt-settings').click();
                cy.get('form#mqtt-settings-form').should('be.visible');
                cy.get('input#mqtt-host').clear().type('mqtt://localhost');
                cy.get('input#mqtt-port').clear().type(mocks.mqttPort.toString());
                cy.get('button#save-mqtt-settings').click();
        
                cy.request('/api/config').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('mqtt');
                    expect(response.body.mqtt).to.have.property('host', 'mqtt://localhost');
                    expect(response.body.mqtt).to.have.property('port', mocks.mqttPort);
                    expect(response.body.mqtt).to.have.property('qos', 1);
                    expect(response.body.mqtt).to.have.property('retain', true);
                });
        
                cy.get('button#add-smart-bridge').click();
                cy.get('form#new-bridge-form').should('be.visible');
                cy.get('input#bridge-ip').clear().type('127.0.0.1');
                cy.get('input#bridge-port').clear().type(mocks.smartBridgePort.toString());
                cy.get('textarea#integration-report').clear().type(JSON.stringify(integrationReport), { parseSpecialCharSequences: false });
                cy.get('button#save-new-bridge').click();
        
                cy.request('/api/config').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('smartBridges');
                    expect(response.body.smartBridges[0]).to.have.property('ipAddress', '127.0.0.1');
                    expect(response.body.smartBridges[0]).to.have.property('devices');
                    expect(response.body.smartBridges[0].devices[0]).to.have.property('id', 2);
                    expect(response.body.smartBridges[0].devices[0]).to.have.property('name', 'pico-remote');
                    expect(response.body.smartBridges[0].devices[0]).to.have.property('room', 'living-room');
                    expect(response.body.smartBridges[0].devices[0]).to.have.property('type', 1);
                    expect(response.body.smartBridges[0].devices[1]).to.have.property('id', 3);
                    expect(response.body.smartBridges[0].devices[1]).to.have.property('name', 'floor-lamp');
                    expect(response.body.smartBridges[0].devices[1]).to.have.property('room', 'office');
                    expect(response.body.smartBridges[0].devices[1]).to.have.property('type', 2);
                });

                cy.task('waitForConnections').then((connectionsEstablished) => expect(connectionsEstablished).to.eq(true));

                cy.task('triggerSmartBridgeMessage', { content: '~DEVICE,2,3,3' }) // Pico Remote (2) Fav Button (3) Pressed (3)
                    .then(() => cy.task('checkMqttValue', { topic: 'casetas/living-room/pico-remote/favorite', message: 'activated' }))
                    .then((mqttValueMatches) => expect(mqttValueMatches).to.eq(true));

                cy.task('triggerSmartBridgeMessage', { content: '~DEVICE,4,3,3' }) // New Pico Remote (4) Fav Button (3) Pressed (3)
                .then(() => cy.task('checkMqttValue', { topic: 'casetas/device-4/favorite', message: 'activated' }))
                .then((mqttValueMatches) => expect(mqttValueMatches).to.eq(true) && cy.request('/api/config'))
                .then((response) => {
                    expect(response.body).to.have.property('smartBridges');
                    expect(response.body.smartBridges[0]).to.have.property('devices');
                    expect(response.body.smartBridges[0].devices[2]).to.have.property('id', 4);
                    expect(response.body.smartBridges[0].devices[2]).to.have.property('name', 'device-4');
                    expect(response.body.smartBridges[0].devices[2]).to.have.property('type', 1);
                    expect(response.body.smartBridges[0].devices[2]).to.not.have.property('room');
                });

                cy.task('triggerSmartBridgeMessage', { content: '~OUTPUT,3,1,100.00' }) // Floor Lamp (3) Brightness (1) 100% (100.00)
                    .then(() => cy.task('checkMqttValue', { topic: 'casetas/office/floor-lamp/level', message: '100' }))
                    .then((mqttValueMatches) => expect(mqttValueMatches).to.eq(true));


                cy.task('triggerSmartBridgeMessage', { content: '~OUTPUT,5,1,100.00' }) // New Controllable Device (5) Brightness (1) 100% (100.00)
                .then(() => cy.task('checkMqttValue', { topic: 'casetas/device-5/level', message: '100' }))
                .then((mqttValueMatches) => expect(mqttValueMatches).to.eq(true) && cy.request('/api/config'))
                .then((response) => {
                    expect(response.body).to.have.property('smartBridges');
                    expect(response.body.smartBridges[0]).to.have.property('devices');
                    expect(response.body.smartBridges[0].devices[3]).to.have.property('id', 5);
                    expect(response.body.smartBridges[0].devices[3]).to.have.property('name', 'device-5');
                    expect(response.body.smartBridges[0].devices[3]).to.have.property('type', 2);
                    expect(response.body.smartBridges[0].devices[3]).to.not.have.property('room');
                });

                cy.get('c2m-log-panel').should('not.contain.text', 'warn');
                cy.get('c2m-log-panel').should('not.contain.text', 'fail');
            });
    });

});