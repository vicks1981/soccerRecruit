import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Mail,
  DollarSign,
  Users,
  ShieldAlert,
  Calendar,
  MapPin,
  Save,
  Tent,
  Star,
} from 'lucide-react';
import { SoccerProgram } from '../types/program';
import { IdCamp, OutreachLog } from '../types/recruiting';

interface ProgramDetailDrawerProps {
  program: SoccerProgram | null;
  isFavorite: boolean;
  outreachLogs: OutreachLog[];
  camps: IdCamp[];
  savedNote: string;
  onToggleFavorite: (programId: string) => void;
  onSaveNote: (programId: string, note: string) => void;
  onClose: () => void;
  onDraftOutreach: (program: SoccerProgram) => void;
}

export const ProgramDetailDrawer: React.FC<ProgramDetailDrawerProps> = ({
  program,
  isFavorite,
  outreachLogs,
  camps,
  savedNote,
  onToggleFavorite,
  onSaveNote,
  onClose,
  onDraftOutreach,
}) => {
  const [noteDraft, setNoteDraft] = useState(savedNote);
  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => {
    setNoteDraft(savedNote);
    setSavedBanner(false);
  }, [program, savedNote]);

  if (!program) return null;

  const programLogs = outreachLogs.filter((l) => l.programId === program.id);
  const relatedCamps = camps.filter(
    (c) =>
      c.programId === program.id ||
      c.confirmedAttendingColleges?.includes(program.schoolName)
  );
  const isD1OrD2 = program.division === 'D1' || program.division === 'D2';

  const handleSaveNote = () => {
    onSaveNote(program.id, noteDraft);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 bg-slate-900 px-6 py-5 text-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-200 border border-blue-400/30">
                {program.division}
              </span>
              <span className="text-xs font-medium text-slate-300">
                {program.conference}
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="flex items-center gap-1 text-xs text-slate-300">
                <MapPin className="h-3.5 w-3.5" />
                {program.city}, {program.state}
              </span>
            </div>
            <h2 className="mt-1.5 text-xl font-bold">{program.schoolName}</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggleFavorite(program.id)}
              title={
                isFavorite
                  ? 'Remove from Top-Choice Favorites'
                  : 'Add to Top-Choice Favorites'
              }
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                isFavorite
                  ? 'border-amber-400/50 bg-amber-400/20 text-amber-200 hover:bg-amber-400/30'
                  : 'border-white/20 bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Star
                className={`h-4 w-4 ${
                  isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                }`}
              />
              {isFavorite ? 'Favorited' : 'Favorite'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* NCAA Compliance Callout */}
          {isD1OrD2 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                NCAA {program.division} Pre-June 15, 2027 Rule Applies
              </div>
              <p className="mt-1 leading-relaxed text-amber-800">
                Prior to <strong>June 15, 2027</strong>, {program.division} coaches
                cannot initiate recruiting calls/emails or reply with personalized
                recruiting evaluations. They <strong>can</strong> respond to ID Camp
                and clinic logistics inquiries.
              </p>
            </div>
          )}

          {/* Quick External Links & Outreach CTA */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onDraftOutreach(program)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1E3A8A] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-900"
            >
              <Mail className="h-4 w-4" />
              Draft Email to Coaching Staff
            </button>
            <a
              href={program.mensSoccerUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Men&apos;s Soccer Site
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a
              href={program.rosterUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Official Roster
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            {program.campUrl && (
              <a
                href={program.campUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
              >
                ID Camp Portal
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {/* Coaching Staff */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Coaching Staff Contacts
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="text-xs font-medium text-slate-500">
                  {program.headCoach.title}
                </div>
                <div className="mt-0.5 font-semibold text-slate-900">
                  {program.headCoach.name}
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  {program.headCoach.email || 'Email via athletics directory'}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="text-xs font-medium text-slate-500">
                  {program.gkCoach?.title || 'Goalkeeper / Assistant Coach'}
                </div>
                <div className="mt-0.5 font-semibold text-slate-900">
                  {program.gkCoach?.name || 'Verify via Roster Scout Agent'}
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  {program.gkCoach?.email || 'Target in ID Camp inquiries'}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Profile */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <DollarSign className="h-4 w-4 text-slate-400" />
              Financial Profile &amp; Cost of Attendance
            </h3>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-[11px] font-medium text-slate-500">
                  In-State COA
                </div>
                <div className="mt-1 text-base font-bold text-slate-900">
                  $
                  {program.financialProfile.estimatedCostOfAttendanceInState.toLocaleString()}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-[11px] font-medium text-slate-500">
                  Out-of-State COA
                </div>
                <div className="mt-1 text-base font-bold text-slate-900">
                  $
                  {program.financialProfile.estimatedCostOfAttendanceOutOfState.toLocaleString()}
                </div>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 border border-blue-100">
                <div className="text-[11px] font-semibold text-[#1E3A8A]">
                  Avg. Net Price
                </div>
                <div className="mt-1 text-base font-bold text-[#1E3A8A]">
                  ${program.financialProfile.averageNetPrice.toLocaleString()}
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-600">
              <strong>Aid Structure:</strong>{' '}
              {program.financialProfile.financialAidNotes}
            </p>
          </div>

          {/* Goalkeeper Roster Depth */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Users className="h-4 w-4 text-slate-400" />
                Goalkeeper Depth Chart
              </h3>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                2029 Need: {program.classOf2029NeedScore}
              </span>
            </div>
            <div className="mt-3 divide-y divide-slate-100">
              {program.goalkeepers.map((gk, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <div>
                    <div className="font-semibold text-slate-900">{gk.name}</div>
                    <div className="text-xs text-slate-500">
                      {gk.height ? `${gk.height} • ` : ''}
                      {gk.hometown || 'Active Roster Goalkeeper'}
                    </div>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800">
                    Class: {gk.classYear}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Attending ID Camps */}
          {relatedCamps.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Tent className="h-4 w-4 text-slate-400" />
                Confirmed ID Camps &amp; Showcases ({relatedCamps.length})
              </h3>
              <div className="mt-3 space-y-2">
                {relatedCamps.map((camp) => (
                  <div
                    key={camp.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">
                        {camp.campName}
                      </div>
                      <div className="text-slate-500">
                        {camp.startDate} &bull; {camp.location}
                      </div>
                    </div>
                    <span className="rounded bg-white px-2 py-1 font-semibold text-slate-700 border border-slate-200">
                      ${camp.cost}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Personal Scouting Notes (localStorage) */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Personal Scouting &amp; Fit Notes
              </h3>
              {savedBanner && (
                <span className="text-xs font-semibold text-emerald-600">
                  Saved to localStorage!
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Add personal notes on playing style, academic majors, campus visit impressions, or ECNL sideline sightings..."
              className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-sm text-slate-900 focus:border-[#1E3A8A] focus:bg-white focus:outline-none"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveNote}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                <Save className="h-3.5 w-3.5" />
                Save Note
              </button>
            </div>
          </div>

          {/* Outreach History */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Calendar className="h-4 w-4 text-slate-400" />
              School Outreach History ({programLogs.length})
            </h3>
            {programLogs.length === 0 ? (
              <p className="mt-2 text-xs text-slate-500">
                No outreach logged for {program.schoolName} yet.
              </p>
            ) : (
              <div className="mt-3 space-y-2.5">
                {programLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        {log.category}
                      </span>
                      <span className="text-slate-500">{log.dateSent}</span>
                    </div>
                    <div className="mt-1 font-medium text-slate-700">
                      {log.subjectLine}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="rounded bg-white px-2 py-0.5 font-semibold text-slate-700 border border-slate-200">
                        {log.status}
                      </span>
                      {log.isPreContactRule && (
                        <span className="rounded bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">
                          Pre-Contact Rule (Logistics / ID Camp Only)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
