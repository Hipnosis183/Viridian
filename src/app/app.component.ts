// Import Angular elements.
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [RouterOutlet],
})
export class AppComponent {
  constructor() {
    // Setup initial theme state.
    document.body.dataset.theme = localStorage.getItem('general.appTheme') || 'dark';
  };
};