import { ConfigStorage } from "./config-storage/config-storage";
import { WebServer } from "./web-ui/web-server";
import { Gateway } from "./gateway";

const configStorage = new ConfigStorage();
const gateway = new Gateway(configStorage);
const webServer = new WebServer(configStorage);

gateway.start();
webServer.start();

declare const module: any;
if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => {
      gateway.stop();
      webServer.stop();
    });
}
