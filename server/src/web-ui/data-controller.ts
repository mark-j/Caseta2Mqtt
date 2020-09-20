import expressWs = require("express-ws");
import * as ws from 'ws';
import { Request, Response, Router } from 'express';
import { Logger } from "../logger";
import { ConfigStorage } from "../config-storage/config-storage";
import { ConfigModel } from "../config-storage/config-model";

export class DataController {
  public webSocketHandler: expressWs.WebsocketRequestHandler;
  public apiRouter: Router;

  constructor(private _configStorage: ConfigStorage, private _webSocket: expressWs.Instance, private _logger: Logger) {
    this.webSocketHandler = this._wireupHandler;
    this.apiRouter = Router();
    this._wireupRouter(this.apiRouter);
    this._logger.on('log', this._handleLogAsync);
    this._configStorage.on('update', this._handleConfigUpdateAsync);
  }

  private _wireupHandler = (ws: ws, req: Request) => { }

  private _wireupRouter = (app: Router) => {
    app.get('/logs', this._handleLogsRequestAsync);
    app.get('/config', this._handleConfigRequestAsync);
    app.put('/mqtt', this._handleModifyMqttRequestAsync);
    app.post('/bridge', this._handleNewBridgeRequestAsync);
    app.delete('/bridge/:ipAddress', this._handleDeleteBridgeRequestAsync);
    app.put('/bridge/:ipAddress/device/:deviceId', this._handleModifyDeviceRequestAsync);
  }

  private _handleLogAsync = async (log: string) => {
    this._webSocket.getWss().clients.forEach(client => {
      try {
        client.send(JSON.stringify({
          type: 'log',
          value: { log }
        }));
      } catch (error) {
        console.error(error);
      }
    });
  }

  private _handleConfigUpdateAsync = async (newConfig: ConfigModel) => {
    this._webSocket.getWss().clients.forEach(client => {
      try {
        client.send(JSON.stringify({
          type: 'config',
          value: newConfig
        }));
      } catch (error) {
        console.error(error);
      }
    });
  }

  private _handleLogsRequestAsync = async (req: Request, res: Response) => {
    try {
      res.json(await this._logger.getLogs());
    } catch (error) {
      res.status(500).json(this._parseErrorObject(error));
    }
  }

  private _handleConfigRequestAsync = async (req: Request, res: Response) => {
    try {
      res.json(await this._configStorage.getLatestConfigAsync());
    } catch (error) {
      res.status(500).json(this._parseErrorObject(error));
    }
  }

  private _handleModifyMqttRequestAsync = async (req: ModifyMqttRequest, res: Response) => {
    try {
      await this._configStorage.modifyMqttAsync(req.body.host, req.body.port, req.body.username, req.body.password, req.body.qos, req.body.retain);
      res.json(await this._configStorage.getLatestConfigAsync());
    } catch (error) {
      res.status(500).json(this._parseErrorObject(error));
    }
  }

  private _handleNewBridgeRequestAsync = async (req: NewBridgeRequest, res: Response) => {
    try {
      await this._configStorage.addSmartBridgeAsync(req.body.ipAddress, req.body.integrationReport && JSON.parse(req.body.integrationReport));
      res.json(await this._configStorage.getLatestConfigAsync());
    } catch (error) {
      res.status(500).json(this._parseErrorObject(error));
    }
  }

  private _handleDeleteBridgeRequestAsync = async (req: Request, res: Response) => {
    try {
      await this._configStorage.deleteSmartBridgeAsync(req.params.ipAddress);
      res.json(await this._configStorage.getLatestConfigAsync());
    } catch (error) {
      res.status(500).json(this._parseErrorObject(error));
    }
  }

  private _handleModifyDeviceRequestAsync = async (req: ModifyDeviceRequest, res: Response) => {
    try {
      await this._configStorage.modifyDeviceAsync(req.params.ipAddress, parseInt(req.params.deviceId), req.body.name, req.body.room);
      res.json(await this._configStorage.getLatestConfigAsync());
    } catch (error) {
      res.status(500).json(this._parseErrorObject(error));
    }
  }

  private _parseErrorObject(error) {
    const message = error.message || error.msg || JSON.stringify(error);
    return { message };
  }
}

interface ModifyMqttRequest extends Request {
  body: {
    host: string;
    port: number;
    username: string;
    password: string;
    qos: number;
    retain: boolean;
  }
}

interface NewBridgeRequest extends Request {
  body: {
    ipAddress: string;
    integrationReport: string
  }
}

interface ModifyDeviceRequest extends Request {
  body: {
    name: string;
    room: string
  }
}
