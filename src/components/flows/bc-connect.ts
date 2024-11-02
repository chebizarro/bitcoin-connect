import {customElement, property} from 'lit/decorators.js';
import {BitcoinConnectElement} from '../BitcoinConnectElement';
import {withTwind} from '../twind/withTwind';
import {css, html} from 'lit';
import '../internal/bci-button';
import '../internal/bci-connecting';
import '../bc-modal-header';
import '../bc-router-outlet';
import {bcLogo} from '../icons/bcLogo';
import {bcCircleIcon} from '../icons/bcCircleIcon';
import {classes} from '../css/classes';

@customElement('bc-connect')
export class ConnectFlow extends withTwind()(BitcoinConnectElement) {
  static override styles = [
    ...super.styles,
    css`
      :host {
        display: flex;
        justify-content: center;
        width: 100%;
      }
    `,
  ];

  @property({
    type: Boolean,
  })
  closable?: boolean;

  override render() {
    return html`<div
      class="w-full flex-col justify-center items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="connect-modal-header"
      aria-describedby="${this._error ? 'connect-error-message' : ''}"
    >
      <bc-modal-header
        id="connect-modal-header"
        class="flex w-full"
        show-help
        ?closable=${this.closable}
      >
        <div class="${classes['text-brand-mixed']} mr-[2px]">
          ${bcCircleIcon}
        </div>
        <div class="${classes['text-foreground']}">${bcLogo}</div>
      </bc-modal-header>
      <div class="flex w-full pt-8">
        ${this._connecting
          ? html`<bci-connecting class="flex w-full"></bci-connecting>`
          : html`<bc-router-outlet class="flex w-full"></bc-router-outlet>`}
      </div>
      ${this._error
        ? html`<p
            id="connect-error-message"
            class="mt-4 text-center font-sans text-red-500"
            aria-live="assertive"
          >
            ${this._error}
          </p>`
        : null}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'bc-connect': ConnectFlow;
  }
}
