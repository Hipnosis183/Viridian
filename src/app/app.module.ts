import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// App components.
import { VideoCaptureComponent } from './components/video-capture/video-capture.component';
import { VideoInfoComponent } from './components/video-info/video-info.component';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import { VideoSaveComponent } from './components/video-save/video-save.component';
import { VideoSegmentsComponent } from './components/video-segments/video-segments.component';
import { VideoSettingsComponent } from './components/video-settings/video-settings.component';

// UI components.
import { UiButtonComponent } from './ui/ui-button/ui-button.component';
import { UiCheckboxComponent } from './ui/ui-checkbox/ui-checkbox.component';
import { UiGroupBoxComponent } from './ui/ui-group-box/ui-group-box.component';
import { UiInputComponent } from './ui/ui-input/ui-input.component';
import { UiLoadingComponent } from './ui/ui-loading/ui-loading.component';
import { UiModalComponent } from './ui/ui-modal/ui-modal.component';
import { UiProgressComponent } from './ui/ui-progress/ui-progress.component';
import { UiSelectComponent } from './ui/ui-select/ui-select.component';
import { UiOptionComponent } from './ui/ui-select/ui-option/ui-option.component';
import { UiOptionGroupComponent } from './ui/ui-select/ui-option-group/ui-option-group.component';
import { UiSliderComponent } from './ui/ui-slider/ui-slider.component';

// Directives.
import { DropdownDirective } from './directives/dropdown.directive';
import { RenderedDirective } from './directives/rendered.directive';
import { TooltipDirective } from './directives/tooltip.directive';

// Pipes.
import { DurationPipe } from './pipes/duration.pipe';
import { ExpressionPipe } from './pipes/expression.pipe';
import { FileSizePipe } from './pipes/file-size.pipe';
import { NumberInputPipe } from './pipes/number-input.pipe';

// Translate service setup.
import { Injector, APP_INITIALIZER } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
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
    VideoCaptureComponent,
    VideoInfoComponent,
    VideoPlayerComponent,
    VideoSaveComponent,
    VideoSegmentsComponent,
    VideoSettingsComponent,
    UiButtonComponent,
    UiCheckboxComponent,
    UiGroupBoxComponent,
    UiInputComponent,
    UiLoadingComponent,
    UiModalComponent,
    UiProgressComponent,
    UiSelectComponent,
    UiOptionComponent,
    UiOptionGroupComponent,
    UiSliderComponent,
    DropdownDirective,
    RenderedDirective,
    TooltipDirective,
    DurationPipe,
    ExpressionPipe,
    FileSizePipe,
    NumberInputPipe,
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
