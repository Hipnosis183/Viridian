// Import Angular elements.
import { Injectable } from '@angular/core';

// Import Electron elements.
import { IpcRenderer } from 'electron';

@Injectable({
  providedIn: 'root',
})
export class IpcService {
  // Define IPC renderer.
  private ipc: IpcRenderer | null = null;
  constructor() {
    // Load IPC renderer.
    this.ipc = window.require('electron').ipcRenderer;
  };

  // Define 'invoke' IPC listener.
  public async invoke(channel: string, ...args: any[]): Promise<any> {
    return await this.ipc!.invoke(channel, ...args);
  };
};