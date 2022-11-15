import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// App components.
import { VideoInfoComponent } from './components/video-info/video-info.component';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import { VideoSaveComponent } from './components/video-save/video-save.component';

// UI components.
import { ModalComponent } from './ui/modal/modal.component';

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
    ModalComponent,
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
