import React, { useState, useMemo, useEffect } from 'react';
import {
  Shield,
  Tent,
  Mail,
  Building2,
  Sparkles,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import programsData from '../data/programs.json';
import { SEED_ID_CAMPS } from '../data/seedCamps';
import { SoccerProgram } from '../types/program';
import {
  AthleteProfile,
  CampStatus,
  IdCamp,
  OutreachLog,
  OutreachStatus,
} from '../types/recruiting';
import { DivisionFilter, DivisionTabs } from './DivisionTabs';
import { FilterBar, FilterState } from './FilterBar';
import { ProgramTable } from './ProgramTable';
import { ProgramDetailDrawer } from './ProgramDetailDrawer';
import { IdCampTab } from './IdCampTab';
import { OutreachTrackerTab } from './OutreachTrackerTab';
import { EmailTemplateModal } from './EmailTemplateModal';

type MainWorkspaceTab = 'programs' | 'camps' | 'outreach';

const STORAGE_KEYS = {
  CAMPS: 'recruiting2029_camps_v1',
  BUDGET: 'recruiting2029_camp_budget_v1',
  OUTREACH: 'recruiting2029_outreach_logs_v1',
  NOTES: 'recruiting2029_program_notes_v1',
  PROFILE: 'recruiting2029_athlete_profile_v1',
  FAVORITES: 'recruiting2029_favorite_programs_v1',
};

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  state: 'ALL',
  needScore: 'ALL',
  maxNetPrice: 45000,
  withinFourHoursOfDelco: false,
  favoritesOnly: false,
};

const DEFAULT_ATHLETE_PROFILE: AthleteProfile = {
  playerName: 'Zach Vickers',
  clubName: 'Delaware FC',
  jerseyNumber: '1',
  gpa: '3.95',
  height: "6'2\"",
  weight: '180',
  highSchool: 'Strath Haven / Delco High School',
  playerPhone: '(610) 555-0129',
  playerEmail: 'gk2029@example.com',
  ncaaId: '2509876543',
  highlightLink: 'https://hudl.com/v/2029-gk-highlights',
  fullGameLink: 'https://veo.co/matches/2029-ecnl-full-half',
};

const INITIAL_OUTREACH_LOGS: OutreachLog[] = [
  {
    id: 'seed-log-1',
    programId: 'villanova',
    schoolName: 'Villanova University',
    division: 'D1',
    coachName: 'Mark Fetrow',
    coachEmail: 'menssoccer@villanova.edu',
    dateSent: '2026-10-12',
    category: 'ID Camp Inquiry',
    status: 'Pre-Contact Logged',
    isPreContactRule: true,
    subjectLine:
      "Question regarding Nova Men's Soccer Summer Prospect ID Camp Goalkeeper Curriculum - Zach Vickers (2029 GK)",
    bodyText:
      'Inquired about goalkeeper-specific training session logistics and video recording availability prior to registering for the Villanova Prospect ID Camp.',
  },
  {
    id: 'seed-log-2',
    programId: 'haverford',
    schoolName: 'Haverford College',
    division: 'D3',
    coachName: 'Zach Rabacon',
    coachEmail: 'msoccer@haverford.edu',
    dateSent: '2026-10-15',
    category: 'Showcase Schedule',
    status: 'Sent',
    isPreContactRule: false,
    subjectLine:
      'ECNL Showcase Schedule - Class of 2029 Goalkeeper - Zach Vickers',
    bodyText:
      'Shared upcoming Delaware FC ECNL Fall Showcase schedule and 2-minute highlight video ahead of the East Coast ID Fall High Academic Clinic.',
  },
];

