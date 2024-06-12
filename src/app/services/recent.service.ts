// Import Angular elements.
import { inject, Injectable, signal } from '@angular/core';

// Import components, services, directives, pipes, types and interfaces.
import { IpcService } from '@app/services';

@Injectable({
  providedIn: 'root',
})
export class RecentService {
  // Inject app services.
  private ipc = inject(IpcService);

  // Define recent files state.
  public recentFiles = signal<Partial<File>[]>(JSON.parse(localStorage.getItem('app.recentFiles') || '[]'));
  public recentOpen = signal<boolean>(false);

  // Clear recent files list.
  public recentClearAll(): void {
    this.recentFiles.set([]);
    localStorage.setItem('app.recentFiles', '[]');
  };

  // Clear deleted files from recent list.
  public async recentClearDeleted(): Promise<void> {
    const recentFiles: Partial<File>[] = [];
    // Check if selected recent file still exists.
    for (let file of this.recentFiles()) {
      if (await this.ipc.invoke('file-exists', file.path)) {
        recentFiles.push(file);
      }
    }
    // Update recent files list state.
    this.recentFiles.set(recentFiles);
    localStorage.setItem('app.recentFiles', JSON.stringify(recentFiles));
  };

  // Add opened file to recent files list.
  public recentFileAdd(recentFile: File | Partial<File>): void {
    // Remove entry from list if already exists.
    const recentFiles: Partial<File>[] = this.recentFiles().filter((v) => (v.name != recentFile.name) && (v.path != recentFile.path));
    // Add entry at the top of the list.
    recentFiles.unshift({ name: recentFile.name, path: recentFile.path, type: recentFile.type });
    // Limit recent files limit to 20 entries.
    if (recentFiles.length > 20) { recentFiles.pop(); }
    // Update recent files list.
    this.recentFiles.set(recentFiles);
    localStorage.setItem('app.recentFiles', JSON.stringify(recentFiles));
  };

  // Open file from recent files list.
  public async recentFileOpen(recentFile: File | Partial<File>): Promise<boolean> {
    // Check if recent file to open still exists.
    const recentExists: boolean = await this.ipc.invoke('file-exists', recentFile.path);
    // Remove file from list and display error.
    if (!recentExists) { this.recentFileRemove(recentFile.path!); this.recentUpdateOpen(); }
    // Proceed to open the file.
    return recentExists;
  };

  // Remove selected file from recent files list.
  public recentFileRemove(recentFile: string): void {
    // Update recent files list.
    this.recentFiles.update((v) => v.filter((x) => x.path != recentFile));
    localStorage.setItem('app.recentFiles', JSON.stringify(this.recentFiles()));
  };

  // Update recent files open state.
  public recentUpdateOpen(): void {
    this.recentOpen.update((v) => !v);
  };
};