import React, { useState } from 'react';
import {
  ShieldAlert,
  Calendar,
  MapPin,
  DollarSign,
  ExternalLink,
  Plus,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { CampStatus, CampType, IdCamp } from '../types/recruiting';

interface IdCampTabProps {
  camps: IdCamp[];
  budgetCeiling: number;
  onUpdateBudgetCeiling: (amount: number) => void;
  onUpdateCampStatus: (campId: string, status: CampStatus) => void;
  onAddCamp: (camp: IdCamp) => void;
}

const statusBadgeStyles: Record<CampStatus, string> = {
  Interested: 'bg-blue-50 text-blue-700 border-blue-200',
  Registered: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Attended: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  Declined: 'bg-slate-100 text-slate-500 border-slate-200',
};

export const IdCampTab: React.FC<IdCampTabProps> = ({
  camps,
  budgetCeiling,
  onUpdateBudgetCeiling,
  onUpdateCampStatus,
  onAddCamp,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [campName, setCampName] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('2027-06-20');
  const [cost, setCost] = useState(200);
  const [campType, setCampType] = useState<CampType>('Single-School ID');
  const [registrationUrl, setRegistrationUrl] = useState('https://');
  const [notes, setNotes] = useState('');

  const committedSpend = camps
    .filter((c) => c.status === 'Registered' || c.status === 'Attended')
    .reduce((sum, c) => sum + c.cost, 0);

  const plannedSpend = camps
    .filter((c) => c.status === 'Interested')
    .reduce((sum, c) => sum + c.cost, 0);

  const budgetPercent =
    budgetCeiling > 0 ? Math.min(100, Math.round((committedSpend / budgetCeiling) * 100)) : 0;

  const handleCreateCamp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim() || !campName.trim()) return;
    const newCamp: IdCamp = {
      id: `camp-custom-${Date.now()}`,
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

  return (
    <div className="space-y-6">
      {/* NCAA Compliance Banner */}
      <div className="rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-5 shadow-xs">
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
                Prior to <strong>June 15, 2027</strong> (end of Sophomore year), Division I
                and Division II coaches cannot initiate recruiting emails/calls or issue
                offers. <strong>Legal Exception:</strong> College coaches may respond to ID
                Camp registration, GK clinic curriculum, and campus logistics questions at
                any time.
              </p>
            </div>
          </div>
          <div className="shrink-0 rounded-lg border border-amber-300 bg-white px-4 py-2.5 text-center">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Direct Contact Opens
            </div>
            <div className="text-base font-extrabold text-slate-900">June 15, 2027</div>
          </div>
        </div>
      </div>

      {/* Budget Tracker Widget & Add Camp Button */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-2">
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
                onChange={(e) => onUpdateBudgetCeiling(Number(e.target.value) || 0)}
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

        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Track Custom ID Clinic or Showcase
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Add single-school GK clinics or multi-college showcases to your localStorage
              calendar.
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
                <option value="Multi-College Showcase">Multi-College Showcase</option>
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

      {/* Camp Card Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {camps.map((camp) => {
          const isPreJune15 = camp.startDate < '2027-06-15';
          return (
            <div
              key={camp.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                      {camp.campType}
                    </span>
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
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium">{camp.startDate}</span>
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
                        {camp.confirmedAttendingColleges.map((col, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                          >
                            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-500">Status:</label>
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
                </div>

                <a
                  href={camp.registrationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E3A8A] hover:underline"
                >
                  Registration Portal
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
