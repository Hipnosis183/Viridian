// Import Angular elements.
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatKey',
  standalone: true,
})
export class FormatKeyPipe implements PipeTransform {
  transform(keyValue: string): string {
    // Parse key code and return formatted string.
    if (keyValue.match(/^Key/)) { return keyValue.slice(3); }
    if (keyValue.match(/^Digit/)) { return keyValue.slice(5); }
    if (keyValue.match(/^Numpad\d/)) { return keyValue.slice(6); }
    switch (keyValue) {
      case 'ArrowUp': { return String.fromCharCode(8593); }
      case 'ArrowDown': { return String.fromCharCode(8595); }
      case 'ArrowLeft': { return String.fromCharCode(8592); }
      case 'ArrowRight': { return String.fromCharCode(8594); }
      case 'Backquote': { return '`'; }
      case 'Backslash': { return '\\'; }
      case 'Backspace': { return `${String.fromCharCode(8592)}${String.fromCharCode(160).repeat(4)}`; }
      case 'BracketLeft': { return '['; }
      case 'BracketRight': { return ']'; }
      case 'CapsLock': { return 'Caps'; }
      case 'Comma': { return ','; }
      case 'ContextMenu': { return 'Menu'; }
      case 'Delete': { return 'Del'; }
      case 'Equal': { return '='; }
      case 'Escape': { return 'Esc'; }
      case 'Insert': { return 'Ins'; }
      case 'IntlBackslash': { return '\\'; }
      case 'Minus': { return '&div;'; }
      case 'NumpadComma': { return ','; }
      case 'NumpadDecimal': { return '.'; }
      case 'NumpadDivide': { return '&div;'; }
      case 'NumpadEnter': { return 'Enter'; }
      case 'NumpadEqual': { return '='; }
      case 'NumpadMultiply': { return '*'; }
      case 'NumpadSubtract': { return '-'; }
      case 'PageDown': { return 'PgDown'; }
      case 'PageUp': { return 'PgUp'; }
      case 'Period': { return '.'; }
      case 'PrintScreen': { return 'PrtScr'; }
      case 'Quote': { return '"'; }
      case 'ScrollLock': { return 'Scroll'; }
      case 'Semicolon': { return ';'; }
      case 'Slash': { return '/'; }
      default: { return keyValue; }
    }
  };
};