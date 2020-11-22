import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataService } from 'src/app/services/data/data.service';

const topicSegmentPattern = `[A-Za-z\d\-~._]`;

@Component({
  selector: 'c2m-edit-device',
  templateUrl: './edit-device.component.html',
  styleUrls: ['./edit-device.component.scss']
})
export class EditDeviceComponent {

  constructor(public dialogRef: MatDialogRef<EditDeviceComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { deviceId: number, ipAddress: string },
              public dataService: DataService, private _http: HttpClient) {
    dataService.smartBridges.subscribe(smartBridges => {
      const smartBridge = smartBridges.find(s => s.ipAddress === data.ipAddress);
      if (!smartBridge) { return; }

      const device = smartBridge.devices.find(d => d.id === data.deviceId);
      if (!device) { return; }

      if (!this.editDeviceForm.controls.deviceNameControl.value) {
        this.editDeviceForm.controls.deviceNameControl.setValue(device.name);
      }

      if (!this.editDeviceForm.controls.roomNameControl.value) {
        this.editDeviceForm.controls.roomNameControl.setValue(device.room);
      }
    });
  }

  editDeviceForm = new FormGroup({
    deviceNameControl: new FormControl('', [ Validators.required, Validators.pattern(topicSegmentPattern) ]),
    roomNameControl: new FormControl('', [ Validators.pattern(topicSegmentPattern) ])
  });

  okClickAsync = async () => {
    const body = {
      name: this.editDeviceForm.controls.deviceNameControl.value,
      room: this.editDeviceForm.controls.roomNameControl.value
    };

    await this._http.put(`/api/bridge/${this.data.ipAddress}/device/${this.data.deviceId}`, body).toPromise();
    this.dialogRef.close();
  }

  cancelClick(): void {
    this.dialogRef.close();
  }

}
