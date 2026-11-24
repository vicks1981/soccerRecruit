import React from 'react';
import { Search, MapPin, Target, DollarSign, RotateCcw, Clock, Star } from 'lucide-react';
import { ClassNeedScore, StateCode } from '../types/program';

export interface FilterState {
  searchQuery: string;
  state: 'ALL' | StateCode;
  needScore: 'ALL' | ClassNeedScore;
  maxNetPrice: number;
  withinFourHoursOfDelco: boolean;
  favoritesOnly: boolean;
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
  resultCount: number;
  totalCount: number;
  favoritesCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  onReset,
  resultCount,
  totalCount,
  favoritesCount,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 items-end">
        {/* Search Bar */}
        <div className="md:col-span-3">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Search className="h-3.5 w-3.5" />
            Search School, City, or Coach
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
              placeholder="e.g., Villanova, Ivy League, Fetrow..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1E3A8A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20"
            />
          </div>
        </div>

        {/* State Dropdown */}
        <div className="md:col-span-2">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            State
          </label>
          <select
            value={filters.state}
            onChange={(e) =>
              onChange({ ...filters, state: e.target.value as 'ALL' | StateCode })
            }
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-[#1E3A8A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20"
          >
            <option value="ALL">All States (PA/NJ/DE/MD)</option>
            <option value="PA">Pennsylvania (PA)</option>
            <option value="NJ">New Jersey (NJ)</option>
            <option value="DE">Delaware (DE)</option>
            <option value="MD">Maryland (MD)</option>
          </select>
        </div>

        {/* 2029 Need Score Filter */}
        <div className="md:col-span-2">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Target className="h-3.5 w-3.5" />
            2029 GK Need
          </label>
          <select
            value={filters.needScore}
            onChange={(e) =>
              onChange({
                ...filters,
                needScore: e.target.value as 'ALL' | ClassNeedScore,
              })
            }
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-[#1E3A8A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20"
          >
            <option value="ALL">All Need Levels</option>
            <option value="High">High Need (JR/SR Starter)</option>
            <option value="Medium">Medium Need (SO Depth)</option>
            <option value="Low">Low Need (FR/3+ Underclass)</option>
            <option value="Unverified">Unverified</option>
          </select>
        </div>

        {/* Max Net Price Slider */}
        <div className="md:col-span-2">
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              Max Net Price
            </span>
            <span className="font-bold text-[#1E3A8A]">
              ${filters.maxNetPrice.toLocaleString()}/yr
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={45000}
            step={1000}
            value={filters.maxNetPrice}
            onChange={(e) =>
              onChange({ ...filters, maxNetPrice: Number(e.target.value) })
            }
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#1E3A8A]"
          />
        </div>

        {/* Favorites Only + Delco 4h Radius + Reset */}
        <div className="md:col-span-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() =>
              onChange({ ...filters, favoritesOnly: !filters.favoritesOnly })
            }
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
              filters.favoritesOnly
                ? 'border-amber-400 bg-amber-50 text-amber-900 shadow-xs ring-2 ring-amber-400/20'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Star
              className={`h-3.5 w-3.5 ${
                filters.favoritesOnly
                  ? 'fill-amber-400 text-amber-500'
                  : 'text-slate-400'
              }`}
            />
            <span>Favorites</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[11px] font-bold ${
                filters.favoritesOnly
                  ? 'bg-amber-200/70 text-amber-950'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {favoritesCount}
            </span>
          </button>

          <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100">
            <input
              type="checkbox"
              checked={filters.withinFourHoursOfDelco}
              onChange={(e) =>
                onChange({ ...filters, withinFourHoursOfDelco: e.target.checked })
              }
              className="h-3.5 w-3.5 rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A]"
            />
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              &le; 4h
            </span>
          </label>

          <button
            type="button"
            onClick={onReset}
            title="Reset Filters"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500">
        <span>
          Showing <strong className="text-slate-800">{resultCount}</strong> of{' '}
          <strong className="text-slate-800">{totalCount}</strong> NCAA Men&apos;s Soccer
          programs
          {filters.favoritesOnly && (
            <span className="ml-2 inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-900">
              ★ Favorites Only Filter Active
            </span>
          )}
        </span>
        <span>
          Base Location: <strong>Delaware County, PA (Delco)</strong> &bull; Target
          Grad Class: <strong>2029 (GK)</strong>
        </span>
      </div>
    </div>
  );
};
