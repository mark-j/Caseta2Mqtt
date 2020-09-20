import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { tap, retryWhen, delay, distinctUntilChanged } from 'rxjs/operators';
import { SmartBridgeModel } from './smart-bridge.model';
import { ConfigModel } from './config.model';
import { MqttSettingsModel } from './mqtt-settings.model';
const deepObjectCompare = (a, b) => JSON.stringify(a) === JSON.stringify(b);

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private _logCache = [];
  private _connectedSubject = new BehaviorSubject<boolean>(false);
  private _smartBridgesSubject = new BehaviorSubject<SmartBridgeModel[]>([]);
  private _mqttSettingsSubject = new ReplaySubject<MqttSettingsModel>(1);
  private _logSubject = new ReplaySubject<string[]>(1);
  private _refreshingSubject = new BehaviorSubject<boolean>(false);
  private _webSocket: WebSocketSubject<any> = webSocket({
    url: ((window.location.protocol === 'https:') ? 'wss://' : 'ws://') + window.location.host + '/websocket',
    openObserver: { next: v => this._connectedSubject.next(true) }
  });

  constructor(private _httpClient: HttpClient) {
    this.refreshDataAsync();
    this._webSocket.pipe(
      retryWhen(errors =>
        errors.pipe(
          tap(e => this._connectedSubject.next(false)),
          delay(1000)
        )
      )
    )
    .subscribe(message => this._messageReceived(message));

    this.connected.subscribe(connected => {
      if (connected) {
        this.refreshDataAsync();
      }
    });
  }

  public connected = this._connectedSubject.asObservable();
  public smartBridges: Observable<SmartBridgeModel[]> = this._smartBridgesSubject.asObservable().pipe(distinctUntilChanged(deepObjectCompare));
  public mqttSettings: Observable<MqttSettingsModel> = this._mqttSettingsSubject.asObservable().pipe(distinctUntilChanged(deepObjectCompare));
  public logs: Observable<string[]> = this._logSubject.asObservable();

  public refreshDataAsync = async () => {
    if (this._refreshingSubject.value === true) {
      return;
    }

    this._refreshingSubject.next(true);
    try {
      const configRequest = this._httpClient.get<ConfigModel>('api/config').toPromise();
      const logsRequest = this._httpClient.get<string[]>('api/logs').toPromise();
      const config = await configRequest;
      this._smartBridgesSubject.next(config.smartBridges);
      this._mqttSettingsSubject.next(config.mqtt);
      this._logCache = await logsRequest;
      this._logSubject.next(this._logCache);
    } finally {
      this._refreshingSubject.next(false);
    }
  }

  private _messageReceived = (message) => {
    switch (message.type) {
      case 'config':
        this._smartBridgesSubject.next(message.value.smartBridges);
        this._mqttSettingsSubject.next(message.value.mqtt);
        break;
      case 'log':
        this._logCache.push(message.value.log);
        this._logSubject.next(this._logCache);
        break;
    }
  }

}
