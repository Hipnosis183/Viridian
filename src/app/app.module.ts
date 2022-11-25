import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

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
import { UiSelectComponent } from './ui/ui-select/ui-select.component';
import { UiOptionComponent } from './ui/ui-select/ui-option/ui-option.component';
import { UiOptionGroupComponent } from './ui/ui-select/ui-option-group/ui-option-group.component';

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
    UiSelectComponent,
    UiOptionComponent,
    UiOptionGroupComponent,
    RenderedDirective,
    DurationPipe,
    ExpressionPipe,
    FileSizePipe,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
