import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Calendar,
  MapPin,
  DollarSign,
  ExternalLink,
  Plus,
  Building2,
  CheckCircle2,
  Mail,
  Trash2,
  Star,
  Filter,
} from 'lucide-react';
import { CampStatus, CampType, IdCamp } from '../types/recruiting';
import { SoccerProgram } from '../types/program';
import { getLocalIsoDate } from './EmailTemplateModal';

interface IdCampTabProps {
  camps: IdCamp[];
  programs: SoccerProgram[];
  favoriteProgramIds: string[];
  budgetCeiling: number;
  onUpdateBudgetCeiling: (amount: number) => void;
  onUpdateCampStatus: (campId: string, status: CampStatus) => void;
  onAddCamp: (camp: IdCamp) => void;
  onDeleteCamp: (campId: string) => void;
  onInquireCamp: (camp: IdCamp) => void;
}

type CampFilterMode =
  | 'ALL'
  | 'UPCOMING'
  | 'GK_ONLY'
  | 'SHOWCASE'
  | 'COMMITTED'
  | 'FAVORITES';

const statusBadgeStyles: Record<CampStatus, string> = {
  Interested: 'bg-blue-50 text-blue-700 border-blue-200',
  Registered: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Attended: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  Declined: 'bg-slate-100 text-slate-500 border-slate-200',
};

