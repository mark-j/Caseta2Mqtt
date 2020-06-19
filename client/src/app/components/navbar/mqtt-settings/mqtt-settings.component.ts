import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataService } from 'src/app/services/data/data.service';
import { Subscription } from 'rxjs';

const MqttHostPattern = '^((mqtt)|(mqtts)|(tcp)|(tls)|(ws)|(wss)):\\/\\/(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\\-]*[A-Za-z0-9])$';
const WholeNumberPattern = '^-?\\d+$';

@Component({
  selector: 'c2m-mqtt-settings',
  templateUrl: './mqtt-settings.component.html',
  styleUrls: ['./mqtt-settings.component.scss']
})
export class MqttSettingsComponent implements OnInit, OnDestroy {

  private _subscription: Subscription;

  constructor(public dialogRef: MatDialogRef<MqttSettingsComponent>, private _http: HttpClient, private _dataService: DataService) { }

  mqttSettingsForm = new FormGroup({
    hostControl: new FormControl('', [ Validators.required, Validators.pattern(MqttHostPattern) ]),
    portControl: new FormControl('1883', [ Validators.required, Validators.pattern(WholeNumberPattern), Validators.min(1), Validators.max(65535) ]),
    usernameControl: new FormControl(''),
    passwordControl: new FormControl(''),
    qosControl: new FormControl('1'),
    retainControl: new FormControl(true)
  });

  ngOnInit() {
    this._subscription = this._dataService.mqttSettings.subscribe(settings => {
      if (settings) {
        this.mqttSettingsForm.controls.hostControl.setValue(settings.host);
        this.mqttSettingsForm.controls.portControl.setValue(settings.port);
        this.mqttSettingsForm.controls.usernameControl.setValue(settings.username);
        this.mqttSettingsForm.controls.passwordControl.setValue(settings.password);
        this.mqttSettingsForm.controls.qosControl.setValue((settings.qos || 1).toString());
        this.mqttSettingsForm.controls.retainControl.setValue(settings.retain);
      }
    });
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  okClickAsync = async () => {
    const body = {
      host: this.mqttSettingsForm.controls.hostControl.value,
      port: parseInt(this.mqttSettingsForm.controls.portControl.value, 10),
      username: this.mqttSettingsForm.controls.usernameControl.value,
      password: this.mqttSettingsForm.controls.passwordControl.value,
      qos: parseInt(this.mqttSettingsForm.controls.qosControl.value, 10),
      retain: this.mqttSettingsForm.controls.retainControl.value
    };

    await this._http.put('/api/mqtt', body).toPromise();
    this.dialogRef.close();
  }

  cancelClick(): void {
    this.dialogRef.close();
  }

}
