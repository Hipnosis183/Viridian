import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// App components.
import { VideoPlayerComponent } from './components/video-player/video-player.component';

// UI components.
import { ModalComponent } from './ui/modal/modal.component';

@NgModule({
  declarations: [
    AppComponent,
    VideoPlayerComponent,
    ModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
