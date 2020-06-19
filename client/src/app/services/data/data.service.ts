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
  private _connectedSubject = new BehaviorSubject<boolean>(false);
  private _smartBridgesSubject = new BehaviorSubject<SmartBridgeModel[]>([]);
  private _mqttSettingsSubject = new ReplaySubject<MqttSettingsModel>(1);
  private _refreshingSubject = new BehaviorSubject<boolean>(false);
  private _webSocket: WebSocketSubject<any> = webSocket({
    url: ((window.location.protocol === 'https:') ? 'wss://' : 'ws://') + window.location.host + '/websocket',
    openObserver: { next: v => this._connectedSubject.next(true) }
  });

  constructor(private _httpClient: HttpClient) {
    this.refreshConfigAsync();
    this._webSocket.pipe(
      retryWhen(errors =>
        errors.pipe(
          tap(e => this._connectedSubject.next(false)),
          delay(1000)
        )
      )
    )
    .subscribe(message => this._messageReceived(message));
  }

  public connected = this._connectedSubject.asObservable();
  public smartBridges: Observable<SmartBridgeModel[]> = this._smartBridgesSubject.asObservable().pipe(distinctUntilChanged(deepObjectCompare));
  public mqttSettings: Observable<MqttSettingsModel> = this._mqttSettingsSubject.asObservable().pipe(distinctUntilChanged(deepObjectCompare));

  public refreshConfigAsync = async () => {
    if (this._refreshingSubject.value === true) {
      return;
    }

    this._refreshingSubject.next(true);
    try {
      const config = await this._httpClient.get<ConfigModel>('api/config').toPromise();
      this._smartBridgesSubject.next(config.smartBridges);
      this._mqttSettingsSubject.next(config.mqtt);
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
    }
  }

}
