import {html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {BitcoinConnectElement} from './BitcoinConnectElement';
import {withTwind} from './twind/withTwind';
import store from '../state/store';
import {backIcon} from './icons/backIcon';
import {classes} from './css/classes';

@customElement('bc-navbar')
export class Navbar extends withTwind()(BitcoinConnectElement) {
  @property()
  heading?: string;

  override render() {
    return html`<nav
      class="flex justify-center items-center gap-2 w-full relative pb-4"
      role="navigation"
      aria-label="${this.heading ? this.heading + ' navigation' : 'navigation'}"
    >
      <div class="absolute left-8 h-full flex items-center justify-center">
        <div
          class="${classes.interactive} ${classes['text-neutral-tertiary']}"
          role="button"
          tabindex="0"
          aria-label="Go back"
          @click=${this._goBack}
          @keydown=${this._handleKeydown}
        >
          ${backIcon}
        </div>
      </div>
      <div
        class="font-sans font-medium ${classes['text-neutral-secondary']}"
        role="heading"
        aria-level="1"
      >
        ${this.heading}
      </div>
    </nav>`;
  }

  private _goBack = () => {
    store.getState().popRoute();
    store.getState().setError(undefined);
  };

  public _handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this._goBack();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'bc-navbar': Navbar;
  }
}
