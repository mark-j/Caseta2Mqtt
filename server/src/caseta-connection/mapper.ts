interface IMap {
  [number: number] : string;
  defaultPrefix: string;
}

const deviceAttributeMap: IMap = {
  1: 'level',
  2: 'raising',
  3: 'lowering',
  4: 'stop',
  8: 'occupancy',
  defaultPrefix: 'state-'
}

const buttonAndSensorMap: IMap = {
  2: 'on',
  3: 'favorite',
  4: 'off',
  5: 'up',
  6: 'down',
  8: 'button-1',
  9: 'button-2',
  10: 'button-3',
  11: 'button-4',
  defaultPrefix: 'control-'
}

const valueMap: IMap = {
  3: 'activated',
  4: 'deactivated',
  defaultPrefix: 'state-'
}

export class Mapper {

  getButtonOrSensorName = (buttonOrSensorNumber: number) => this._mapNumberToName(buttonOrSensorNumber, buttonAndSensorMap);

  getButtonOrSensorNumber = (buttonOrSensorName: string) => this._mapNameToNumber(buttonOrSensorName, buttonAndSensorMap);

  parseButtonOrSensorValue = (rawValue: number) => this._mapNumberToName(rawValue, valueMap);

  encodeButtonOrSensorValue = (parsedValue: string) => this._mapNameToNumber(parsedValue, valueMap);

  getDeviceAttributeName = (deviceAttributeNumber: number) => this._mapNumberToName(deviceAttributeNumber, deviceAttributeMap);

  getDeviceAttributeNumber = (deviceAttributeName: string) => this._mapNameToNumber(deviceAttributeName, deviceAttributeMap);

  parseDeviceAttributeNumber = (deviceAttributeNumber: number, rawValue: string) => {
    switch (deviceAttributeNumber) {
      case 1: return parseFloat(rawValue);
      case 8: return this._mapNumberToName(parseInt(rawValue), valueMap);
      default: return rawValue;
    }
  }

  encodeDeviceAttributeValue = (deviceAttributeNumber: number, parsedValue: string) => {
    return deviceAttributeNumber === this.getDeviceAttributeNumber('occupancy')
      ? this._mapNameToNumber(parsedValue, valueMap)
      : parsedValue.toString();
  }

  private _mapNumberToName = (number: number, map: IMap) => {
    return map[number] || map.defaultPrefix + number;
  }

  private _mapNameToNumber = (name: string, map: IMap) => {
    const exactMatch = Object.keys(map).find(k => map[k] === name);
    return parseInt(exactMatch || name.substring(map.defaultPrefix.length));
  }
}
