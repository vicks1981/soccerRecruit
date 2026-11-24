import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Send,
  ShieldAlert,
  UserCheck,
  ExternalLink,
} from 'lucide-react';
import { GK_EMAIL_TEMPLATES } from '../data/emailTemplates';
import { SoccerProgram } from '../types/program';
import {
  AthleteProfile,
  IdCamp,
  OutreachLog,
  OutreachStatus,
} from '../types/recruiting';

interface EmailTemplateModalProps {
  isOpen: boolean;
  initialProgram: SoccerProgram | null;
  initialCamp?: IdCamp | null;
  initialTemplateId?: string;
  programs: SoccerProgram[];
  camps: IdCamp[];
  athleteProfile: AthleteProfile;
  onUpdateAthleteProfile: (profile: AthleteProfile) => void;
  onLogOutreach: (log: OutreachLog) => void;
  onClose: () => void;
}

const NCAA_CONTACT_CUTOFF = '2027-06-15';

export function getLocalIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const EmailTemplateModal: React.FC<EmailTemplateModalProps> = ({
  isOpen,
  initialProgram,
  initialCamp,
  initialTemplateId,
  programs,
  camps,
  athleteProfile,
  onUpdateAthleteProfile,
  onLogOutreach,
  onClose,
}) => {
  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    initialProgram?.id || programs[0]?.id || 'penn'
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialTemplateId || GK_EMAIL_TEMPLATES[0].id
  );
  const [subjectLine, setSubjectLine] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [coachEmail, setCoachEmail] = useState('');
  const [statusToLog, setStatusToLog] = useState<OutreachStatus>('Sent');
  const [copied, setCopied] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  useEffect(() => {
    if (initialProgram) {
      setSelectedProgramId(initialProgram.id);
    }
  }, [initialProgram]);

  useEffect(() => {
    if (initialTemplateId) {
      setSelectedTemplateId(initialTemplateId);
    } else if (initialCamp) {
      setSelectedTemplateId('campInquiry');
    }
  }, [initialTemplateId, initialCamp]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const targetProgram =
    programs.find((p) => p.id === selectedProgramId) || programs[0];
  const selectedTemplate =
    GK_EMAIL_TEMPLATES.find((t) => t.id === selectedTemplateId) ||
    GK_EMAIL_TEMPLATES[0];

  useEffect(() => {
    if (!targetProgram || !selectedTemplate) return;
    const coachLastName =
      targetProgram.headCoach.name.split(' ').slice(-1)[0] ||
      targetProgram.headCoach.name;

    // Find matching upcoming camp for token replacement
    const matchingCamp =
      (initialCamp &&
      (initialCamp.programId === targetProgram.id ||
        initialCamp.confirmedAttendingColleges?.includes(
          targetProgram.schoolName
        ))
        ? initialCamp
        : null) ||
      camps.find(
        (c) =>
          c.programId === targetProgram.id ||
          c.confirmedAttendingColleges?.includes(targetProgram.schoolName)
      );

    const campNameToken = matchingCamp
      ? matchingCamp.campName
      : `${targetProgram.schoolName} Men's Soccer Prospect ID Camp`;
    const campDateToken = matchingCamp ? matchingCamp.startDate : 'this upcoming session';

    const applyTokens = (str: string) =>
      str
        .replace(/\[Coach Last Name\]/g, coachLastName)
        .replace(/\[University Name\]/g, targetProgram.schoolName)
        .replace(/\[Conference Name\]/g, targetProgram.conference)
        .replace(/\[Camp Name\]/g, campNameToken)
        .replace(/\[Date\]/g, campDateToken)
        .replace(/\[Player Name\]/g, athleteProfile.playerName)
        .replace(/\[Club Name\]/g, athleteProfile.clubName)
        .replace(/\[Number\]/g, athleteProfile.jerseyNumber)
        .replace(/\[GPA\]/g, athleteProfile.gpa)
        .replace(/\[Height\]/g, athleteProfile.height)
        .replace(/\[Weight\]/g, athleteProfile.weight)
        .replace(/\[High School\]/g, athleteProfile.highSchool)
        .replace(/\[Player Phone\]/g, athleteProfile.playerPhone)
        .replace(/\[Player Email\]/g, athleteProfile.playerEmail)
        .replace(/\[NCAA ID\]/g, athleteProfile.ncaaId)
        .replace(/\[Highlight Link\]/g, athleteProfile.highlightLink)
        .replace(/\[Full Game Link\]/g, athleteProfile.fullGameLink);

    setSubjectLine(applyTokens(selectedTemplate.subject));
    setBodyText(applyTokens(selectedTemplate.body));
    setCoachEmail(
      targetProgram.headCoach.email ||
        `menssoccer@${targetProgram.mensSoccerUrl
          .replace(/^https?:\/\//, '')
          .replace(/^www\./, '')
          .split('/')[0]}`
    );
  }, [targetProgram, selectedTemplate, athleteProfile, initialCamp, camps]);

  if (!isOpen || !targetProgram) return null;

  const todayIso = getLocalIsoDate();
  const isPreContactRule =
    (targetProgram.division === 'D1' || targetProgram.division === 'D2') &&
    todayIso < NCAA_CONTACT_CUTOFF;

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(`Subject: ${subjectLine}\n\n${bodyText}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogToTracker = () => {
    const newEntry: OutreachLog = {
      id: `outreach-${Date.now()}`,
      programId: targetProgram.id,
      schoolName: targetProgram.schoolName,
      division: targetProgram.division,
      coachName: targetProgram.headCoach.name,
      coachEmail,
      dateSent: todayIso,
      category: selectedTemplate.category,
      status:
        isPreContactRule && statusToLog === 'Sent'
          ? 'Pre-Contact Logged'
          : statusToLog,
      isPreContactRule,
      subjectLine,
      bodyText,
    };
    onLogOutreach(newEntry);
    onClose();
  };

  const mailtoHref = `mailto:${encodeURIComponent(
    coachEmail
  )}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(
    bodyText
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div>
            <h3 className="text-lg font-bold">
              Class of 2029 Goalkeeper Outreach Workspace
            </h3>
            <p className="text-xs text-slate-300">
              Auto-populates coach, conference, camp, and 2029 ECNL Goalkeeper
              profile variables
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {/* NCAA Auto-Compliance Banner */}
          {isPreContactRule && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong>
                  Auto-Compliance Tag: Pre-Contact Rule (Logistics / ID Camp Only)
                </strong>
                <p className="mt-0.5 text-amber-800">
                  {targetProgram.schoolName} is an NCAA {targetProgram.division}{' '}
                  program and today&apos;s date ({todayIso}) is prior to June 15,
                  2027. This outreach will be automatically logged with the
                  Pre-Contact compliance badge.
                </p>
              </div>
            </div>
          )}

          {/* Athlete Profile Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <UserCheck className="h-4 w-4 text-[#1E3A8A]" />
              <span>
                <strong>Athlete Profile:</strong> {athleteProfile.playerName} &bull;{' '}
                {athleteProfile.clubName} ECNL (#{athleteProfile.jerseyNumber}) &bull;{' '}
                {athleteProfile.gpa} GPA
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowProfileEditor(!showProfileEditor)}
              className="text-xs font-semibold text-[#1E3A8A] hover:underline"
            >
              {showProfileEditor ? 'Hide Profile Fields' : 'Edit Athlete Variables'}
            </button>
          </div>

          {showProfileEditor && (
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600">
                  Player Name
                </label>
                <input
                  type="text"
                  value={athleteProfile.playerName}
                  onChange={(e) =>
                    onUpdateAthleteProfile({
                      ...athleteProfile,
                      playerName: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600">
                  ECNL Club
                </label>
                <input
                  type="text"
                  value={athleteProfile.clubName}
                  onChange={(e) =>
                    onUpdateAthleteProfile({
                      ...athleteProfile,
                      clubName: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600">
                  Jersey # / GPA
                </label>
                <div className="mt-1 flex gap-1">
                  <input
                    type="text"
                    value={athleteProfile.jerseyNumber}
                    onChange={(e) =>
                      onUpdateAthleteProfile({
                        ...athleteProfile,
                        jerseyNumber: e.target.value,
                      })
                    }
                    className="w-1/2 rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                    placeholder="#1"
                  />
                  <input
                    type="text"
                    value={athleteProfile.gpa}
                    onChange={(e) =>
                      onUpdateAthleteProfile({
                        ...athleteProfile,
                        gpa: e.target.value,
                      })
                    }
                    className="w-1/2 rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                    placeholder="3.95"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600">
                  Height / Weight
                </label>
                <div className="mt-1 flex gap-1">
                  <input
                    type="text"
                    value={athleteProfile.height}
                    onChange={(e) =>
                      onUpdateAthleteProfile({
                        ...athleteProfile,
                        height: e.target.value,
                      })
                    }
                    className="w-1/2 rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                  />
                  <input
                    type="text"
                    value={athleteProfile.weight}
                    onChange={(e) =>
                      onUpdateAthleteProfile({
                        ...athleteProfile,
                        weight: e.target.value,
                      })
                    }
                    className="w-1/2 rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600">
                  Player Phone
                </label>
                <input
                  type="text"
                  value={athleteProfile.playerPhone}
                  onChange={(e) =>
                    onUpdateAthleteProfile({
                      ...athleteProfile,
                      playerPhone: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600">
                  Player Email
                </label>
                <input
                  type="email"
                  value={athleteProfile.playerEmail}
                  onChange={(e) =>
                    onUpdateAthleteProfile({
                      ...athleteProfile,
                      playerEmail: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600">
                  NCAA ID #
                </label>
                <input
                  type="text"
                  value={athleteProfile.ncaaId}
                  onChange={(e) =>
                    onUpdateAthleteProfile({
                      ...athleteProfile,
                      ncaaId: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600">
                  High School
                </label>
                <input
                  type="text"
                  value={athleteProfile.highSchool}
                  onChange={(e) =>
                    onUpdateAthleteProfile({
                      ...athleteProfile,
                      highSchool: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600">
                  2-Min Highlight Video URL
                </label>
                <input
                  type="text"
                  value={athleteProfile.highlightLink}
                  onChange={(e) =>
                    onUpdateAthleteProfile({
                      ...athleteProfile,
                      highlightLink: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600">
                  Full Game / Unedited Half Video URL
                </label>
                <input
                  type="text"
                  value={athleteProfile.fullGameLink}
                  onChange={(e) =>
                    onUpdateAthleteProfile({
                      ...athleteProfile,
                      fullGameLink: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                />
              </div>
            </div>
          )}

          {/* Target School & Template Selectors */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Target Program
              </label>
              <select
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:border-[#1E3A8A] focus:bg-white focus:outline-none"
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.division}] {p.schoolName} &mdash; Coach {p.headCoach.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Goalkeeper Email Template
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:border-[#1E3A8A] focus:bg-white focus:outline-none"
              >
                {GK_EMAIL_TEMPLATES.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recipient & Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600">
                Coach Email Address
              </label>
              <input
                type="text"
                value={coachEmail}
                onChange={(e) => setCoachEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Log Status As
              </label>
              <select
                value={statusToLog}
                onChange={(e) => setStatusToLog(e.target.value as OutreachStatus)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
              >
                <option value="Sent">Sent</option>
                <option value="Drafted">Drafted</option>
                <option value="Pre-Contact Logged">Pre-Contact Logged</option>
              </select>
            </div>
          </div>

          {/* Subject Line */}
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Subject Line
            </label>
            <input
              type="text"
              value={subjectLine}
              onChange={(e) => setSubjectLine(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900"
            />
          </div>

          {/* Email Body */}
          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Email Body Preview (Editable)
            </label>
            <textarea
              rows={11}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 p-3 font-sans text-xs leading-relaxed text-slate-900 focus:border-[#1E3A8A] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyClipboard}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  Copied Subject &amp; Body!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy to Clipboard
                </>
              )}
            </button>

            <a
              href={mailtoHref}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-[#1E3A8A] hover:bg-blue-50"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open in Mail App
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLogToTracker}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1E3A8A] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-900"
            >
              <Send className="h-4 w-4" />
              Log to Outreach Tracker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
