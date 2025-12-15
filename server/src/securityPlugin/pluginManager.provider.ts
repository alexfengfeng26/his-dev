import { Provider } from '@nestjs/common';
import { PluginManager } from './pluginManager';

export const PluginManagerProvider: Provider = {
  provide: PluginManager,
  useFactory: () => new PluginManager(),
};