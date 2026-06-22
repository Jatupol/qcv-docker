// client/src/components/dashboard/GroupByTimePeriodBar.tsx
import React from 'react';
import type { GroupByDimension, TimePeriod } from '../../types/report';

interface Props {
  groupBy: GroupByDimension;
  timePeriod: TimePeriod;
  onGroupByChange: (v: GroupByDimension) => void;
  onTimePeriodChange: (v: TimePeriod) => void;
}

const GROUP_BY_OPTIONS: { value: GroupByDimension; label: string }[] = [
  { value: 'production_site', label: 'Production Site' },
  { value: 'customer_site',   label: 'Customer Site'   },
  { value: 'product_family',  label: 'Product Family'  },
  { value: 'product_type',    label: 'Product Type'    },
  { value: 'model',           label: 'Product'         },
];

const TIME_PERIOD_OPTIONS: { value: TimePeriod; label: string }[] = [
  { value: 'daily',         label: 'Daily'         },
  { value: 'fiscal_weekly', label: 'Weekly (FW)'   },
  { value: 'monthly',       label: 'Monthly'       },
  { value: 'quarterly',     label: 'Quarterly'     },
  { value: 'yearly',        label: 'Yearly'        },
];

const GroupByTimePeriodBar: React.FC<Props> = ({ groupBy, timePeriod, onGroupByChange, onTimePeriodChange }) => {
  const activeCls = 'bg-blue-600 text-white';
  const inactiveCls = 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50';

  return (
    <div className="flex flex-col gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-gray-500 w-16 shrink-0">Group By:</span>
        {GROUP_BY_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onGroupByChange(opt.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${groupBy === opt.value ? activeCls : inactiveCls}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-gray-500 w-16 shrink-0">Show By:</span>
        {TIME_PERIOD_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onTimePeriodChange(opt.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${timePeriod === opt.value ? activeCls : inactiveCls}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GroupByTimePeriodBar;
