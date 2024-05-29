// Import Angular elements.
import { inject, Injectable, signal } from '@angular/core';

// Import components, services, directives, pipes, types and interfaces.
import { VideoContainer } from '@app/models/ffmpeg';
import { StoreService } from '@app/services';

@Injectable({
  providedIn: 'root',
})
export class InfoService {
  // Inject app services.
  private store = inject(StoreService);

  // Define video information state.
  public infoExpanded = signal<number>(0);
  public infoOpen = signal<boolean>(false);
  private infoStreams: HTMLElement[] = [];

  // Parse and format/beautify stream information.
  public infoFormat(streamInfo: VideoContainer[] | string): string {
    let streamsInfo: string = '';
    // Prepare information block for each stream.
    for (let v in streamInfo as []) {
      if (typeof streamInfo[v] == 'object') {
        streamsInfo += `<span><span class="key">${v}:</span><span class="braces">{</span></span>`;
        streamsInfo += `<span class="object">${this.infoFormat(streamInfo[v] as string)}</span>`
        streamsInfo += `<span><span class="braces">}</span></span>`;
      } else { streamsInfo += `<span><span class="key">${v}:</span><span class="value">${streamInfo[v]}</span></span>`; }
    }
    // Return formatted stream elements.
    return streamsInfo;
  };

  // Update rendered information stream element.
  public infoRendered(streamElement: HTMLElement, streamIndex: number): void {
    // Update video streams list.
    this.infoStreams.push(streamElement);
    // Update the height values once all elements are already rendered.
    if (streamIndex == this.store.storeVideos()[this.store.storeIndex()].videoStreams.length - 1) {
      // Adjust table's width value to fit the information.
      const streamsTable: HTMLElement = document.querySelector('table.info-streams')!;
      for (let i = 0; i < this.infoStreams.length; i++) {
        this.infoStreams[i].style.width = streamsTable.offsetWidth + 'px';
      }
    }
  };

  // Update information expanded state.
  public infoUpdateExpanded(streamIndex: number): void {
    this.infoExpanded.set(streamIndex);
  };

  // Update information open state.
  public infoUpdateOpen(): void {
    this.infoOpen.update((v) => !v);
  };
};