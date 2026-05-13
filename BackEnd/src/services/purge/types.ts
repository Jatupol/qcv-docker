// server/src/services/purge/types.ts
// Types shared by the purge target registry and the janitor.

export type PurgeTargetType = 'file' | 'db_table';

export interface PurgeTarget {
  /** Stable key — also the value of `purge_policy.target_key`. */
  readonly key: string;
  /** Human-readable label shown in admin UI. */
  readonly label: string;
  /** Whether this target operates on files or database rows. */
  readonly type: PurgeTargetType;
  /** Suggested retention used when seeding a new policy row. */
  readonly defaultRetentionDays: number;

  /**
   * Count what would be removed if `purge(retentionDays)` ran now.
   * Must NOT mutate any data.
   */
  count(retentionDays: number): Promise<number>;

  /**
   * Actually remove data older than the cutoff.
   * Returns the number of items removed.
   */
  purge(retentionDays: number): Promise<{ removed: number; details?: string[] }>;
}
