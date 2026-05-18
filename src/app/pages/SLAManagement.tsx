import React, { useRef, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  FileText, Plus, Search, Upload, AlertTriangle,
  CheckCircle2, Clock, XCircle, TrendingUp, Download,
  Filter, ArrowUpDown, Calendar, FileUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RowActionsMenu } from '../components/RowActionsMenu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { useServiceDesk } from '../store/serviceDeskStore';
import type { SLA, SLAStatus } from '../store/types';

// ---------------------------------------------------------------------------
// SLA helpers (shared with CreateSLA and SLADetail)
// ---------------------------------------------------------------------------

export const EXPIRING_THRESHOLD_DAYS = 30;

export function calcSLAStatus(startDate: string, endDate: string): SLAStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  if (today < start) return 'Upcoming';
  if (today > end) return 'Expired';
  const diffDays = Math.round((end.getTime() - today.getTime()) / 86_400_000);
  if (diffDays <= EXPIRING_THRESHOLD_DAYS) return 'Expiring Soon';
  return 'Active';
}

export function calcRemainingTime(endDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate + 'T00:00:00');
  const diffDays = Math.round((end.getTime() - today.getTime()) / 86_400_000);
  if (diffDays < 0) {
    const abs = Math.abs(diffDays);
    return `Expired ${abs} day${abs !== 1 ? 's' : ''} ago`;
  }
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`;
  const years = Math.floor(diffDays / 365);
  const afterYears = diffDays - years * 365;
  const months = Math.floor(afterYears / 30);
  const days = afterYears - months * 30;
  if (years >= 1) return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''} remaining`;
  return `${months} month${months !== 1 ? 's' : ''} ${days} day${days !== 1 ? 's' : ''} remaining`;
}

export function calcDurationLabel(startDate: string, endDate: string): string {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const diffDays = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  if (diffDays < 0) return '—';
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  const days = diffDays % 30;
  if (years >= 1) return `${years}yr ${months}mo`;
  if (months >= 1) return `${months}mo ${days}d`;
  return `${days}d`;
}

export function calcSupportType(status: SLAStatus): string {
  return status === 'Expired' ? 'CSAT' : 'Normal Support';
}

// ---------------------------------------------------------------------------
// Status & support-type config
// ---------------------------------------------------------------------------

