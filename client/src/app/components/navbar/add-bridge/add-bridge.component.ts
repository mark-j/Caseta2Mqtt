import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators, AbstractControl, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

function ipAddressValidator(control: AbstractControl): { [key: string]: boolean } | null {
  return /(\d{1,3}\.){3}\d{1,3}/.test(control.value) ? null : { ip: true };
}

@Component({
  selector: 'c2m-add-bridge',
  templateUrl: './add-bridge.component.html',
  styleUrls: ['./add-bridge.component.scss']
})
export class AddBridgeComponent {

  constructor(public dialogRef: MatDialogRef<AddBridgeComponent>, private _http: HttpClient) { }

  newBridgeForm = new FormGroup({
    ipAddressControl: new FormControl('', [
      Validators.required,
      ipAddressValidator,
    ]),
    integrationReportControl: new FormControl('')
  });

  okClickAsync = async () => {
    const body = {
      ipAddress: this.newBridgeForm.controls.ipAddressControl.value,
      integrationReport: this.newBridgeForm.controls.integrationReportControl.value.replace(/\s/g, ' ')
    };

    await this._http.post('/api/bridge', body).toPromise();
    this.dialogRef.close();
  }

  cancelClick(): void {
    this.dialogRef.close();
  }

}
