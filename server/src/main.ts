import { Logger } from "./logger";
import { ConfigStorage } from "./config-storage/config-storage";
import { WebServer } from "./web-ui/web-server";
import { Gateway } from "./gateway";

const logger = new Logger();
const configStorage = new ConfigStorage(logger);
const gateway = new Gateway(configStorage, logger);
const webServer = new WebServer(configStorage, logger);

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
