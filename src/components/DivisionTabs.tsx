import React from 'react';
import { Division, SoccerProgram } from '../types/program';

export type DivisionFilter = 'ALL' | Division;

interface DivisionTabsProps {
  programs: SoccerProgram[];
  selectedDivision: DivisionFilter;
  onSelectDivision: (division: DivisionFilter) => void;
}

export const DivisionTabs: React.FC<DivisionTabsProps> = ({
  programs,
  selectedDivision,
  onSelectDivision,
}) => {
  const counts = {
    ALL: programs.length,
    D1: programs.filter((p) => p.division === 'D1').length,
    D2: programs.filter((p) => p.division === 'D2').length,
    D3: programs.filter((p) => p.division === 'D3').length,
  };

  const tabs: { id: DivisionFilter; label: string; count: number; subtitle: string }[] = [
    { id: 'ALL', label: 'All Programs', count: counts.ALL, subtitle: 'PA / NJ / DE / MD' },
    { id: 'D1', label: 'Division I', count: counts.D1, subtitle: 'June 15 Contact Rule' },
    { id: 'D2', label: 'Division II', count: counts.D2, subtitle: 'June 15 Contact Rule' },
    { id: 'D3', label: 'Division III', count: counts.D3, subtitle: 'Open Academic / Recruiting' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map((tab) => {
        const isActive = selectedDivision === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectDivision(tab.id)}
            className={`group flex items-center gap-2.5 rounded-full px-4 py-2 text-sm font-semibold transition-all shadow-sm ${
              isActive
                ? 'bg-[#1E3A8A] text-white shadow-md ring-2 ring-[#1E3A8A]/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
