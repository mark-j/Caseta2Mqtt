import * as express from "express";
import { Request, Response } from "express";
import { Server } from "http";
import path = require("path");
import expressWs = require("express-ws");
import bodyParser = require('body-parser');
import { DataController } from "./data-controller";
import { ConfigStorage } from "../config-storage/config-storage";

const webUiPort = 4600;

export class WebServer {
  private _app: expressWs.Application;
  private _webSocket: expressWs.Instance;
  private _runningServer: Server;
  private _isRunning: boolean;

  constructor(private _configStorage: ConfigStorage) {
    this._webSocket = expressWs(express());
    this._app = this._webSocket.app;
    this._wireupMiddleware(this._app, this._webSocket);
  }

  start(): void {
    if (this._isRunning)
      this.stop();

    this._isRunning = true;
    this._runningServer = this._app.listen(webUiPort, () => {
      console.log(`Server started at http://localhost:${webUiPort}`);
    });
  }

  stop(): void {
    if (!this._isRunning)
      return;

    this._isRunning = false;
    this._runningServer.close(() => {
      console.log('Server stopped')
    });
  }

  private _wireupMiddleware(server: expressWs.Application, webSocket: expressWs.Instance) {
    const dataController = new DataController(this._configStorage, webSocket);
    const staticFolder = path.join(__dirname, 'www');
    server.ws('/websocket', dataController.webSocketHandler);
    server.use(<any>bodyParser.json());
    server.use('/api', dataController.apiRouter);
    server.use(express.static(staticFolder));
    server.get('/', (req: Request, res: Response) => { res.sendFile(path.join(staticFolder, 'index.html')); });
  }

}
