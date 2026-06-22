// client/src/components/generic-page/EntityColumnHelper.ts
// Column Configuration Helper for Entity Tables
// Complete Separation Entity Architecture - Reusable column definitions

import { type TableColumn } from './EntityDataTable';

// ============ INTERFACES ============

export interface EntityData {
  id?: number | string;
  code?: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface ColumnConfig {
  includeSequence?: boolean;
  includeId?: boolean;
  includeCode?: boolean;
  includeName?: boolean;
  includeDescription?: boolean;
  includeStatus?: boolean;
  includeCreated?: boolean;
  includeActions?: boolean;
  customColumns?: TableColumn<any>[];
}

// ============ COLUMN FACTORY FUNCTIONS ============

/**
 * Generate standard columns for ID-based entities (SERIAL ID pattern)
 */
export const createIdEntityColumns = (config: ColumnConfig = {}): TableColumn<EntityData>[] => {
  const {
    includeId = true,
    includeName = true,
    includeDescription = true,
    includeStatus = true,
    includeCreated = true,
    includeActions = true,
    customColumns = []
  } = config;

  const columns: TableColumn<EntityData>[] = [];

  // ID Column (for SERIAL ID entities)
  if (includeId) {
    columns.push({
      key: 'id',
      label: 'ID',
      sortable: true,
      className: 'w-20'
    });
  }

  // Name Column
  if (includeName) {
    columns.push({
      key: 'name',
      label: 'Name',
      sortable: true,
      className: 'min-w-0 flex-1'
    });
  }

  // Description Column
  if (includeDescription) {
    columns.push({
      key: 'description',
      label: 'Description',
      sortable: false,
      className: 'max-w-xs'
    });
  }

  // Status Column
  if (includeStatus) {
    columns.push({
      key: 'is_active',
      label: 'Status',
      sortable: true,
      className: 'w-24'
    });
  }

  // Created Date Column
  if (includeCreated) {
    columns.push({
      key: 'created_at',
      label: 'Created',
      sortable: true,
      className: 'w-32'
    });
  }

  // Custom Columns
  columns.push(...customColumns);

  // Actions Column
  if (includeActions) {
    columns.push({
      key: 'actions',
      label: 'Actions',
      sortable: false,
      className: 'w-40'
    });
  }

  return columns;
};

/**
 * Generate standard columns for CODE-based entities (VARCHAR CODE pattern)
 */
export const createCodeEntityColumns = (config: ColumnConfig = {}): TableColumn<EntityData>[] => {
  const {
    includeCode = true,
    includeName = true,
    includeDescription = false,
    includeStatus = true,
    includeCreated = true,
    includeActions = true,
    customColumns = []
  } = config;

  const columns: TableColumn<EntityData>[] = [];

  // Code Column (for VARCHAR CODE entities)
  if (includeCode) {
    columns.push({
      key: 'code',
      label: 'Code',
      sortable: true,
      className: 'w-24'
    });
  }

  // Name Column
  if (includeName) {
    columns.push({
      key: 'name',
      label: 'Name',
      sortable: true,
      className: 'min-w-0 flex-1'
    });
  }

  // Description Column (optional for CODE entities)
  if (includeDescription) {
    columns.push({
      key: 'description',
      label: 'Description',
      sortable: false,
      className: 'max-w-xs'
    });
  }

  // Status Column
  if (includeStatus) {
    columns.push({
      key: 'is_active',
      label: 'Status',
      sortable: true,
      className: 'w-24'
    });
  }

  // Created Date Column
  if (includeCreated) {
    columns.push({
      key: 'created_at',
      label: 'Created',
      sortable: true,
      className: 'w-32'
    });
  }

  // Custom Columns
  columns.push(...customColumns);

  // Actions Column
  if (includeActions) {
    columns.push({
      key: 'actions',
      label: 'Actions',
      sortable: false,
      className: 'w-40'
    });
  }

  return columns;
};

/**
 * Generate columns for special entity patterns (composite keys, etc.)
 */
export const createSpecialEntityColumns = (
  primaryColumns: TableColumn<EntityData>[],
  config: ColumnConfig = {}
): TableColumn<EntityData>[] => {
  const {
    includeStatus = true,
    includeCreated = true,
    includeActions = true,
    customColumns = []
  } = config;

  const columns: TableColumn<EntityData>[] = [...primaryColumns];

  // Status Column
  if (includeStatus) {
    columns.push({
      key: 'is_active',
      label: 'Status',
      sortable: true,
      className: 'w-24'
    });
  }

  // Created Date Column
  if (includeCreated) {
    columns.push({
      key: 'created_at',
      label: 'Created',
      sortable: true,
      className: 'w-32'
    });
  }

  // Custom Columns
  columns.push(...customColumns);

  // Actions Column
  if (includeActions) {
    columns.push({
      key: 'actions',
      label: 'Actions',
      sortable: false,
      className: 'w-40'
    });
  }

  return columns;
};

// ============ PREDEFINED COLUMN SETS ============

/**
 * Standard columns for ID entities (SERIAL ID entities)
 */
export const DEFECT_COLUMNS = createIdEntityColumns({
  includeId: true,
  includeDescription: true
});

export const SAMPLING_REASON_COLUMNS = createIdEntityColumns({
  includeId: false,
  includeDescription: true
});

export const SYSCONFIG_COLUMNS = createIdEntityColumns({
  includeDescription: true,
  customColumns: [
    {
      key: 'config_key',
      label: 'Config Key',
      sortable: true,
      className: 'w-48'
    },
    {
      key: 'config_value',
      label: 'Config Value',
      sortable: true,
      className: 'min-w-0 flex-1'
    }
  ]
});

/**
 * Standard columns for CODE entities (VARCHAR CODE entities)
 */
export const CUSTOMER_COLUMNS = createCodeEntityColumns({
  includeDescription: false
});

/**
 * Special entity columns
 */
export const PARTS_COLUMNS = createSpecialEntityColumns([
  {
    key: 'partno',
    label: 'Part Number',
    sortable: true,
    className: 'w-48'
  },
  {
    key: 'product_families',
    label: 'Product Family',
    sortable: true,
    className: 'w-32'
  },
  {
    key: 'customer',
    label: 'Customer',
    sortable: true,
    className: 'w-24'
  },
  {
    key: 'production_site',
    label: 'Site',
    sortable: true,
    className: 'w-24'
  }
]);

export const CUSTOMER_SITE_COLUMNS = createSpecialEntityColumns([
  {
    key: 'code',
    label: 'Code',
    sortable: true,
    className: 'w-32'
  },
  {
    key: 'customers',
    label: 'Customer',
    sortable: true,
    className: 'w-24'
  },
  {
    key: 'site',
    label: 'Site',
    sortable: true,
    className: 'w-24'
  }
]);

export const INF_CHECKIN_COLUMNS = createSpecialEntityColumns([
  {
    key: 'id',
    label: 'ID',
    sortable: true,
    className: 'w-48'
  },
  {
    key: 'line_no_id',
    label: 'Line No',
    sortable: true,
    className: 'w-24'
  },
  {
    key: 'username',
    label: 'Username',
    sortable: true,
    className: 'w-32'
  },
  {
    key: 'group_code',
    label: 'Group',
    sortable: true,
    className: 'w-24'
  },
  {
    key: 'work_shift_id',
    label: 'Shift',
    sortable: true,
    className: 'w-24'
  },
  {
    key: 'created_on',
    label: 'Check In',
    sortable: true,
    className: 'w-32'
  }
], {
  includeCreated: false // Use created_on instead
});

export const INF_LOTINPUT_COLUMNS = createSpecialEntityColumns([
  {
    key: 'id',
    label: 'ID',
    sortable: true,
    className: 'w-48'
  },
  {
    key: 'lotno',
    label: 'Lot Number',
    sortable: true,
    className: 'w-32'
  },
  {
    key: 'partsite',
    label: 'Part Site',
    sortable: true,
    className: 'w-24'
  },
  {
    key: 'lineno',
    label: 'Line No',
    sortable: true,
    className: 'w-24'
  },
  {
    key: 'model',
    label: 'Model',
    sortable: true,
    className: 'w-32'
  },
  {
    key: 'inputdate',
    label: 'Input Date',
    sortable: true,
    className: 'w-32'
  }
], {
  includeCreated: false // Use inputdate instead
});

export const INSPECTIONDATA_COLUMNS = createSpecialEntityColumns([
  {
    key: 'id',
    label: 'ID',
    sortable: true,
    className: 'w-20'
  },
  {
    key: 'inspection_no',
    label: 'Sampling No',
    sortable: true,
    className: 'w-32'
  },
  {
    key: 'station',
    label: 'Station',
    sortable: true,
    className: 'w-24'
  },
  {
    key: 'lotno',
    label: 'Lot No',
    sortable: true,
    className: 'w-32'
  },
  {
    key: 'model',
    label: 'Model',
    sortable: true,
    className: 'w-32'
  },
  {
    key: 'shift',
    label: 'Shift',
    sortable: true,
    className: 'w-20'
  },
  {
    key: 'inspection_date',
    label: 'Sampling Date',
    sortable: true,
    className: 'w-32'
  },
  {
    key: 'judgment',
    label: 'Judgment',
    sortable: true,
    className: 'w-24'
  }
], {
  includeStatus: false, // No is_active field in inspectiondata
  includeCreated: false // Use inspection_date instead
});

// ============ UTILITY FUNCTIONS ============

/**
 * Get column configuration by entity type
 */
export const getColumnsByEntityType = (entityType: string): TableColumn<EntityData>[] => {
  const columnMap: Record<string, TableColumn<EntityData>[]> = {
    // SERIAL ID entities
    'defect': DEFECT_COLUMNS,
    'defects': DEFECT_COLUMNS,
    'sampling-reason': SAMPLING_REASON_COLUMNS,
    'sampling-reasons': SAMPLING_REASON_COLUMNS,
    'samplingreason': SAMPLING_REASON_COLUMNS,
    'sysconfig': SYSCONFIG_COLUMNS,
    'sysconfigs': SYSCONFIG_COLUMNS,
    
    // VARCHAR CODE entities
    'customer': CUSTOMER_COLUMNS,
    'customers': CUSTOMER_COLUMNS,
    
    // Special entities
    'parts': PARTS_COLUMNS,
    'customer-site': CUSTOMER_SITE_COLUMNS,
    'customer-sites': CUSTOMER_SITE_COLUMNS,
    'inf-checkin': INF_CHECKIN_COLUMNS,
    'inf-lotinput': INF_LOTINPUT_COLUMNS,
    'inspectiondata': INSPECTIONDATA_COLUMNS
  };

  return columnMap[entityType.toLowerCase()] || createIdEntityColumns();
};

/**
 * Determine if entity uses ID or CODE pattern
 */
export const getEntityPattern = (entityType: string): 'id' | 'code' | 'special' => {
  const idEntities = ['defect', 'defects', 'sampling-reason', 'sampling-reasons', 'samplingreason', 'sysconfig', 'sysconfigs'];
  const codeEntities = ['customer', 'customers'];
  const specialEntities = ['parts', 'customer-site', 'customer-sites', 'inf-checkin', 'inf-lotinput', 'inspectiondata'];

  const type = entityType.toLowerCase();
  
  if (idEntities.includes(type)) return 'id';
  if (codeEntities.includes(type)) return 'code';
  if (specialEntities.includes(type)) return 'special';
  
  return 'id'; // Default to ID pattern
};

 