export const App: React.FC = () => {
  const programs = programsData as SoccerProgram[];

  const [activeTab, setActiveTab] = useState<MainWorkspaceTab>('programs');
  const [selectedDivision, setSelectedDivision] = useState<DivisionFilter>('ALL');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [drawerProgram, setDrawerProgram] = useState<SoccerProgram | null>(null);
  const [modalProgram, setModalProgram] = useState<SoccerProgram | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Persisted State (merges any newly discovered SEED_ID_CAMPS automatically)
  const [camps, setCamps] = useState<IdCamp[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CAMPS);
      if (!saved) return SEED_ID_CAMPS;
      const parsed: IdCamp[] = JSON.parse(saved);
      const savedById = new Map(parsed.map((c) => [c.id, c]));
      const merged = SEED_ID_CAMPS.map((seed) =>
        savedById.has(seed.id) ? savedById.get(seed.id)! : seed
      );
      const customOnly = parsed.filter(
        (c) => !SEED_ID_CAMPS.some((seed) => seed.id === c.id)
      );
      return [...merged, ...customOnly].sort((a, b) =>
        a.startDate.localeCompare(b.startDate)
      );
    } catch {
      return SEED_ID_CAMPS;
    }
  });

  const [campBudgetCeiling, setCampBudgetCeiling] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGET);
      return saved ? Number(saved) : 1200;
    } catch {
      return 1200;
    }
  });

  const [outreachLogs, setOutreachLogs] = useState<OutreachLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OUTREACH);
      if (!saved) return INITIAL_OUTREACH_LOGS;
      const parsed: OutreachLog[] = JSON.parse(saved);
      return parsed.map((log) => ({
        ...log,
        subjectLine: log.subjectLine.replace(/Alex Vickers/g, 'Zach Vickers'),
        bodyText: log.bodyText
          .replace(/Alex Vickers/g, 'Zach Vickers')
          .replace(/FC Delco/g, 'Delaware FC'),
      }));
    } catch {
      return INITIAL_OUTREACH_LOGS;
    }
  });

  const [customNotes, setCustomNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [athleteProfile, setAthleteProfile] = useState<AthleteProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!saved) return DEFAULT_ATHLETE_PROFILE;
      const parsed: AthleteProfile = JSON.parse(saved);
      return {
        ...parsed,
        playerName:
          parsed.playerName === 'Alex Vickers' ? 'Zach Vickers' : parsed.playerName,
        clubName:
          parsed.clubName === 'FC Delco' ? 'Delaware FC' : parsed.clubName,
      };
    } catch {
      return DEFAULT_ATHLETE_PROFILE;
    }
  });

  const [favoriteProgramIds, setFavoriteProgramIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CAMPS, JSON.stringify(camps));
  }, [camps]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGET, String(campBudgetCeiling));
  }, [campBudgetCeiling]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OUTREACH, JSON.stringify(outreachLogs));
  }, [outreachLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(customNotes));
  }, [customNotes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(athleteProfile));
  }, [athleteProfile]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.FAVORITES,
      JSON.stringify(favoriteProgramIds)
    );
  }, [favoriteProgramIds]);

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      if (
        filters.favoritesOnly &&
        !favoriteProgramIds.includes(program.id)
      ) {
        return false;
      }
      if (selectedDivision !== 'ALL' && program.division !== selectedDivision) {
        return false;
      }
      if (filters.state !== 'ALL' && program.state !== filters.state) {
        return false;
      }
      if (
        filters.needScore !== 'ALL' &&
        program.classOf2029NeedScore !== filters.needScore
      ) {
        return false;
      }
      if (program.financialProfile.averageNetPrice > filters.maxNetPrice) {
        return false;
      }
      if (
        filters.withinFourHoursOfDelco &&
        program.estimatedDriveHoursFromDelco !== undefined &&
        program.estimatedDriveHoursFromDelco > 4
      ) {
        return false;
      }
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matches =
          program.schoolName.toLowerCase().includes(q) ||
          program.city.toLowerCase().includes(q) ||
          program.conference.toLowerCase().includes(q) ||
          program.headCoach.name.toLowerCase().includes(q) ||
          (program.gkCoach?.name.toLowerCase().includes(q) ?? false);
        if (!matches) return false;
      }
      return true;
    });
  }, [programs, selectedDivision, filters, favoriteProgramIds]);

  const handleToggleFavorite = (programId: string) => {
    setFavoriteProgramIds((prev) =>
      prev.includes(programId)
        ? prev.filter((id) => id !== programId)
        : [...prev, programId]
    );
  };

  const outreachCountsByProgram = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const log of outreachLogs) {
      counts[log.programId] = (counts[log.programId] || 0) + 1;
    }
    return counts;
  }, [outreachLogs]);

  const highNeedCount = useMemo(
    () => programs.filter((p) => p.classOf2029NeedScore === 'High').length,
    [programs]
  );

  const handleOpenDraftModal = (program: SoccerProgram) => {
    setModalProgram(program);
    setIsEmailModalOpen(true);
  };

  const handleUpdateCampStatus = (campId: string, status: CampStatus) => {
    setCamps((prev) =>
      prev.map((c) => (c.id === campId ? { ...c, status } : c))
    );
  };

  const handleAddCamp = (newCamp: IdCamp) => {
    setCamps((prev) => [newCamp, ...prev]);
  };

  const handleLogOutreach = (log: OutreachLog) => {
    setOutreachLogs((prev) => [log, ...prev]);
  };

  const handleUpdateOutreachStatus = (logId: string, status: OutreachStatus) => {
    setOutreachLogs((prev) =>
      prev.map((l) => (l.id === logId ? { ...l, status } : l))
    );
  };

  const handleDeleteOutreach = (logId: string) => {
    setOutreachLogs((prev) => prev.filter((l) => l.id !== logId));
  };

  const handleSaveProgramNote = (programId: string, note: string) => {
    setCustomNotes((prev) => ({ ...prev, [programId]: note }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Hero Banner */}
      <header className="border-b border-slate-800 bg-gradient-to-r from-slate-900 via-[#172554] to-[#1E3A8A] text-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                <Shield className="h-6 w-6 text-blue-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-semibold text-blue-200 border border-blue-400/30">
                    <Sparkles className="h-3 w-3" />
                    Class of 2029 ECNL Goalkeeper Engine
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-200 border border-emerald-400/30">
                    <MapPin className="h-3 w-3" />
                    Delco, PA Base (PA &bull; NJ &bull; DE &bull; MD)
                  </span>
                </div>
                <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  College Men&apos;s Soccer Recruiting 2029 Dashboard
                </h1>
                <p className="mt-1 text-xs text-slate-300 sm:text-sm">
                  Goalkeeper depth chart intelligence, financial aid net-price
                  modeling, and NCAA June 15, 2027 compliance tracking across{' '}
                  {programs.length} regional programs.
                </p>
              </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              <div className="rounded-xl bg-white/10 px-3.5 py-2.5 backdrop-blur-xs border border-white/10">
                <div className="text-[11px] font-medium text-blue-200">
                  Regional Programs
                </div>
                <div className="mt-0.5 text-xl font-extrabold">{programs.length}</div>
                <div className="text-[10px] text-slate-300">26 D1 &bull; 21 D2 &bull; 35 D3</div>
              </div>
              <div className="rounded-xl bg-white/10 px-3.5 py-2.5 backdrop-blur-xs border border-white/10">
                <div className="text-[11px] font-medium text-emerald-200">
                  High 2029 GK Need
                </div>
                <div className="mt-0.5 text-xl font-extrabold text-emerald-300">
                  {highNeedCount}
                </div>
                <div className="text-[10px] text-slate-300">Upperclass Starters</div>
              </div>
              <div className="rounded-xl bg-white/10 px-3.5 py-2.5 backdrop-blur-xs border border-white/10">
                <div className="text-[11px] font-medium text-amber-200">
                  D1/D2 Direct Contact
                </div>
                <div className="mt-0.5 text-base font-extrabold text-amber-300 sm:text-lg">
                  Jun 15, 2027
                </div>
                <div className="text-[10px] text-slate-300">ID Camp Exception Active</div>
              </div>
            </div>
          </div>

          {/* Primary Navigation Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('programs')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
                  activeTab === 'programs'
                    ? 'bg-white text-[#1E3A8A] shadow-sm'
                    : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <Building2 className="h-4 w-4" />
                NCAA Programs &amp; GK Rosters ({programs.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('camps')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
                  activeTab === 'camps'
                    ? 'bg-white text-[#1E3A8A] shadow-sm'
                    : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <Tent className="h-4 w-4" />
                ID Camps &amp; Budget ({camps.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('outreach')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
                  activeTab === 'outreach'
                    ? 'bg-white text-[#1E3A8A] shadow-sm'
                    : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <Mail className="h-4 w-4" />
                Outreach Tracker ({outreachLogs.length})
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-blue-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Local Persistence Active (localStorage)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === 'programs' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <DivisionTabs
                programs={programs}
                selectedDivision={selectedDivision}
                onSelectDivision={setSelectedDivision}
              />
              <button
                type="button"
                onClick={() => {
                  setModalProgram(filteredPrograms[0] || programs[0]);
                  setIsEmailModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1E3A8A] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-900"
              >
                <Mail className="h-4 w-4" />
                Open GK Email Templates
              </button>
            </div>

            <FilterBar
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(DEFAULT_FILTERS)}
              resultCount={filteredPrograms.length}
              totalCount={programs.length}
              favoritesCount={favoriteProgramIds.length}
            />

            <ProgramTable
              programs={filteredPrograms}
              favoriteProgramIds={favoriteProgramIds}
              outreachCountsByProgram={outreachCountsByProgram}
              customNotesByProgram={customNotes}
              onToggleFavorite={handleToggleFavorite}
              onSelectProgram={(program) => setDrawerProgram(program)}
              onDraftOutreach={handleOpenDraftModal}
            />
          </div>
        )}

        {activeTab === 'camps' && (
          <IdCampTab
            camps={camps}
            budgetCeiling={campBudgetCeiling}
            onUpdateBudgetCeiling={setCampBudgetCeiling}
            onUpdateCampStatus={handleUpdateCampStatus}
            onAddCamp={handleAddCamp}
          />
        )}

        {activeTab === 'outreach' && (
          <OutreachTrackerTab
            logs={outreachLogs}
            onUpdateStatus={handleUpdateOutreachStatus}
            onDeleteLog={handleDeleteOutreach}
            onOpenNewEmailModal={() => {
              setModalProgram(programs[0]);
              setIsEmailModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Slide-out Detail Drawer */}
      <ProgramDetailDrawer
        program={drawerProgram}
        isFavorite={
          drawerProgram ? favoriteProgramIds.includes(drawerProgram.id) : false
        }
        outreachLogs={outreachLogs}
        camps={camps}
        savedNote={drawerProgram ? customNotes[drawerProgram.id] || '' : ''}
        onToggleFavorite={handleToggleFavorite}
        onSaveNote={handleSaveProgramNote}
        onClose={() => setDrawerProgram(null)}
        onDraftOutreach={(program) => {
          setDrawerProgram(null);
          handleOpenDraftModal(program);
        }}
      />

      {/* Goalkeeper Email Template Modal */}
      <EmailTemplateModal
        isOpen={isEmailModalOpen}
        initialProgram={modalProgram}
        programs={programs}
        athleteProfile={athleteProfile}
        onUpdateAthleteProfile={setAthleteProfile}
        onLogOutreach={handleLogOutreach}
        onClose={() => setIsEmailModalOpen(false)}
      />
    </div>
  );
};

export default App;
