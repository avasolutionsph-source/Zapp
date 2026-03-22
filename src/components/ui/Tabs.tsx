import { type ReactNode } from 'react';
import clsx from 'clsx';

export interface Tab {
  key: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, children, className }: TabsProps) {
  return (
    <div className={className}>
      <div className="border-b border-gray-200" role="tablist">
        <nav className="-mb-px flex gap-6 px-1" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.key}`}
                onClick={() => onChange(tab.key)}
                className={clsx(
                  'inline-flex items-center gap-2 whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-zapp-orange text-zapp-orange'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                {tab.icon && <span className="shrink-0">{tab.icon}</span>}
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div role="tabpanel" id={`panel-${activeTab}`} className="pt-4">
        {children}
      </div>
    </div>
  );
}