export const IdCampTab: React.FC<IdCampTabProps> = ({
  camps,
  programs,
  favoriteProgramIds,
  budgetCeiling,
  onUpdateBudgetCeiling,
  onUpdateCampStatus,
  onAddCamp,
  onDeleteCamp,
  onInquireCamp,
}) => {
  const [filterMode, setFilterMode] = useState<CampFilterMode>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [campName, setCampName] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('2027-06-20');
  const [cost, setCost] = useState(200);
  const [campType, setCampType] = useState<CampType>('Single-School ID');
  const [registrationUrl, setRegistrationUrl] = useState('https://');
  const [notes, setNotes] = useState('');

  const todayIso = getLocalIsoDate();

  const favoriteSchoolNames = useMemo(() => {
    const set = new Set<string>();
    for (const p of programs) {
      if (favoriteProgramIds.includes(p.id)) {
        set.add(p.schoolName);
      }
    }
    return set;
  }, [programs, favoriteProgramIds]);

  const filteredCamps = useMemo(() => {
    return camps.filter((camp) => {
      if (filterMode === 'UPCOMING') return camp.startDate >= todayIso;
      if (filterMode === 'GK_ONLY') return camp.campType === 'GK-Specific Clinic';
      if (filterMode === 'SHOWCASE')
        return camp.campType === 'Multi-College Showcase';
      if (filterMode === 'COMMITTED')
        return camp.status === 'Registered' || camp.status === 'Attended';
      if (filterMode === 'FAVORITES') {
        if (camp.programId && favoriteProgramIds.includes(camp.programId)) {
          return true;
        }
        return (
          camp.confirmedAttendingColleges?.some((col) =>
            favoriteSchoolNames.has(col)
          ) ?? false
        );
      }
      return true;
    });
  }, [camps, filterMode, todayIso, favoriteProgramIds, favoriteSchoolNames]);

  const committedSpend = camps
    .filter((c) => c.status === 'Registered' || c.status === 'Attended')
    .reduce((sum, c) => sum + c.cost, 0);

  const plannedSpend = camps
    .filter((c) => c.status === 'Interested')
    .reduce((sum, c) => sum + c.cost, 0);

  const budgetPercent =
    budgetCeiling > 0
      ? Math.min(100, Math.round((committedSpend / budgetCeiling) * 100))
      : 0;

  const handleCreateCamp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim() || !campName.trim()) return;
    const matchedProgram = programs.find(
      (p) => p.schoolName.toLowerCase() === schoolName.trim().toLowerCase()
    );
    const newCamp: IdCamp = {
      id: `camp-custom-${Date.now()}`,
      programId: matchedProgram?.id,
      schoolName: schoolName.trim(),
      campName: campName.trim(),
      location: location.trim() || 'Campus Stadium',
      startDate,
      cost: Number(cost) || 0,
      campType,
      status: 'Interested',
      registrationUrl: registrationUrl.trim() || 'https://',
      confirmedAttendingColleges: [schoolName.trim()],
      notes: notes.trim() || undefined,
    };
    onAddCamp(newCamp);
    setSchoolName('');
    setCampName('');
    setLocation('');
    setNotes('');
    setShowAddForm(false);
  };

  const getRelativeTimingBadge = (dateStr: string) => {
    const today = new Date(`${todayIso}T00:00:00`);
    const target = new Date(`${dateStr}T00:00:00`);
    const diffDays = Math.round(
      (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 0) {
      return {
        label: 'Past Event',
        cls: 'bg-slate-100 text-slate-500 border-slate-200',
      };
    }
    if (diffDays === 0) {
      return {
        label: 'Today!',
        cls: 'bg-red-100 text-red-800 border-red-300',
      };
    }
    if (diffDays <= 14) {
      return {
        label: `In ${diffDays} day${diffDays === 1 ? '' : 's'}!`,
        cls: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      };
    }
    return {
      label: `In ${diffDays} days`,
      cls: 'bg-blue-50 text-blue-700 border-blue-200',
    };
  };

  return (
    <div className="space-y-6">
      {/* NCAA Compliance Banner */}
      <div className="rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-amber-100 p-2.5 text-amber-800">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-950">
                NCAA June 15, 2027 Direct Contact Rule Boundary
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-amber-900 max-w-3xl">
                Prior to <strong>June 15, 2027</strong> (end of Sophomore year),
                Division I and Division II coaches cannot initiate recruiting
                emails/calls or issue offers. <strong>Legal Exception:</strong>{' '}
                College coaches may respond to ID Camp registration, GK clinic
                curriculum, and campus logistics questions at any time.
              </p>
            </div>
          </div>
          <div className="shrink-0 rounded-lg border border-amber-300 bg-white px-4 py-2.5 text-center shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Direct Contact Opens
            </div>
            <div className="text-base font-extrabold text-slate-900">
              June 15, 2027
            </div>
          </div>
        </div>
      </div>

      {/* Budget Tracker Widget & Add Camp Button */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                <DollarSign className="h-4 w-4 text-[#1E3A8A]" />
                ID Camp &amp; Showcase Budget Tracker
              </h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900">
                  ${committedSpend.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">
                  registered/attended of{' '}
                  <strong>${budgetCeiling.toLocaleString()}</strong> ceiling (+$
                  {plannedSpend.toLocaleString()} interested)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-600">
                Budget Ceiling ($):
              </label>
              <input
                type="number"
                step={50}
                min={0}
                value={budgetCeiling}
                onChange={(e) =>
                  onUpdateBudgetCeiling(Number(e.target.value) || 0)
                }
                className="w-28 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-sm font-semibold text-slate-900 focus:border-[#1E3A8A] focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full transition-all ${
                committedSpend > budgetCeiling ? 'bg-red-600' : 'bg-[#1E3A8A]'
              }`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Track Custom ID Clinic or Showcase
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Add single-school GK clinics or multi-college showcases to your
              localStorage calendar.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#1E3A8A] px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-900 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {showAddForm ? 'Cancel New Camp' : 'Add ID Camp / Clinic'}
          </button>
        </div>
      </div>

      {/* Add Custom Camp Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateCamp}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
        >
          <h4 className="text-sm font-bold text-slate-900">
            Add Custom ID Camp or Goalkeeper Clinic
          </h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Host School / Organization *
              </label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="e.g., University of Pennsylvania"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Camp Name *
              </label>
              <input
                type="text"
                required
                value={campName}
                onChange={(e) => setCampName(e.target.value)}
                placeholder="e.g., Quaker Summer GK ID Clinic"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Rhodes Field, Philadelphia, PA"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Fee ($ USD)
              </label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Camp Type
              </label>
              <select
                value={campType}
                onChange={(e) => setCampType(e.target.value as CampType)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="Single-School ID">Single-School ID</option>
                <option value="GK-Specific Clinic">GK-Specific Clinic</option>
                <option value="Multi-College Showcase">
                  Multi-College Showcase
                </option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Registration URL
              </label>
              <input
                type="url"
                value={registrationUrl}
                onChange={(e) => setRegistrationUrl(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="GK coach evaluation details..."
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              Save Camp to Calendar
            </button>
          </div>
        </form>
      )}

      {/* Camp Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            Filter:
          </span>
          {(
            [
              { id: 'ALL', label: `All Camps (${camps.length})` },
              { id: 'UPCOMING', label: 'Upcoming Only' },
              { id: 'GK_ONLY', label: 'GK-Specific Clinics' },
              { id: 'SHOWCASE', label: 'Multi-College Showcases' },
              { id: 'COMMITTED', label: 'Registered / Attended' },
              {
                id: 'FAVORITES',
                label: `Favorites Attending (${favoriteProgramIds.length})`,
              },
            ] as { id: CampFilterMode; label: string }[]
          ).map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => setFilterMode(btn.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                filterMode === btn.id
                  ? 'bg-[#1E3A8A] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500">
          Showing <strong>{filteredCamps.length}</strong> camp(s)
        </span>
      </div>

      {/* Camp Card Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredCamps.map((camp) => {
          const isPreJune15 = camp.startDate < '2027-06-15';
          const timing = getRelativeTimingBadge(camp.startDate);
          const isCustom = camp.id.startsWith('camp-custom-');
          const hasFavoriteAttending =
            (camp.programId && favoriteProgramIds.includes(camp.programId)) ||
            (camp.confirmedAttendingColleges?.some((col) =>
              favoriteSchoolNames.has(col)
            ) ??
              false);

          return (
            <div
              key={camp.id}
              className={`flex flex-col justify-between rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md ${
                hasFavoriteAttending
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {camp.campType}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold ${timing.cls}`}
                      >
                        {timing.label}
                      </span>
                      {hasFavoriteAttending && (
                        <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-600" />
                          Favorite Attending
                        </span>
                      )}
                    </div>
                    <h4 className="mt-1.5 text-base font-bold text-slate-900">
                      {camp.campName}
                    </h4>
                    <div className="text-xs font-semibold text-[#1E3A8A]">
                      {camp.schoolName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-extrabold text-slate-900">
                      ${camp.cost}
                    </div>
                    <span
                      className={`mt-1 inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                        statusBadgeStyles[camp.status]
                      }`}
                    >
                      {camp.status}
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex flex-wrap items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium">
                      {camp.startDate}
                      {camp.endDate ? ` to ${camp.endDate}` : ''}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        isPreJune15
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isPreJune15
                        ? 'Pre-June 15 Window'
                        : 'Post-June 15 Direct Contact Open'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{camp.location}</span>
                  </div>
                </div>

                {camp.notes && (
                  <p className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-100">
                    {camp.notes}
                  </p>
                )}

                {camp.confirmedAttendingColleges &&
                  camp.confirmedAttendingColleges.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <Building2 className="h-3.5 w-3.5" />
                        Confirmed Attending Programs (
                        {camp.confirmedAttendingColleges.length})
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {camp.confirmedAttendingColleges.map((col, idx) => {
                          const isFav = favoriteSchoolNames.has(col);
                          return (
                            <span
                              key={idx}
                              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium ${
                                isFav
                                  ? 'bg-amber-100 text-amber-900 font-semibold border border-amber-300'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {isFav ? (
                                <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-600" />
                              ) : (
                                <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                              )}
                              {col}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-500">
                    Status:
                  </label>
                  <select
                    value={camp.status}
                    onChange={(e) =>
                      onUpdateCampStatus(camp.id, e.target.value as CampStatus)
                    }
                    className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 focus:border-[#1E3A8A] focus:outline-none"
                  >
                    <option value="Interested">Interested</option>
                    <option value="Registered">Registered</option>
                    <option value="Attended">Attended</option>
                    <option value="Declined">Declined</option>
                  </select>
                  {isCustom && (
                    <button
                      type="button"
                      onClick={() => onDeleteCamp(camp.id)}
                      title="Delete Custom Camp"
                      className="rounded-lg border border-slate-200 p-1 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onInquireCamp(camp)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 px-2.5 py-1 text-xs font-semibold text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Ask Coach (GK Inquiry)
                  </button>
                  <a
                    href={camp.registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E3A8A] hover:underline"
                  >
                    Portal
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
