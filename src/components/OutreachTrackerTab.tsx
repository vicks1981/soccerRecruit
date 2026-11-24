import React, { useState, useMemo } from 'react';
import {
  Mail,
  ShieldAlert,
  Copy,
  Check,
  Trash2,
  Eye,
  PlusCircle,
  Download,
  Search,
} from 'lucide-react';
import { OutreachLog, OutreachStatus } from '../types/recruiting';

interface OutreachTrackerTabProps {
  logs: OutreachLog[];
  onUpdateStatus: (logId: string, status: OutreachStatus) => void;
  onDeleteLog: (logId: string) => void;
  onOpenNewEmailModal: () => void;
}

const statusColors: Record<OutreachStatus, string> = {
  Drafted: 'bg-slate-100 text-slate-700 border-slate-300',
  Sent: 'bg-blue-100 text-blue-800 border-blue-300',
  'Coach Replied': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Pre-Contact Logged': 'bg-amber-100 text-amber-800 border-amber-300',
  Archived: 'bg-slate-50 text-slate-400 border-slate-200',
};

export const OutreachTrackerTab: React.FC<OutreachTrackerTabProps> = ({
  logs,
  onUpdateStatus,
  onDeleteLog,
  onOpenNewEmailModal,
}) => {
  const [selectedLog, setSelectedLog] = useState<OutreachLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | OutreachStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (statusFilter !== 'ALL' && log.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          log.schoolName.toLowerCase().includes(q) ||
          log.coachName.toLowerCase().includes(q) ||
          log.subjectLine.toLowerCase().includes(q) ||
          log.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [logs, statusFilter, searchQuery]);

  const handleCopy = (log: OutreachLog) => {
    navigator.clipboard.writeText(
      `Subject: ${log.subjectLine}\n\n${log.bodyText}`
    );
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCsv = () => {
    const headers = [
      'Date',
      'School',
      'Division',
      'Coach Name',
      'Coach Email',
      'Category',
      'Status',
      'Pre-Contact Rule',
      'Subject Line',
    ];
    const rows = filteredLogs.map((l) => [
      l.dateSent,
      `"${l.schoolName.replace(/"/g, '""')}"`,
      l.division || '',
      `"${l.coachName.replace(/"/g, '""')}"`,
      l.coachEmail,
      l.category,
      l.status,
      l.isPreContactRule ? 'Yes' : 'No',
      `"${l.subjectLine.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'zach-vickers-2029-outreach-logs.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Coach Outreach &amp; Compliance Log ({logs.length})
          </h3>
          <p className="text-xs text-slate-500">
            All Division I &amp; Division II outreach initiated before{' '}
            <strong>June 15, 2027</strong> is automatically tagged as{' '}
            <span className="font-semibold text-amber-800">
              Pre-Contact Rule (Logistics / ID Camp Only)
            </span>
            .
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {logs.length > 0 && (
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          )}
          <button
            type="button"
            onClick={onOpenNewEmailModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1E3A8A] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-900"
          >
            <PlusCircle className="h-4 w-4" />
            New Goalkeeper Outreach Email
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              'ALL',
              'Sent',
              'Pre-Contact Logged',
              'Coach Replied',
              'Drafted',
              'Archived',
            ] as const
          ).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-[#1E3A8A] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? `All (${logs.length})` : st}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by school or coach..."
            className="w-full rounded-lg border border-slate-300 bg-slate-50 py-1.5 pl-8 pr-3 text-xs focus:border-[#1E3A8A] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Mail className="mx-auto h-10 w-10 text-slate-300" />
          <h4 className="mt-3 text-base font-semibold text-slate-800">
            No outreach emails match your filter
          </h4>
          <p className="mt-1 text-sm text-slate-500">
            Click &ldquo;Draft&rdquo; on any school in the Programs table to
            generate a customized Class of 2029 Goalkeeper email.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">School &amp; Coach</th>
                  <th className="px-4 py-3.5">Category &amp; Subject</th>
                  <th className="px-4 py-3.5">NCAA Compliance Tag</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs font-medium text-slate-600">
                      {log.dateSent}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">
                        {log.schoolName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {log.coachName} &bull; {log.coachEmail}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {log.category}
                      </span>
                      <div className="mt-1 text-xs font-medium text-slate-800 max-w-md truncate">
                        {log.subjectLine}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {log.isPreContactRule ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                          Pre-Contact Rule (Logistics / ID Camp Only)
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                          Standard Recruiting Eligible
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <select
                        value={log.status}
                        onChange={(e) =>
                          onUpdateStatus(log.id, e.target.value as OutreachStatus)
                        }
                        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold focus:outline-none ${
                          statusColors[log.status]
                        }`}
                      >
                        <option value="Drafted">Drafted</option>
                        <option value="Sent">Sent</option>
                        <option value="Coach Replied">Coach Replied</option>
                        <option value="Pre-Contact Logged">
                          Pre-Contact Logged
                        </option>
                        <option value="Archived">Archived</option>
                      </select>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          title="Preview Message"
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(log)}
                          title="Copy Subject & Body"
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                        >
                          {copiedId === log.id ? (
                            <Check className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteLog(log.id)}
                          title="Delete Entry"
                          className="rounded-lg border border-slate-200 p-1.5 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Email Preview Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {selectedLog.schoolName} &mdash; {selectedLog.coachName}
                </h4>
                <p className="text-xs text-slate-500">
                  Sent/Logged: {selectedLog.dateSent} &bull;{' '}
                  {selectedLog.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>
            <div className="mt-4">
              <div className="text-xs font-bold uppercase text-slate-400">
                Subject
              </div>
              <div className="mt-1 rounded-lg bg-slate-50 p-2.5 text-sm font-semibold text-slate-900">
                {selectedLog.subjectLine}
              </div>
              <div className="mt-3 text-xs font-bold uppercase text-slate-400">
                Body
              </div>
              <pre className="mt-1 max-h-80 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 font-sans text-xs leading-relaxed text-slate-800">
                {selectedLog.bodyText}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
