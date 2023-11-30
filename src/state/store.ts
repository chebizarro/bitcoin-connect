import {createStore} from 'zustand/vanilla';
import {ConnectorConfig} from '../types/ConnectorConfig';
import {connectors} from '../connectors';
import {dispatchEvent} from '../utils/dispatchEvent';
import {Connector} from '../connectors/Connector';
import {Route} from '../components/routes';
import {ConnectorFilter} from '../types/ConnectorFilter';

interface PrivateStore {
  readonly connector: Connector | undefined;
  readonly config: ConnectorConfig | undefined;
  setConfig(config: ConnectorConfig | undefined): void;
  setConnector(connector: Connector | undefined): void;
}

const privateStore = createStore<PrivateStore>((set) => ({
  connector: undefined,
  config: undefined,
  setConfig: (config) => {
    set({config});
  },
  setConnector: (connector) => {
    set({connector});
  },
}));

interface Store {
  readonly route: Route;
  readonly routeHistory: Route[];
  readonly connected: boolean;
  readonly connecting: boolean;
  readonly connectorName: string | undefined;
  readonly appName: string | undefined;
  readonly filters: ConnectorFilter[] | undefined;
  readonly error: string | undefined;
  readonly modalOpen: boolean;

  connect(config: ConnectorConfig): void;
  disconnect(): void;
  pushRoute(route: Route): void;
  popRoute(): void;
  setAppName(appName: string | undefined): void;
  setFilters(filters: ConnectorFilter[] | undefined): void;
  setError(error: string | undefined): void;
  clearRouteHistory(): void;
}

const store = createStore<Store>((set, get) => ({
  route: '/start',
  routeHistory: [],
  modalOpen: false,
  connected: false,
  connecting: false,
  error: undefined,
  alias: undefined,
  balance: undefined,
  connectorName: undefined,
  appName: undefined,
  filters: undefined,
  invoice: undefined,
  connect: async (config: ConnectorConfig) => {
    dispatchEvent('bc:connecting');
    set({
      connecting: true,
      error: undefined,
    });
    try {
      const connector = new connectors[config.connectorType](config);
      await connector.init();
      privateStore.getState().setConfig(config);
      privateStore.getState().setConnector(connector);
      set({
        connected: true,
        connecting: false,
        connectorName: config.connectorName,
        route: '/start',
      });
      dispatchEvent('bc:connected');
      saveConfig(config);
    } catch (error) {
      console.error(error);
      set({
        error: (error as Error).toString(),
        connecting: false,
      });
      get().disconnect();
      // TODO: throw new ConnectFailedError(error);
    }
  },
  disconnect: () => {
    privateStore.getState().connector?.unload();
    privateStore.getState().setConfig(undefined);
    privateStore.getState().setConnector(undefined);
    set({
      connected: false,
      connectorName: undefined,
    });
    deleteConfig();
    dispatchEvent('bc:disconnected');
  },
  getConnectorName: () => privateStore.getState().config?.connectorName,
  pushRoute: (route: Route) => {
    if (get().route === route) {
      return;
    }
    set({route, routeHistory: [...get().routeHistory, get().route]});
  },
  popRoute() {
    const routeHistory = get().routeHistory;
    const newRoute = routeHistory.pop() || '/start';
    set({
      route: newRoute,
      routeHistory,
    });
  },
  clearRouteHistory() {
    set({
      route: '/start',
      routeHistory: [],
    });
  },
  setAppName: (appName) => {
    set({appName});
  },
  setFilters: (filters) => {
    set({filters});
  },
  setError: (error) => {
    set({error});
  },
}));

export default store;

function deleteConfig() {
  window.localStorage.removeItem('bc:config');
}

function saveConfig(config: ConnectorConfig) {
  window.localStorage.setItem('bc:config', JSON.stringify(config));
}

function loadConfig() {
  const configJson = window.localStorage.getItem('bc:config');
  if (configJson) {
    const config = JSON.parse(configJson) as ConnectorConfig;
    store.getState().connect(config);
  }
}

function addEventListeners() {
  window.addEventListener('webln:enabled', async () => {
    if (!store.getState().connecting) {
      // webln was enabled from outside
      // TODO: use the same name and logic for figuring out what extension as the extension connector
      await store.getState().connect({
        connectorName: 'Extension',
        connectorType: 'extension.generic',
      });
    }
  });
}

if (globalThis.window) {
  loadConfig();
  addEventListeners();
}