export const slaStatusConfig: Record<SLAStatus, { badgeClass: string; dotClass: string; icon: React.ElementType; color: string }> = {
  Active:         { badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotClass: 'bg-emerald-500', icon: CheckCircle2, color: '#059669' },
  'Expiring Soon':{ badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',   dotClass: 'bg-amber-500',   icon: AlertTriangle, color: '#d97706' },
  Expired:        { badgeClass: 'bg-red-50 text-red-700 border-red-200',         dotClass: 'bg-red-500',     icon: XCircle,       color: '#dc2626' },
  Upcoming:       { badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',      dotClass: 'bg-blue-500',    icon: Clock,         color: '#2563eb' },
};

const supportTypeConfig: Record<string, { badgeClass: string; dotClass: string }> = {
  'CSAT':           { badgeClass: 'bg-red-50 text-red-700 border-red-200',   dotClass: 'bg-red-400' },
  'Normal Support': { badgeClass: 'bg-blue-50 text-blue-700 border-blue-200', dotClass: 'bg-blue-400' },
};

const avatarColors = ['#7c3aed', '#0891b2', '#059669', '#d97706', '#1d4ed8', '#dc2626', '#6366f1', '#0f766e'];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function initials2(name: string) {
  const parts = name.trim().split(/[\s/]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ---------------------------------------------------------------------------
// Excel (SpreadsheetML) export — includes Support Type column
// ---------------------------------------------------------------------------

function xmlEscape(s: string) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function exportSLAsToExcel(slas: SLA[]) {
  const headers = ['SLA ID', 'Company', 'Project', 'Start Date', 'End Date', 'Duration', 'Remaining Time', 'Status', 'Support Type', 'Notes'];
  const rows = slas.map((s) => {
    const status = calcSLAStatus(s.startDate, s.endDate);
    return [
      s.id, s.companyName, s.projectName, s.startDate, s.endDate,
      calcDurationLabel(s.startDate, s.endDate),
      calcRemainingTime(s.endDate),
      status,
      calcSupportType(status),
      s.notes,
    ];
  });
  const makeCell = (v: string, bold = false) => {
    const style = bold ? ' ss:StyleID="header"' : '';
    return `<Cell${style}><Data ss:Type="String">${xmlEscape(v)}</Data></Cell>`;
  };
  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="header"><Font ss:Bold="1"/><Interior ss:Color="#F3F4F6" ss:Pattern="Solid"/></Style>
  </Styles>
  <Worksheet ss:Name="SLA Directory">
    <Table>
      <Row>${headers.map((h) => makeCell(h, true)).join('')}</Row>
      ${rows.map((r) => `<Row>${r.map((c) => makeCell(c)).join('')}</Row>`).join('\n      ')}
    </Table>
  </Worksheet>
</Workbook>`;
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sla-directory-${new Date().toISOString().slice(0, 10)}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// File parsing helpers
// ---------------------------------------------------------------------------

type ParsedRow = { companyName: string; projectName: string; startDate: string; endDate: string };

/** Normalise a raw 2-D array of strings into ParsedRow[].
 *  Handles both:
 *   - Our own export: SLA ID | Company | Project | Start Date | End Date | …
 *   - Simple import:  No | Client | Project | Start Date | End Date
 */
function normaliseRows(grid: string[][]): { rows: ParsedRow[]; error: string } {
  if (grid.length === 0) return { rows: [], error: 'File appears to be empty.' };

  // Detect and skip header row
  const firstRow = grid[0].map((c) => c.toLowerCase().trim());
  const isHeader =
    firstRow.some((c) => c === 'company' || c === 'client' || c === 'sla id' || c === 'no');
  const dataRows = isHeader ? grid.slice(1) : grid;

  // Detect column mapping from header
  let companyIdx = 1, projectIdx = 2, startIdx = 3, endIdx = 4;
  if (isHeader) {
    firstRow.forEach((h, i) => {
      if (h === 'company' || h === 'client') companyIdx = i;
      else if (h === 'project') projectIdx = i;
      else if (h.includes('start')) startIdx = i;
      else if (h.includes('end')) endIdx = i;
    });
  } else {
    // No header — check if col[0] looks like a row number
    const startsWithNo = dataRows.every((r) => !isNaN(Number(r[0]?.trim())));
    if (!startsWithNo) { companyIdx = 0; projectIdx = 1; startIdx = 2; endIdx = 3; }
  }

  const rows: ParsedRow[] = [];
  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i];
    const companyName = r[companyIdx]?.trim() ?? '';
    const projectName = r[projectIdx]?.trim() ?? '';
    const startDate   = r[startIdx]?.trim()   ?? '';
    const endDate     = r[endIdx]?.trim()     ?? '';
    if (!companyName && !projectName) continue; // skip blank rows
    if (!companyName || !projectName || !startDate || !endDate) {
      return { rows: [], error: `Row ${i + (isHeader ? 2 : 1)}: missing Company, Project, Start Date, or End Date.` };
    }
    rows.push({ companyName, projectName, startDate, endDate });
  }
  if (rows.length === 0) return { rows: [], error: 'No data rows found in the file.' };
  return { rows, error: '' };
}

/** Parse delimited text (CSV or TSV). */
function parseDelimited(text: string): string[][] {
  return text.trim().split('\n').filter(Boolean).map((line) =>
    line.split(/\t|,/).map((c) => c.trim().replace(/^"|"$/g, '')),
  );
}

/** Parse SpreadsheetML XML (.xls produced by our own export). */
function parseSpreadsheetML(xmlText: string): string[][] | null {
  try {
    const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
    if (doc.querySelector('parsererror')) return null;
    const grid: string[][] = [];
    doc.querySelectorAll('Row').forEach((row) => {
      const cells: string[] = [];
      row.querySelectorAll('Cell').forEach((cell) => {
        cells.push(cell.querySelector('Data')?.textContent?.trim() ?? '');
      });
      grid.push(cells);
    });
    return grid;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Import dialog — file upload + paste, preview in Directory table format
// ---------------------------------------------------------------------------

function ImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { importSLAs } = useServiceDesk();
  const fileRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<'file' | 'paste'>('file');
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);
  const [raw, setRaw] = useState('');
  const [preview, setPreview] = useState<ParsedRow[]>([]);
  const [error, setError] = useState('');

  function reset() { setFileName(''); setRaw(''); setPreview([]); setError(''); }

  function applyGrid(grid: string[][]): void {
    const { rows, error } = normaliseRows(grid);
    if (error) { setError(error); setPreview([]); }
    else { setPreview(rows); setError(''); }
  }

  function handleFile(file: File) {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'tsv', 'txt', 'xls'].includes(ext ?? '')) {
      setError('Unsupported file type. Please upload a .csv, .tsv, or .xls file.');
      return;
    }
    setFileName(file.name);
    setError('');
    setPreview([]);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const grid = ext === 'xls' ? (parseSpreadsheetML(text) ?? parseDelimited(text)) : parseDelimited(text);
      applyGrid(grid);
    };
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handlePastePreview() {
    applyGrid(parseDelimited(raw));
  }

  function handleImport() {
    if (preview.length === 0) return;
    importSLAs(preview);
    reset();
    onClose();
  }

  function handleClose() { reset(); onClose(); }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Import SLAs</DialogTitle>
          <DialogDescription>
            Upload a file or paste rows. Expected columns:
            <code className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[12px]">
              No | Client | Project | Start Date | End Date
            </code>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
          {/* Tab switcher */}
          <div className="flex rounded-lg border bg-muted/40 p-0.5 gap-0.5 w-fit">
            {(['file', 'paste'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); reset(); }}
                className={`rounded-md px-4 py-1.5 text-[13px] font-medium transition-colors ${
                  tab === t ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'file' ? 'File Upload' : 'Paste Rows'}
              </button>
            ))}
          </div>

          {/* ── File upload ── */}
          {tab === 'file' && (
            <div className="space-y-3">
              <div
                className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors cursor-pointer ${
                  dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/40'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.tsv,.txt,.xls"
                  className="sr-only"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
                />
                <FileUp className={`w-9 h-9 mb-3 ${dragging ? 'text-primary' : 'text-muted-foreground'}`} />
                {fileName ? (
                  <div className="space-y-1">
                    <p className="text-[13px] font-medium text-foreground">{fileName}</p>
                    <p className="text-[12px] text-muted-foreground">Click or drag to replace</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-[13px] font-medium">Click to upload or drag & drop</p>
                    <p className="text-[12px] text-muted-foreground">Supports .csv, .tsv, .txt, .xls (exported from this app)</p>
                  </div>
                )}
              </div>

              <div className="rounded border bg-muted/50 px-3 py-2.5 text-[12px] text-muted-foreground">
                <span className="font-medium text-foreground">Accepted formats: </span>
                CSV (comma or tab-separated), and .xls files exported from SLA Management.
                <span className="ml-1 text-amber-600">XLSX is not supported — export from Excel as CSV first.</span>
              </div>
            </div>
          )}

          {/* ── Paste ── */}
          {tab === 'paste' && (
            <div className="space-y-3">
              <div className="rounded border bg-muted/50 p-3 text-[12px] text-muted-foreground font-mono">
                <div className="font-semibold text-foreground mb-1 font-sans">Example (tab-separated or CSV):</div>
                <div>1{'\t'}EPSS{'\t'}EPSS Enterprise Support{'\t'}2026-01-01{'\t'}2026-12-31</div>
                <div>2{'\t'}CBE{'\t'}CBE Branch Rollout{'\t'}2026-06-01{'\t'}2027-05-31</div>
              </div>
              <div>
                <Label className="text-[13px]">Paste rows here</Label>
                <Textarea
                  placeholder="Paste Excel rows here..."
                  className="mt-1.5 h-32 font-mono text-[12px]"
                  value={raw}
                  onChange={(e) => { setRaw(e.target.value); setPreview([]); setError(''); }}
                />
              </div>
              <Button variant="outline" size="sm" className="text-[13px]" onClick={handlePastePreview}>
                Preview import
              </Button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] text-red-700">
              <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* ── Preview in Directory table format ── */}
          {preview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-medium">{preview.length} row{preview.length !== 1 ? 's' : ''} ready to import</p>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px]">
                  Preview
                </Badge>
              </div>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-[80px]">ID</TableHead>
                      <TableHead className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Company</TableHead>
                      <TableHead className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Project</TableHead>
                      <TableHead className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Start Date</TableHead>
                      <TableHead className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">End Date</TableHead>
                      <TableHead className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Duration</TableHead>
                      <TableHead className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Remaining</TableHead>
                      <TableHead className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                      <TableHead className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Support Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((r, i) => {
                      const status = calcSLAStatus(r.startDate, r.endDate);
                      const sc = slaStatusConfig[status];
                      const supportType = calcSupportType(status);
                      const stc = supportTypeConfig[supportType];
                      const isExpired = status === 'Expired';
                      const isExpiring = status === 'Expiring Soon';
                      return (
                        <TableRow key={i}>
                          <TableCell className="px-3 py-2.5">
                            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">Auto</span>
                          </TableCell>
                          <TableCell className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <Avatar className="size-6 rounded-md">
                                <AvatarFallback className="rounded-md text-[9px] font-bold text-white" style={{ backgroundColor: avatarColor(r.companyName) }}>
                                  {initials2(r.companyName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-[12px] font-medium">{r.companyName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-2.5">
                            <span className="text-[12px]">{r.projectName}</span>
                          </TableCell>
                          <TableCell className="px-3 py-2.5">
                            <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {r.startDate}
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-2.5">
                            <div className={`flex items-center gap-1 text-[12px] ${isExpired ? 'text-red-600' : isExpiring ? 'text-amber-600' : 'text-muted-foreground'}`}>
                              <Calendar className="w-3 h-3" />
                              {r.endDate}
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-2.5">
                            <span className="text-[12px] text-muted-foreground">{calcDurationLabel(r.startDate, r.endDate)}</span>
                          </TableCell>
                          <TableCell className="px-3 py-2.5">
                            <span className={`text-[12px] font-medium ${isExpired ? 'text-red-600' : isExpiring ? 'text-amber-600' : 'text-muted-foreground'}`}>
                              {calcRemainingTime(r.endDate)}
                            </span>
                          </TableCell>
                          <TableCell className="px-3 py-2.5">
                            <Badge variant="outline" className={`gap-1 text-[11px] ${sc.badgeClass}`}>
                              <span className={`size-1.5 rounded-full ${sc.dotClass}`} />
                              {status}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-3 py-2.5">
                            <Badge variant="outline" className={`gap-1 text-[11px] ${stc.badgeClass}`}>
                              <span className={`size-1.5 rounded-full ${stc.dotClass}`} />
                              {supportType}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-2">
          <Button variant="outline" size="sm" className="text-[13px]" onClick={handleClose}>Cancel</Button>
          <Button size="sm" className="text-[13px] gap-1.5" onClick={handleImport} disabled={preview.length === 0}>
            <Upload className="w-3.5 h-3.5" />
            Import {preview.length > 0 ? `${preview.length} SLA${preview.length !== 1 ? 's' : ''}` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Edit dialog (inline edit)
// ---------------------------------------------------------------------------

function EditSLADialog({ sla, onClose }: { sla: SLA; onClose: () => void }) {
  const { updateSLA } = useServiceDesk();
  const [form, setForm] = useState({
    companyName: sla.companyName,
    projectName: sla.projectName,
    startDate: sla.startDate,
    endDate: sla.endDate,
    notes: sla.notes,
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    if (!form.companyName || !form.projectName || !form.startDate || !form.endDate) {
      toast.error('All fields are required');
      return;
    }
    updateSLA({ id: sla.id, ...form });
    onClose();
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit SLA — {sla.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[13px]">Company Name</Label>
              <Input className="mt-1 h-8 text-[13px]" value={form.companyName} onChange={(e) => set('companyName', e.target.value)} />
            </div>
            <div>
              <Label className="text-[13px]">Project Name</Label>
              <Input className="mt-1 h-8 text-[13px]" value={form.projectName} onChange={(e) => set('projectName', e.target.value)} />
            </div>
            <div>
              <Label className="text-[13px]">Start Date</Label>
              <Input type="date" className="mt-1 h-8 text-[13px]" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
            </div>
            <div>
              <Label className="text-[13px]">End Date</Label>
              <Input type="date" className="mt-1 h-8 text-[13px]" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-[13px]">Notes</Label>
            <Textarea className="mt-1 text-[13px]" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>
          {form.startDate && form.endDate && (
            <div className="rounded bg-muted/50 px-3 py-2 text-[12px] text-muted-foreground">
              Status preview:{' '}
              <span className="font-medium text-foreground">{calcSLAStatus(form.startDate, form.endDate)}</span>
              {' · '}{calcRemainingTime(form.endDate)}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" className="text-[13px]" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="text-[13px]" onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SLAManagement() {
  const navigate = useNavigate();
  const { slas, deleteSLA } = useServiceDesk();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [sortField, setSortField] = useState<'companyName' | 'endDate' | 'startDate'>('endDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [importOpen, setImportOpen] = useState(false);
  const [editingSLA, setEditingSLA] = useState<SLA | null>(null);

  const companies = useMemo(() => Array.from(new Set(slas.map((s) => s.companyName))).sort(), [slas]);
  const years = useMemo(() => {
    const ys = new Set<string>();
    slas.forEach((s) => { ys.add(s.startDate.slice(0, 4)); ys.add(s.endDate.slice(0, 4)); });
    return Array.from(ys).sort();
  }, [slas]);

  const enriched = useMemo(() =>
    slas.map((s) => {
      const status = calcSLAStatus(s.startDate, s.endDate);
      return { ...s, status, remaining: calcRemainingTime(s.endDate), supportType: calcSupportType(status) };
    }),
    [slas],
  );

  const filtered = useMemo(() => {
    let rows = enriched.filter((s) => {
      if (search &&
        !s.companyName.toLowerCase().includes(search.toLowerCase()) &&
        !s.projectName.toLowerCase().includes(search.toLowerCase()) &&
        !s.id.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (companyFilter !== 'all' && s.companyName !== companyFilter) return false;
      if (yearFilter !== 'all' && !s.startDate.startsWith(yearFilter) && !s.endDate.startsWith(yearFilter)) return false;
      return true;
    });
    rows = [...rows].sort((a, b) => {
      const va = a[sortField], vb = b[sortField];
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return rows;
  }, [enriched, search, statusFilter, companyFilter, yearFilter, sortField, sortDir]);

  const total = enriched.length;
  const activeCount = enriched.filter((s) => s.status === 'Active').length;
  const expiringSoonCount = enriched.filter((s) => s.status === 'Expiring Soon').length;
  const expiredCount = enriched.filter((s) => s.status === 'Expired').length;
  const upcomingCount = enriched.filter((s) => s.status === 'Upcoming').length;

  const alertSLAs = enriched
    .filter((s) => s.status === 'Expiring Soon' || s.status === 'Expired')
    .sort((a, b) => a.endDate.localeCompare(b.endDate));

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const hasFilters = search || statusFilter !== 'all' || companyFilter !== 'all' || yearFilter !== 'all';

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">SLA Management</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Service Level Agreements · {total} total · {activeCount} active
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-[13px]" onClick={() => setImportOpen(true)}>
              <Upload className="w-3.5 h-3.5" />
              Import
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-[13px]" onClick={() => exportSLAsToExcel(filtered)}>
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
            <Button size="sm" className="gap-1.5 text-[13px]" onClick={() => navigate('/sla/new')}>
              <Plus className="w-3.5 h-3.5" />
              New SLA
            </Button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Total SLAs',     value: total,            icon: FileText,     color: '#0b2235' },
            { label: 'Active',         value: activeCount,      icon: CheckCircle2, color: '#059669' },
            { label: 'Expiring Soon',  value: expiringSoonCount,icon: AlertTriangle, color: '#d97706' },
            { label: 'Expired',        value: expiredCount,     icon: XCircle,      color: '#dc2626' },
            { label: 'Upcoming',       value: upcomingCount,    icon: Clock,        color: '#2563eb' },
          ].map((s) => (
            <Card key={s.label} className="gap-0 px-4 py-3">
              <CardContent className="flex items-center gap-3 px-0 pb-0">
                <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <div>
                  <div className="text-[18px] font-semibold">{s.value}</div>
                  <div className="text-[11px] text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="directory">
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard" className="text-[13px]">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="directory" className="text-[13px]">
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Directory
            </TabsTrigger>
          </TabsList>

          {/* ── Dashboard Tab ── */}
          <TabsContent value="dashboard" className="space-y-5 mt-0">
            {alertSLAs.length > 0 && (
              <Card className="gap-0 p-0">
                <CardHeader className="border-b px-5 py-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <CardTitle className="text-[14px]">Expiration Alerts</CardTitle>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[11px]">
                      {alertSLAs.length} requiring attention
                    </Badge>
                  </div>
                  <CardDescription className="text-[12px]">
                    SLAs expiring within {EXPIRING_THRESHOLD_DAYS} days or already expired
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 divide-y">
                  {alertSLAs.map((s) => {
                    const sc = slaStatusConfig[s.status];
                    const StatusIcon = sc.icon;
                    return (
                      <div
                        key={s.id}
                        className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-muted/40 transition-colors"
                        onClick={() => navigate(`/sla/${s.id}`)}
                      >
                        <Avatar className="size-9 rounded-lg">
                          <AvatarFallback className="rounded-lg text-[11px] font-bold text-white" style={{ backgroundColor: avatarColor(s.companyName) }}>
                            {initials2(s.companyName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium">{s.companyName}</div>
                          <div className="text-[12px] text-muted-foreground truncate">{s.projectName}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-[11px] text-muted-foreground">End Date</div>
                            <div className="text-[12px] font-medium">{s.endDate}</div>
                          </div>
                          <div className="text-right min-w-[150px]">
                            <div className="text-[11px] text-muted-foreground">Remaining</div>
                            <div className={`text-[12px] font-medium ${s.status === 'Expired' ? 'text-red-600' : 'text-amber-600'}`}>
                              {s.remaining}
                            </div>
                          </div>
                          <Badge variant="outline" className={`gap-1.5 text-[11px] ${sc.badgeClass}`}>
                            <StatusIcon className="w-3 h-3" />
                            {s.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Card className="gap-0 p-0">
                <CardHeader className="border-b px-5 py-4">
                  <CardTitle className="text-[14px]">SLA Status Breakdown</CardTitle>
                  <CardDescription className="text-[12px]">{total} total agreements</CardDescription>
                </CardHeader>
                <CardContent className="px-5 py-4 space-y-3">
                  {(Object.entries(slaStatusConfig) as [SLAStatus, typeof slaStatusConfig[SLAStatus]][]).map(([status, cfg]) => {
                    const count = enriched.filter((s) => s.status === status).length;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    const StatusIcon = cfg.icon;
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <StatusIcon className="w-4 h-4 flex-shrink-0" style={{ color: cfg.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[13px]">{status}</span>
                            <span className="text-[12px] text-muted-foreground">{count} · {pct}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="gap-0 p-0">
                <CardHeader className="border-b px-5 py-4">
                  <CardTitle className="text-[14px]">SLAs by Company</CardTitle>
                  <CardDescription className="text-[12px]">Distribution across {companies.length} companies</CardDescription>
                </CardHeader>
                <CardContent className="px-5 py-4 space-y-2.5">
                  {companies.map((company) => {
                    const companySLAs = enriched.filter((s) => s.companyName === company);
                    const hasAlert = companySLAs.some((s) => s.status === 'Expiring Soon' || s.status === 'Expired');
                    return (
                      <div key={company} className="flex items-center gap-3">
                        <Avatar className="size-7 rounded-md">
                          <AvatarFallback className="rounded-md text-[10px] font-bold text-white" style={{ backgroundColor: avatarColor(company) }}>
                            {initials2(company)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="flex-1 text-[13px]">{company}</span>
                        {hasAlert && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                        <div className="flex gap-1">
                          {companySLAs.map((s) => (
                            <span key={s.id} className={`size-2 rounded-full ${slaStatusConfig[s.status].dotClass}`} title={s.status} />
                          ))}
                        </div>
                        <span className="text-[12px] text-muted-foreground w-4 text-right">{companySLAs.length}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            <Card className="gap-0 p-0">
              <CardHeader className="border-b px-5 py-4">
                <CardTitle className="text-[14px]">SLA Timeline</CardTitle>
                <CardDescription className="text-[12px]">All agreements sorted by end date</CardDescription>
              </CardHeader>
              <CardContent className="p-0 divide-y">
                {[...enriched].sort((a, b) => a.endDate.localeCompare(b.endDate)).map((s) => {
                  const sc = slaStatusConfig[s.status];
                  const start = new Date(s.startDate + 'T00:00:00');
                  const end = new Date(s.endDate + 'T00:00:00');
                  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000));
                  const today = new Date(); today.setHours(0, 0, 0, 0);
                  const elapsed = Math.max(0, Math.min(totalDays, Math.round((today.getTime() - start.getTime()) / 86_400_000)));
                  const pct = Math.round((elapsed / totalDays) * 100);
                  return (
                    <div key={s.id} className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-muted/40 transition-colors" onClick={() => navigate(`/sla/${s.id}`)}>
                      <Avatar className="size-8 rounded-md flex-shrink-0">
                        <AvatarFallback className="rounded-md text-[10px] font-bold text-white" style={{ backgroundColor: avatarColor(s.companyName) }}>
                          {initials2(s.companyName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="w-36 flex-shrink-0">
                        <div className="text-[13px] font-medium truncate">{s.companyName}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{s.projectName}</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-muted-foreground">{s.startDate}</span>
                          <span className="text-[11px] text-muted-foreground">{s.endDate}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: sc.color }} />
                        </div>
                      </div>
                      <div className="w-40 text-right flex-shrink-0">
                        <div className={`text-[12px] font-medium ${s.status === 'Expired' ? 'text-red-600' : s.status === 'Expiring Soon' ? 'text-amber-600' : 'text-muted-foreground'}`}>
                          {s.remaining}
                        </div>
                      </div>
                      <Badge variant="outline" className={`gap-1.5 text-[11px] flex-shrink-0 ${sc.badgeClass}`}>
                        <span className={`size-1.5 rounded-full ${sc.dotClass}`} />
                        {s.status}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Directory Tab ── */}
          <TabsContent value="directory" className="mt-0">
            <Card className="gap-0 overflow-hidden p-0">
              <CardHeader className="border-b px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <CardTitle className="text-[14px]">SLA Directory</CardTitle>
                    <CardDescription className="text-[12px]">{filtered.length} of {total} agreements</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5 text-[12px] h-7 px-2.5" onClick={() => exportSLAsToExcel(filtered)}>
                    <Download className="w-3 h-3" />
                    Export
                  </Button>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative min-w-[180px] max-w-xs flex-1">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search SLAs..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="h-8 bg-muted pl-9 pr-3 text-[13px]"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-8 w-[150px] text-[13px]"><SelectValue placeholder="All Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                      <SelectItem value="Upcoming">Upcoming</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={companyFilter} onValueChange={setCompanyFilter}>
                    <SelectTrigger className="h-8 w-[160px] text-[13px]"><SelectValue placeholder="All Companies" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Companies</SelectItem>
                      {companies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="h-8 w-[120px] text-[13px]"><SelectValue placeholder="All Years" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {hasFilters && (
                    <Button variant="ghost" size="sm" className="h-8 text-[12px] text-muted-foreground"
                      onClick={() => { setSearch(''); setStatusFilter('all'); setCompanyFilter('all'); setYearFilter('all'); }}>
                      <Filter className="w-3 h-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow>
                      <TableHead className="pl-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-[100px]">ID</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <div className="flex cursor-pointer items-center gap-1 hover:text-foreground" onClick={() => toggleSort('companyName')}>
                          Company <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </TableHead>
                      <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Project</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <div className="flex cursor-pointer items-center gap-1 hover:text-foreground" onClick={() => toggleSort('startDate')}>
                          Start Date <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </TableHead>
                      <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <div className="flex cursor-pointer items-center gap-1 hover:text-foreground" onClick={() => toggleSort('endDate')}>
                          End Date <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </TableHead>
                      <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Duration</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Remaining</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                      <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Support Type</TableHead>
                      <TableHead className="px-4 py-3 w-10" />
                    </TableRow>
                  </TableHeader>

                  <TableBody className="bg-background">
                    {filtered.map((s) => {
                      const sc = slaStatusConfig[s.status];
                      const stc = supportTypeConfig[s.supportType];
                      const duration = calcDurationLabel(s.startDate, s.endDate);
                      const isExpiring = s.status === 'Expiring Soon';
                      const isExpired = s.status === 'Expired';
                      return (
                        <TableRow key={s.id} className="group cursor-pointer" onClick={() => navigate(`/sla/${s.id}`)}>
                          <TableCell className="pl-5 py-3.5">
                            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">{s.id}</span>
                          </TableCell>
                          <TableCell className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="size-7 rounded-md">
                                <AvatarFallback className="rounded-md text-[10px] font-bold text-white" style={{ backgroundColor: avatarColor(s.companyName) }}>
                                  {initials2(s.companyName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-[13px] font-medium">{s.companyName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3.5">
                            <span className="text-[13px]">{s.projectName}</span>
                          </TableCell>
                          <TableCell className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                              <Calendar className="w-3 h-3" />{s.startDate}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3.5">
                            <div className={`flex items-center gap-1.5 text-[12px] ${isExpired ? 'text-red-600' : isExpiring ? 'text-amber-600' : 'text-muted-foreground'}`}>
                              <Calendar className="w-3 h-3" />{s.endDate}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3.5">
                            <span className="text-[12px] text-muted-foreground">{duration}</span>
                          </TableCell>
                          <TableCell className="px-4 py-3.5">
                            <span className={`text-[12px] font-medium ${isExpired ? 'text-red-600' : isExpiring ? 'text-amber-600' : 'text-muted-foreground'}`}>
                              {s.remaining}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3.5">
                            <Badge variant="outline" className={`gap-1.5 text-[11px] ${sc.badgeClass}`}>
                              <span className={`size-1.5 rounded-full ${sc.dotClass}`} />
                              {s.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3.5">
                            <Badge variant="outline" className={`gap-1.5 text-[11px] ${stc.badgeClass}`}>
                              <span className={`size-1.5 rounded-full ${stc.dotClass}`} />
                              {s.supportType}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                            <RowActionsMenu
                              entityName={s.id}
                              onView={() => navigate(`/sla/${s.id}`)}
                              onEdit={() => setEditingSLA(s)}
                              onDelete={() => deleteSLA(s.id)}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={10} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <FileText className="w-8 h-8 text-muted-foreground" />
                            <div>
                              <div className="text-[14px] font-medium">No SLAs found</div>
                              <div className="mt-1 text-[13px] text-muted-foreground">Try adjusting your search or filters</div>
                            </div>
                            {hasFilters && (
                              <Button variant="outline" size="sm" className="text-[13px]"
                                onClick={() => { setSearch(''); setStatusFilter('all'); setCompanyFilter('all'); setYearFilter('all'); }}>
                                Clear filters
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>

              <div className="flex items-center justify-between border-t bg-background px-5 py-3">
                <span className="text-[12px] text-muted-foreground">Showing {filtered.length} of {total} SLAs</span>
                <Button variant="outline" size="sm" className="gap-1.5 text-[12px] h-7 px-2.5" onClick={() => exportSLAsToExcel(filtered)}>
                  <Download className="w-3 h-3" />
                  Export all
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
      {editingSLA && <EditSLADialog sla={editingSLA} onClose={() => setEditingSLA(null)} />}
    </div>
  );
}
