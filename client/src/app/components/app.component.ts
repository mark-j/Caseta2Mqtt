import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DataService } from '../services/data/data.service';

@Component({
  selector: 'c2m-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  private _selectedSmartBridgeIpAddressSubject = new BehaviorSubject<string>(null);

  constructor(public dataService: DataService) { }

  public selectedSmartBridgeIpAddress = this._selectedSmartBridgeIpAddressSubject.asObservable();

  public smartBridgeSelected = (ipAddress: string) => {
    this._selectedSmartBridgeIpAddressSubject.next(ipAddress);
  }

}
