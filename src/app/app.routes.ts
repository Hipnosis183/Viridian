// Import Angular elements.
import { Routes } from '@angular/router';

// Import app components.
import { VideoPlayerComponent } from '@components/video-player/video-player.component';

// Define app routes.
export const routes: Routes = [
  { path: '', component: VideoPlayerComponent },
];