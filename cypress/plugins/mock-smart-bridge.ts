import { createServer } from "telnet";

const getPort = require('get-port');
const responses = {
    '?OUTPUT,3,1': '~OUTPUT,3,1,0.00',
    '?OUTPUT,5,1': '~OUTPUT,5,1,0.00'
};

export class MockSmartBridge {
    private _clients = [];

    public static StartAsync(): Promise<MockSmartBridge> {
        return new Promise<MockSmartBridge>((resolve, reject) => {
            const server = createServer();
            getPort().then(port => {
                server.listen(port, () => resolve(new MockSmartBridge(port, server)));
            });
        });
    }

    private constructor(public port: number, server) {
        server.on('client', this._handleClient);
    }

    public waitForClient = () => new Promise<boolean>((resolve, reject) => {
        const startTime = new Date().getTime();
        const poller = () => {
            if (this._clients.length) {
                resolve(true);
            } else if ((new Date().getTime() - startTime) < 1000) {
                setTimeout(poller, 100);
            } else {
                resolve(false);
            }
        };

        poller();
    })

    public sendToClients = (content: string) => {
        this._clients.forEach(client => {
            client.write(`${content}\nGNET> `);
        });
    }

    private _handleClient = (client) => {
        let username = '';
        let expectingUsername = true;
        let expectingPassword = false;

        client.on('data', data => {
            const value = data.toString().trim();
            const enteredExpectedCredentials = username === 'lutron' && value === 'integration';

            if (expectingUsername) {
                username = value;
                expectingUsername = false;
                expectingPassword = true;
                client.write('password: ');
                return;
            }

            if (expectingPassword && enteredExpectedCredentials) {
                expectingUsername = false;
                expectingPassword = false;
                client.write('GNET> ');
                setTimeout(() => this._clients.push(client));
                return;
            }

            if (expectingPassword && !enteredExpectedCredentials) {
                expectingUsername = true;
                expectingPassword = false;
                client.write('login: ');
                return;
            }

            client.write(responses[value] || '~ERROR,Enum=(6, 0x00000006)');
            setTimeout(() => client.write('\nGNET> '));
        })

        client.write('login: ');
    }
}