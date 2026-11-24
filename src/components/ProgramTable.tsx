import React from 'react';
import {
  Mail,
  ExternalLink,
  ChevronRight,
  Shield,
  Users,
  Clock,
  MessageSquare,
  Star,
  ArrowUpDown,
} from 'lucide-react';
import { ClassNeedScore, Division, SoccerProgram } from '../types/program';
import { SortField } from './FilterBar';

interface ProgramTableProps {
  programs: SoccerProgram[];
  favoriteProgramIds: string[];
  outreachCountsByProgram: Record<string, number>;
  customNotesByProgram: Record<string, string>;
  sortBy: SortField;
  sortAsc: boolean;
  onSortColumn: (field: SortField) => void;
  onFilterConference: (conference: string) => void;
  onToggleFavorite: (programId: string) => void;
  onSelectProgram: (program: SoccerProgram) => void;
  onDraftOutreach: (program: SoccerProgram) => void;
}

const divisionBadgeStyle: Record<Division, string> = {
  D1: 'bg-blue-100 text-blue-800 border-blue-200',
  D2: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  D3: 'bg-slate-100 text-slate-700 border-slate-300',
};

const needBadgeStyle: Record<ClassNeedScore, string> = {
  High: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Medium: 'bg-amber-100 text-amber-800 border-amber-300',
  Low: 'bg-slate-100 text-slate-600 border-slate-300',
  Unverified: 'bg-purple-50 text-purple-700 border-purple-200',
};

