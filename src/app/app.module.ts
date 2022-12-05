import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// App components.
import { VideoInfoComponent } from './components/video-info/video-info.component';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import { VideoSaveComponent } from './components/video-save/video-save.component';

// UI components.
import { UiButtonComponent } from './ui/ui-button/ui-button.component';
import { UiGroupBoxComponent } from './ui/ui-group-box/ui-group-box.component';
import { UiInputComponent } from './ui/ui-input/ui-input.component';
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

// Translate service setup.
import { Injector, APP_INITIALIZER } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

function appInitializerFactory(translate: TranslateService) {
  return () => {
    translate.addLangs(['en']);
    translate.setDefaultLang('en');
    return translate.use('en').toPromise();
  };
}

@NgModule({
  declarations: [
    AppComponent,
    VideoInfoComponent,
    VideoPlayerComponent,
    VideoSaveComponent,
    UiButtonComponent,
    UiGroupBoxComponent,
    UiInputComponent,
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
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  providers: [{
    provide: APP_INITIALIZER, multi: true,
    useFactory: appInitializerFactory,
    deps: [TranslateService, Injector]
  }],
  bootstrap: [AppComponent]
})

export class AppModule { }
