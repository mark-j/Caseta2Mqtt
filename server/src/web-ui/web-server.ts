import path = require("path");
import { Request, Response } from "express";
import { Server } from "http";
import { Logger } from "../logger";
import { ConfigStorage } from "../config-storage/config-storage";
import { DataController } from "./data-controller";
import * as express from "express";
import expressWs = require("express-ws");
import bodyParser = require('body-parser');

const webUiPort = 4600;

export class WebServer {
  private _app: expressWs.Application;
  private _webSocket: expressWs.Instance;
  private _runningServer: Server;
  private _isRunning: boolean;

  constructor(private _configStorage: ConfigStorage, private _logger: Logger) {
    this._webSocket = expressWs(express());
    this._app = this._webSocket.app;
    this._wireupMiddleware(this._app, this._webSocket);
  }

  start(): void {
    if (this._isRunning)
      this.stop();

    this._isRunning = true;
    this._runningServer = this._app.listen(webUiPort, () => {
      this._logger.info(`Server started at http://localhost:${webUiPort}`);
    });
  }

  stop(): void {
    if (!this._isRunning)
      return;

    this._isRunning = false;
    this._runningServer.close(() => {
      this._logger.info('Server stopped')
    });
  }

  private _wireupMiddleware(server: expressWs.Application, webSocket: expressWs.Instance) {
    const dataController = new DataController(this._configStorage, webSocket, this._logger);
    const staticFolder = path.join(__dirname, 'www');
    server.ws('/websocket', dataController.webSocketHandler);
    server.use(<any>bodyParser.json());
    server.use('/api', dataController.apiRouter);
    server.use(express.static(staticFolder));
    server.get('/', (req: Request, res: Response) => { res.sendFile(path.join(staticFolder, 'index.html')); });
  }

}
