// Import Angular elements.
import { Pipe, PipeTransform } from '@angular/core';

// Import components, services, directives, pipes, types and interfaces.
import { HotkeysKey } from '@app/models/settings';

@Pipe({
  name: 'hotkeys',
  standalone: true,
})
export class HotkeysPipe implements PipeTransform {
  transform(hotkeys: HotkeysKey): string[] {
    // Format hotkeys state.
    const keys = [];
    if (hotkeys.state.ctrlKey) { keys.push('Ctrl'); }
    if (hotkeys.state.shiftKey) { keys.push('Shift'); }
    if (hotkeys.state.altKey) { keys.push('Alt'); }
    if (hotkeys.state.code) { keys.push(hotkeys.state.code); }
    return keys;
  };
};