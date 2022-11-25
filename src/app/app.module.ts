import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// App components.
import { VideoInfoComponent } from './components/video-info/video-info.component';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import { VideoSaveComponent } from './components/video-save/video-save.component';

// UI components.
import { UiButtonComponent } from './ui/ui-button/ui-button.component';
import { UiModalComponent } from './ui/ui-modal/ui-modal.component';
import { UiProgressComponent } from './ui/ui-progress/ui-progress.component';

// Directives.
import { RenderedDirective } from './directives/rendered.directive';

// Pipes.
import { DurationPipe } from './pipes/duration.pipe';
import { ExpressionPipe } from './pipes/expression.pipe';
import { FileSizePipe } from './pipes/filesize.pipe';

@NgModule({
  declarations: [
    AppComponent,
    VideoInfoComponent,
    VideoPlayerComponent,
    VideoSaveComponent,
    UiButtonComponent,
    UiModalComponent,
    UiProgressComponent,
    RenderedDirective,
    DurationPipe,
    ExpressionPipe,
    FileSizePipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