export const ProgramTable: React.FC<ProgramTableProps> = ({
  programs,
  favoriteProgramIds,
  outreachCountsByProgram,
  customNotesByProgram,
  sortBy,
  sortAsc,
  onSortColumn,
  onFilterConference,
  onToggleFavorite,
  onSelectProgram,
  onDraftOutreach,
}) => {
  if (programs.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <Shield className="mx-auto h-10 w-10 text-slate-300" />
        <h3 className="mt-3 text-base font-semibold text-slate-800">
          No programs match your current filters
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Try toggling off the Favorites filter or expanding your Max Net Price, state,
          or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onSortColumn('schoolName')}
                    className="inline-flex items-center gap-1 hover:text-slate-900"
                  >
                    <span>School Name &amp; Location</span>
                    <ArrowUpDown
                      className={`h-3.5 w-3.5 ${
                        sortBy === 'schoolName' ? 'text-[#1E3A8A]' : 'text-slate-400'
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => onSortColumn('driveTime')}
                    title="Sort by Drive Time from Delco"
                    className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold normal-case ${
                      sortBy === 'driveTime'
                        ? 'bg-[#1E3A8A] text-white'
                        : 'bg-slate-200/70 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Clock className="h-2.5 w-2.5" />
                    Drive {sortBy === 'driveTime' ? (sortAsc ? '↑' : '↓') : ''}
                  </button>
                </div>
              </th>
              <th className="px-3 py-3.5">Division</th>
              <th className="px-4 py-3.5">Head Coach &amp; GK Coach</th>
              <th className="px-4 py-3.5">GK Roster Depth</th>
              <th className="px-3 py-3.5">
                <button
                  type="button"
                  onClick={() => onSortColumn('needScore')}
                  className="inline-flex items-center gap-1 hover:text-slate-900"
                >
                  <span>2029 Need</span>
                  <ArrowUpDown
                    className={`h-3.5 w-3.5 ${
                      sortBy === 'needScore' ? 'text-[#1E3A8A]' : 'text-slate-400'
                    }`}
                  />
                </button>
              </th>
              <th className="px-4 py-3.5">
                <button
                  type="button"
                  onClick={() => onSortColumn('netPrice')}
                  className="inline-flex items-center gap-1 hover:text-slate-900"
                >
                  <span>Est. Net Price</span>
                  <ArrowUpDown
                    className={`h-3.5 w-3.5 ${
                      sortBy === 'netPrice' ? 'text-[#1E3A8A]' : 'text-slate-400'
                    }`}
                  />
                </button>
              </th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {programs.map((program) => {
              const isFavorite = favoriteProgramIds.includes(program.id);
              const underclassCount = program.goalkeepers.filter((g) =>
                ['FR', 'SO'].includes(g.classYear)
              ).length;
              const upperclassCount = program.goalkeepers.filter((g) =>
                ['JR', 'SR', 'GR'].includes(g.classYear)
              ).length;
              const outreachCount = outreachCountsByProgram[program.id] || 0;
              const hasCustomNote = Boolean(customNotesByProgram[program.id]?.trim());

              return (
                <tr
                  key={program.id}
                  className={`transition-colors ${
                    isFavorite
                      ? 'bg-amber-50/40 hover:bg-amber-50/70'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* 1. School Name & Location */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={() => onToggleFavorite(program.id)}
                          title={
                            isFavorite
                              ? 'Remove from Top-Choice Favorites'
                              : 'Add to Top-Choice Favorites'
                          }
                          className="mt-0.5 rounded-md p-1 text-slate-400 transition-colors hover:bg-amber-100/60 hover:text-amber-500"
                        >
                          <Star
                            className={`h-4 w-4 ${
                              isFavorite
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-slate-300 hover:text-amber-400'
                            }`}
                          />
                        </button>
                        <div>
                          <button
                            type="button"
                            onClick={() => onSelectProgram(program)}
                            className="font-semibold text-slate-900 hover:text-[#1E3A8A] hover:underline text-left"
                          >
                            {program.schoolName}
                          </button>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                            <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700">
                              {program.state}
                            </span>
                            <span>{program.city}</span>
                            <span>&bull;</span>
                            <button
                              type="button"
                              onClick={() => onFilterConference(program.conference)}
                              title={`Filter by ${program.conference}`}
                              className="font-medium text-slate-600 hover:text-[#1E3A8A] hover:underline"
                            >
                              {program.conference}
                            </button>
                            {program.estimatedDriveHoursFromDelco !== undefined && (
                              <>
                                <span>&bull;</span>
                                <span
                                  className={`inline-flex items-center gap-0.5 ${
                                    program.estimatedDriveHoursFromDelco <= 4
                                      ? 'text-emerald-700'
                                      : 'text-amber-700'
                                  }`}
                                >
                                  <Clock className="h-3 w-3" />
                                  {program.estimatedDriveHoursFromDelco}h
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {hasCustomNote && (
                          <span
                            title="Has saved scouting note"
                            className="inline-flex items-center rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200"
                          >
                            Note
                          </span>
                        )}
                        {outreachCount > 0 && (
                          <span
                            title={`${outreachCount} outreach log(s)`}
                            className="inline-flex items-center gap-0.5 rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-700 border border-blue-200"
                          >
                            <MessageSquare className="h-3 w-3" />
                            {outreachCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 2. Division */}
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-bold ${
                        divisionBadgeStyle[program.division]
                      }`}
                    >
                      {program.division}
                    </span>
                  </td>

                  {/* 3. Head Coach & GK Coach */}
                  <td className="px-4 py-3.5">
                    <div className="text-slate-900 font-medium">
                      {program.headCoach.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {program.gkCoach ? (
                        <span>GK: {program.gkCoach.name}</span>
                      ) : (
                        <span>Head Coach</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onDraftOutreach(program)}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#1E3A8A] hover:underline"
                    >
                      <Mail className="h-3 w-3" />
                      {program.headCoach.email || 'Draft Email'}
                    </button>
                  </td>

                  {/* 4. GK Roster Depth */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        {underclassCount} Under / {upperclassCount} Upper
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {program.goalkeepers.map((gk, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-700"
                        >
                          <span className="font-medium">{gk.name}</span>
                          <span className="rounded bg-white px-1 text-[10px] font-bold text-slate-600">
                            {gk.classYear}
                          </span>
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* 5. 2029 Need Score */}
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        needBadgeStyle[program.classOf2029NeedScore]
                      }`}
                    >
                      {program.classOf2029NeedScore} Need
                    </span>
                  </td>

                  {/* 6. Estimated Net Price */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">
                      ${program.financialProfile.averageNetPrice.toLocaleString()}
                      <span className="text-xs font-normal text-slate-500">/yr</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[170px]">
                      {program.financialProfile.financialAidNotes}
                    </div>
                  </td>

                  {/* 7. Actions */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onDraftOutreach(program)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 px-2.5 py-1.5 text-xs font-semibold text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white transition-colors"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Draft
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectProgram(program)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        Details
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                      <a
                        href={program.rosterUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Open Official Roster"
                        className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
