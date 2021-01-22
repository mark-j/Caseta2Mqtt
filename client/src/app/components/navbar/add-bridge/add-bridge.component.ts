import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators, AbstractControl, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

function ipAddressValidator(control: AbstractControl): { [key: string]: boolean } | null {
  return /(\d{1,3}\.){3}\d{1,3}/.test(control.value) ? null : { ip: true };
}

const WholeNumberPattern = '^-?\\d+$';

@Component({
  selector: 'c2m-add-bridge',
  templateUrl: './add-bridge.component.html',
  styleUrls: ['./add-bridge.component.scss']
})
export class AddBridgeComponent {

  constructor(public dialogRef: MatDialogRef<AddBridgeComponent>, private _http: HttpClient) { }

  newBridgeForm = new FormGroup({
    ipAddressControl: new FormControl('', [ Validators.required, ipAddressValidator ]),
    portControl: new FormControl('23', [ Validators.required, Validators.pattern(WholeNumberPattern), Validators.min(1), Validators.max(65535) ]),
    integrationReportControl: new FormControl('')
  });

  okClickAsync = async () => {
    const body = {
      ipAddress: this.newBridgeForm.controls.ipAddressControl.value,
      port: parseInt(this.newBridgeForm.controls.portControl.value, 10),
      integrationReport: this.newBridgeForm.controls.integrationReportControl.value.replace(/\s/g, ' ')
    };

    await this._http.post('/api/bridge', body).toPromise();
    this.dialogRef.close();
  }

  cancelClick(): void {
    this.dialogRef.close();
  }

}
