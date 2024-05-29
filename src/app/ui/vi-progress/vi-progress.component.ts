// Import Angular elements.
import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, input, model, signal, viewChild } from '@angular/core';

// Import components, services, directives, pipes, types and interfaces.
import { DelayService } from '@app/services';
import { RenderedDirective, TooltipDirective } from '@app/directives';
import { DurationPipe, NumberInputPipe } from '@app/pipes';

@Component({
  selector: 'vi-progress',
  templateUrl: './vi-progress.component.html',
  styleUrl: './vi-progress.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RenderedDirective, TooltipDirective, DurationPipe, NumberInputPipe],
  host: {
    '(window:resize)': 'onResize()',
  },
})
export class ViProgress {
  constructor() {
    // Update progress bar state.
    effect(() => { if (this.progressExtend()) { this.progressUpdateFrames(); this.progressUpdateThumb(); }});
    effect(() => { if (this.progressTime() >= 0) { this.progressUpdateThumb(); }});
  };

  // Inject app services.
  private delay = inject(DelayService);

  // Define progress bar state.
  public progressDuration = input<number>(0);
  public progressExtend = input<boolean>(false);
  public progressFrames = input<number[]>([]);
  public progressHover = input<string[]>([]);
  public progressInfoLine = signal<number>(0);
  public progressInfoTime = signal<number>(0);
  public progressInfoThumb = signal<string | null>(null);
  public progressInterval = input<number>(10);
  public progressTime = model<number>(0);

  // Define template queries.
  private progressContainer = viewChild.required<ElementRef>('progressContainer');
  private progressLine = viewChild.required<ElementRef>('progressLine');

  // Define host event functions.
  public onResize(): void { this.progressUpdateFrames(); this.progressUpdateThumb(); }

  // Update progress bar state.
  public progressUpdate(e: MouseEvent): void {
    // Calculate clicked bar position.
    const progressDistance: number = (e.target as HTMLElement).getBoundingClientRect().left;
    const progressPosition: number = (e.pageX - progressDistance) / (e.target as HTMLElement).offsetWidth;
    // Update progress timer.
    this.progressTime.set(progressPosition * this.progressDuration());
    this.progressUpdateThumb();
  };

  // Update keyframe mark position.
  public progressUpdateFrame(frameElement: HTMLElement, frameIndex: number): void {
    if (frameElement) { frameElement.style.left = `${this.progressFrames()[frameIndex] * this.progressContainer().nativeElement.childNodes[0].offsetWidth / (this.progressDuration() || 1)}px`; }
  };

  // Update all keyframe marks position.
  private progressUpdateFrames(): void {
    if (this.progressExtend()) {
      for (let i = 0; i < this.progressFrames().length; i++) {
        this.progressUpdateFrame(this.progressContainer().nativeElement.childNodes[2].childNodes[i], i);
      }
    }
  };

  // Update progress bar hover state.
  public $progressUpdateInfo = this.delay.throttle((e: MouseEvent) => this.progressUpdateInfo(e), 10);
  private progressUpdateInfo(e: MouseEvent): void {
    // Update hover mark position.
    if (this.progressExtend()) {
      this.progressLine().nativeElement.style.left = `${e.layerX}px`;
    }
    // Update hover tooltip time.
    this.progressInfoTime.set(e.layerX * this.progressDuration() / this.progressContainer().nativeElement.childNodes[0].offsetWidth);
    // Update hover tooltip thumbnail.
    if (this.progressHover().length) {
      const progressIndex: number = Math.round(this.progressInfoTime() / this.progressInterval());
      const progressLength: number = this.progressHover().length;
      this.progressInfoThumb.set(this.progressHover()[progressIndex >= progressLength ? progressLength - 1 : progressIndex]);
    }
  };

  // Update progress bar thumb position.
  private progressUpdateThumb(): void {
    const progressDistance: number = this.progressTime() * this.progressContainer().nativeElement.childNodes[0].offsetWidth / (this.progressDuration() || 1);
    this.progressContainer().nativeElement.childNodes[1].style.left = `${progressDistance - 4}px`;
  };
};