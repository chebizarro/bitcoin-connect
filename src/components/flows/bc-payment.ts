import {customElement, property, state} from 'lit/decorators.js';
import {BitcoinConnectElement} from '../BitcoinConnectElement';
import {withTwind} from '../twind/withTwind';
import {css, html} from 'lit';
import '../internal/bci-button';
import '../internal/bci-connecting';
import '../bc-modal-header';
import '../bc-router-outlet';
import {classes} from '../css/classes';
import store from '../../state/store';
import {PaymentMethods} from '../../types/PaymentMethods';
import './bc-connect';

@customElement('bc-payment')
export class SendPaymentFlow extends withTwind()(BitcoinConnectElement) {
  static override styles = [
    ...super.styles,
    css`
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
      }
    `,
  ];

  @property({
    type: Boolean,
  })
  closable?: boolean;

  @property({
    type: String,
  })
  invoice?: string;

  @property({
    type: String,
    attribute: 'payment-methods',
  })
  paymentMethods: PaymentMethods = 'all';

  // TODO: change to preimage and then bc:onpaid event only needs to be fired
  // only from bc-send-payment
  @property({
    type: Boolean,
  })
  paid?: boolean;

  @state()
  _showConnect = false;

  constructor() {
    super();

    // TODO: handle unsubscribe
    store.subscribe((currentStore, prevStore) => {
      if (
        currentStore.connected !== prevStore.connected &&
        currentStore.connected
      ) {
        this._showConnect = false;
      }
    });
  }

  override render() {
    return this._showConnect && !this.paid
      ? html`
          <bc-connect
            ?closable=${true}
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-connect-modal-header"
          ></bc-connect>
        `
      : html`<div
          class="w-full flex-col justify-center items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-modal-header"
          aria-describedby="${this._error ? 'payment-error-message' : ''}"
        >
          <bc-modal-header
            id="payment-modal-header"
            class="flex w-full"
            ?closable=${this.closable}
          >
            <p
              class="font-sans font-medium ${classes['text-neutral-secondary']}"
            >
              Payment Request
            </p>
          </bc-modal-header>
          <div class="flex flex-col justify-center items-center w-full pt-8">
            <bc-send-payment
              .invoice=${this.invoice}
              .paymentMethods=${this.paymentMethods}
              ?paid=${this.paid}
              @onclickconnectwallet=${this._onClickConnectWallet}
            ></bc-send-payment>
          </div>
          ${this._error
            ? html`<p
                id="payment-error-message"
                class="mt-4 text-center font-sans text-red-500"
                aria-live="assertive"
              >
                ${this._error}
              </p>`
            : null}
        </div>`;
  }

  private _onClickConnectWallet() {
    this._showConnect = true;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'bc-payment': SendPaymentFlow;
  }
}
