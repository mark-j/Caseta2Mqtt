import { EventEmitter } from 'events';
const timestamp = require('time-stamp');
const timestampFormat = 'MM/DD/YYYY HH:mm:ss.ms';
const maxLogsInMemory = 5000;

export class Logger extends EventEmitter {
  constructor() {
    super();
  }

  private _logs: string[] = [];

  public debug = (message: string) => {
    this._log('dbug', message);
  }

  public trace = (message: string) => {
    this._log('trce', message);
  }

  public info = (message: string) => {
    this._log('info', message);
  }

  public warn = (message: string) => {
    this._log('warn', message);
  }

  public error = (message: string, error: any = null) => {
    let fullMessage = message;
    if (typeof(error) === 'string') fullMessage += ': ' + error;
    else if (error instanceof Error) fullMessage += ': ' + error.message;
    else if (error) fullMessage += ': ' + JSON.stringify(error);

    this._log('fail', fullMessage);
  }

  public getLogs = () => {
    return this._logs.slice(0);
  }

  private _log = (prefix: string, message: string) => {
    const log = `[${timestamp(timestampFormat)}]  ${prefix}: ${message}`;
    this._logs.push(log);

    if (this._logs.length > maxLogsInMemory) {
      this._logs.shift();
    }

    console.log(log);
    this.emit('log', log);
  }
}
