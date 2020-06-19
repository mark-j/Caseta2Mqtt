export interface IntegrationReportModel {
  LIPIdList: IntegrationReportIdList;
}

export interface IntegrationReportIdList {
  Devices: IntegrationReportDevice[];
  Zones: IntegrationReportZone[];
}

export interface IntegrationReportDevice {
  Name: string;
  ID: number;
  Area: IntegrationReportArea;
  Buttons: IntegrationReportButton[];
}

export interface IntegrationReportZone {
  Name: string;
  ID: number;
  Area: IntegrationReportArea;
}

export interface IntegrationReportArea {
  Name: string;
}

export interface IntegrationReportButton {
  Number: number;
}
