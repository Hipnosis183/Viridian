// Import Angular elements.
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Import components, services, directives, pipes, types and interfaces.
import { HotkeysService } from '@app/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [RouterOutlet],
})
export class AppComponent {
  constructor(private hotkeys: HotkeysService) {
    // Setup initial theme state.
    document.body.dataset.theme = localStorage.getItem('general.appTheme') || 'dark';
    // Initialize hotkeys event listeners.
    window.addEventListener('keyup', hotkeys.hotkeysUp, true);
    window.addEventListener('keydown', hotkeys.hotkeysDown, true);
  };
};