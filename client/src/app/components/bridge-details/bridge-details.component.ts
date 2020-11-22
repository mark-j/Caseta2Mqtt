import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataService } from 'src/app/services/data/data.service';
import { MatTableDataSource } from '@angular/material/table';
import { DeviceModel } from 'src/app/services/data/device.model';
import { MatPaginator } from '@angular/material/paginator';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { EditDeviceComponent } from './edit-device/edit-device.component';

@Component({
  selector: 'c2m-bridge-details',
  templateUrl: './bridge-details.component.html',
  styleUrls: ['./bridge-details.component.scss']
})
export class BridgeDetailsComponent implements OnInit {

  private _ipAddressSubject = new BehaviorSubject<string>(null);

  constructor(public dialog: MatDialog, private _dataService: DataService, private _http: HttpClient) { }

  @Input() set ipAddress(value: string) {
    this._ipAddressSubject.next(value);
  }

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  public displayedColumns: string[] = ['name', 'room', 'actions'];

  public dataSource = new MatTableDataSource<DeviceModel>();

  public smartBridge = combineLatest(this._ipAddressSubject.asObservable(), this._dataService.smartBridges).pipe(map(values => {
    const ipAddress = values[0];
    const smartBridges = values[1];

    if (!ipAddress || !smartBridges) {
      return null;
    }

    const smartBridge = smartBridges.find(b => b.ipAddress === ipAddress);
    return smartBridge || null;
  }));

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  public editClickAsync = async (deviceId: number) => {
    const ipAddress = this._ipAddressSubject.value;
    if (!ipAddress) {
      return;
    }

    this.dialog.open(EditDeviceComponent, { data: { deviceId, ipAddress } });
  }

  public deleteClickAsync = async () => {
    const ipAddress = this._ipAddressSubject.value;
    if (!ipAddress || !confirm(`This will disconnect the Smart Bridge at ${ipAddress} from the gateway, and delete any related data.`)) {
      return;
    }

    await this._http.delete(`api/bridge/${ipAddress}`).toPromise();
  }

  public ngOnInit() {
    this.smartBridge.subscribe(smartBridge => {
      if (!smartBridge) {
        return;
      }

      this.dataSource.paginator = this.paginator;
      this.dataSource.data = smartBridge.devices;
    });
  }

}
