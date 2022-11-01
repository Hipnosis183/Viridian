import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';

@Injectable({ providedIn: 'root' })

export class IpcService {

  private ipc: IpcRenderer | null = null;

  constructor() {
    if (window.require) {
      try { this.ipc = window.require('electron').ipcRenderer; }
      catch (e) { throw e; }
    } else { console.warn('Electron IPC was not loaded'); }
  }

  public on(channel: string, listener: any): void {
    if (!this.ipc) { return; }
    this.ipc.on(channel, listener);
  }

  public once(channel: string, listener: any): void {
    if (!this.ipc) { return; }
    this.ipc.once(channel, listener);
  }

  public send(channel: string, ...args: any[]): void {
    if (!this.ipc) { return; }
    this.ipc.send(channel, ...args);
  }

  public async invoke(channel: string, ...args: any[]): Promise<any> {
    if (!this.ipc) { return; }
    return await this.ipc.invoke(channel, ...args);
  }

  public removeAllListeners(channel: string): void {
    if (!this.ipc) { return; }
    this.ipc.removeAllListeners(channel);
  }
}
