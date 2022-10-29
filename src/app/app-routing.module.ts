import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { VideoPlayerComponent } from './components/video-player/video-player.component';

const routes: Routes = [
  { path: '', component: VideoPlayerComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
