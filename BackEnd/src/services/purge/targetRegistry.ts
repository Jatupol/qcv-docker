// server/src/services/purge/targetRegistry.ts
// In-process registry of PurgeTarget implementations, keyed by target_key.
// The janitor consults this to find the code that owns each policy row.

import type { PurgeTarget } from './types';

class TargetRegistry {
  private targets = new Map<string, PurgeTarget>();

  register(target: PurgeTarget): void {
    if (this.targets.has(target.key)) {
      throw new Error(`Purge target "${target.key}" already registered`);
    }
    this.targets.set(target.key, target);
  }

  get(key: string): PurgeTarget | undefined {
    return this.targets.get(key);
  }

  list(): PurgeTarget[] {
    return Array.from(this.targets.values());
  }

  has(key: string): boolean {
    return this.targets.has(key);
  }
}

export const purgeTargetRegistry = new TargetRegistry();
