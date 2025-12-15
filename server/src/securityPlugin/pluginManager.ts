import { Injectable } from '@nestjs/common';

export interface Plugin {
  getName(): string;
  getVersion(): string;
}

@Injectable()
export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();

  registerPlugin(...plugins: Plugin[]): void {
    plugins.forEach(plugin => {
      this.plugins.set(plugin.getName(), plugin);
      console.log(`🔌 Plugin registered: ${plugin.getName()} v${plugin.getVersion()}`);
    });
  }

  getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  removePlugin(name: string): boolean {
    return this.plugins.delete(name);
  }
}