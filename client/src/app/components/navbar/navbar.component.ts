import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddBridgeComponent } from './add-bridge/add-bridge.component';
import { MqttSettingsComponent } from './mqtt-settings/mqtt-settings.component';
import { DataService } from 'src/app/services/data/data.service';

@Component({
  selector: 'c2m-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent  {

  constructor(public dialog: MatDialog, public dataService: DataService) {}

  @Output() smartBridgeSelected: EventEmitter<{ ipAddress: string }> = new EventEmitter();

  selectSmartBridge = (ipAddress: string) => {
    this.smartBridgeSelected.emit({ ipAddress });
  }

  addSmartBridge = () => {
    this.dialog.open(AddBridgeComponent);
  }

  editMqttSettings = () => {
    this.dialog.open(MqttSettingsComponent);
  }

}
