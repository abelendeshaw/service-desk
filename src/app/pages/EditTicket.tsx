import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, ChevronRight, Info, Users, Building2, Tag, AlignLeft } from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { useServiceDesk } from '../store/serviceDeskStore';

const steps = ['Basic Info', 'Assignment', 'Review'];
const AVATAR_COLORS = ['#7c3aed', '#1d4ed8', '#0891b2', '#059669', '#d97706', '#dc2626'];

export function EditTicket() {
  const navigate = useNavigate();
  const params = useParams();
  const ticketId = (params.id ?? '').replace('#', '');
  const { tickets, engineers, updateTicket } = useServiceDesk();
  const ticket = tickets.find((t) => t.id === ticketId);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    client: '',
    project: '',
    support: '',
    teams: [] as string[],
    assignedEngineerIds: [] as string[],
    subject: '',
    type: '',
    deadline: '',
    description: '',
    priority: '',
  });

  useEffect(() => {
    if (!ticket) return;
    setForm({
      client: ticket.contactName,
      project: ticket.project,
      support: ticket.supportType,
      teams: [],
      assignedEngineerIds: ticket.assignedEngineerIds ?? (ticket.assignedEngineerId ? [ticket.assignedEngineerId] : []),
      subject: ticket.subject,
      type: '',
      deadline: ticket.resolutionDueDate ?? '',
      description: ticket.description,
      priority: ticket.priority ?? '',
    });
  }, [ticket]);

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const toggleTeam = (team: string) =>
    setForm(prev => ({
      ...prev,
      teams: prev.teams.includes(team) ? prev.teams.filter(t => t !== team) : [...prev.teams, team],
    }));

  const toggleEngineer = (id: string) =>
    setForm(prev => ({
      ...prev,
      assignedEngineerIds: prev.assignedEngineerIds.includes(id)
        ? prev.assignedEngineerIds.filter(x => x !== id)
        : [...prev.assignedEngineerIds, id],
    }));

  const fieldClasses = "w-full h-9 px-3 border border-[#e1e4e8] rounded-md text-[13px] text-[#1a1d21] bg-white focus:outline-none focus:ring-2 focus:ring-[#0b2235]/20 focus:border-[#0b2235] transition-all placeholder-[#9ca3af]";
  const selectClasses = `${fieldClasses} appearance-none`;
  const labelClasses = "block text-[12px] font-medium text-[#4b5563] mb-1.5";

  const clients = ['EPSS Client', 'ESLSE Client', 'IE Client', 'EOTC Client', 'ERA/MOTL Client', 'MinT Client', 'MoTI Client'];
  const clientProjects: Record<string, string[]> = {
    'EPSS Client': ['EPSS'], 'ESLSE Client': ['ESLSE'], 'IE Client': ['IE'],
    'EOTC Client': ['EOTC'], 'ERA/MOTL Client': ['ERA/MOTL'], 'MinT Client': ['MinT'], 'MoTI Client': ['MoTI'],
  };
  const projectOptions = form.client ? (clientProjects[form.client] ?? []) : Object.values(clientProjects).flat();
  const supports = ['Technical Support', 'Network Support', 'General Support', 'Maintenance Support'];
  const teams = ['END Team', 'ICT Field Team', 'CSD Team', 'NOC Team'];
  const types = ['Incident', 'Request', 'Problem', 'Maintenance', 'Change'];
  const priorities = ['Critical', 'High', 'Medium', 'Low'];

  const assignedEngineerNames = form.assignedEngineerIds
    .map(id => engineers.find(e => e.id === id)?.name)
    .filter(Boolean)
    .join(', ');

  if (!ticket) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[13px] text-muted-foreground">Ticket not found.</p>
      </div>
    );
  }

  const handleSave = () => {
    updateTicket({
      ticketId: ticket.id,
      subject: form.subject.trim(),
      description: form.description.trim(),
      project: form.project,
      contactName: form.client,
      supportType: form.support,
      priority: (form.priority as any) || null,
      resolutionDueDate: form.deadline || null,
      assignedEngineerIds: form.assignedEngineerIds,
    });
    navigate(`/tickets/${ticket.id}`);
  };

  return (
    <div className="min-h-full bg-[#f8f9fa] p-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(`/tickets/${ticket.id}`)}
            className="w-8 h-8 flex items-center justify-center text-[#6c757d] hover:text-[#0b2235] hover:bg-white border border-[#e1e4e8] rounded-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-[20px] font-semibold text-[#0b2235]">Edit Ticket #{ticket.id}</h1>
            <p className="text-[13px] text-[#6c757d]">Update the details for this support request</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-6 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`flex size-6 items-center justify-center rounded-full text-[11px] font-semibold transition-all ${
                    i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-[12px] font-medium ${i <= step ? 'text-primary' : 'text-muted-foreground'}`}>
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-px w-12 ${i < step ? 'bg-primary/70' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {/* Form */}
          <div className="flex flex-col gap-4 lg:col-span-3">
            {step === 0 && (
              <>
                <div className="bg-white border border-[#e1e4e8] rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-4 h-4 text-[#9ca3af]" />
                    <h3 className="text-[14px] font-semibold text-[#0b2235]">Client & Support</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className={labelClasses}>
                        Client <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <select
                        value={form.client}
                        onChange={e => { update('client', e.target.value); update('project', ''); }}
                        className={selectClasses}
                      >
                        <option value="">Select client</option>
                        {clients.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClasses}>
                        Project <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <select value={form.project} onChange={e => update('project', e.target.value)} className={selectClasses}>
                        <option value="">{form.client ? 'Select project' : 'Select client first'}</option>
                        {projectOptions.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClasses}>
                        Support Type <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <select value={form.support} onChange={e => update('support', e.target.value)} className={selectClasses}>
                        <option value="">Select support type</option>
                        {supports.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#e1e4e8] rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-4 h-4 text-[#9ca3af]" />
                    <h3 className="text-[14px] font-semibold text-[#0b2235]">Ticket Details</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className={labelClasses}>
                        Subject <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <input
                        value={form.subject}
                        onChange={e => update('subject', e.target.value)}
                        placeholder="Brief description of the issue"
                        className={fieldClasses}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClasses}>Type</label>
                        <select value={form.type} onChange={e => update('type', e.target.value)} className={selectClasses}>
                          <option value="">Select type</option>
                          {types.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClasses}>Priority</label>
                        <select value={form.priority} onChange={e => update('priority', e.target.value)} className={selectClasses}>
                          <option value="">No priority</option>
                          {priorities.map(p => <option key={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelClasses}>Expected End Date</label>
                      <input
                        type="date"
                        value={form.deadline}
                        onChange={e => update('deadline', e.target.value)}
                        className={fieldClasses}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#e1e4e8] rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <AlignLeft className="w-4 h-4 text-[#9ca3af]" />
                    <h3 className="text-[14px] font-semibold text-[#0b2235]">Description</h3>
                  </div>
                  <textarea
                    value={form.description}
                    onChange={e => update('description', e.target.value)}
                    placeholder="Describe the issue in detail — include error messages, affected systems, and steps taken..."
                    rows={5}
                    className="w-full px-3 py-2.5 border border-[#e1e4e8] rounded-md text-[13px] text-[#1a1d21] bg-white focus:outline-none focus:ring-2 focus:ring-[#0b2235]/20 focus:border-[#0b2235] resize-none placeholder-[#9ca3af]"
                  />
                </div>
              </>
            )}

            {step === 1 && (
              <div className="bg-white border border-[#e1e4e8] rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-[#9ca3af]" />
                  <h3 className="text-[14px] font-semibold text-[#0b2235]">Team Assignment</h3>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className={labelClasses}>Assign Team</label>
                    <select
                      value=""
                      onChange={e => { if (e.target.value) toggleTeam(e.target.value); }}
                      className={selectClasses}
                    >
                      <option value="">Select team</option>
                      {teams.filter(t => !form.teams.includes(t)).map(t => <option key={t}>{t}</option>)}
                    </select>
                    {form.teams.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {form.teams.map(t => (
                          <span key={t} className="inline-flex items-center gap-1 h-6 px-2 rounded-full bg-[#0b2235]/8 border border-[#0b2235]/20 text-[12px] font-medium text-[#0b2235]">
                            {t}
                            <button
                              type="button"
                              onClick={() => toggleTeam(t)}
                              className="ml-0.5 flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-[#0b2235]/15 transition-colors"
                            >
                              <svg className="w-2 h-2" viewBox="0 0 8 8" fill="none">
                                <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={labelClasses}>
                      Assign Engineers
                      {form.assignedEngineerIds.length > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#0b2235] text-white text-[9px] font-semibold">
                          {form.assignedEngineerIds.length}
                        </span>
                      )}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {engineers.map((eng, i) => {
                        const checked = form.assignedEngineerIds.includes(eng.id);
                        return (
                          <button
                            key={eng.id}
                            type="button"
                            onClick={() => toggleEngineer(eng.id)}
                            className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                              checked
                                ? 'border-[#0b2235] bg-[#0b2235]/5 ring-1 ring-[#0b2235]/20'
                                : 'border-[#e1e4e8] hover:border-[#0b2235]/30 hover:bg-[#f8f9fa]'
                            }`}
                          >
                            <Avatar className="size-7 shrink-0">
                              <AvatarFallback
                                className="text-[10px] font-semibold text-white"
                                style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                              >
                                {eng.initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className={`text-[12px] font-medium truncate flex-1 ${checked ? 'text-[#0b2235]' : 'text-[#4b5563]'}`}>
                              {eng.name}
                            </span>
                            {checked && (
                              <div className="h-4 w-4 shrink-0 rounded-full bg-[#0b2235] flex items-center justify-center">
                                <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 12 12">
                                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white border border-[#e1e4e8] rounded-lg p-5">
                <h3 className="text-[14px] font-semibold text-[#0b2235] mb-4">Review & Confirm</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Client', value: form.client || '—' },
                    { label: 'Project', value: form.project || '—' },
                    { label: 'Support Type', value: form.support || '—' },
                    { label: 'Subject', value: form.subject || '—' },
                    { label: 'Type', value: form.type || '—' },
                    { label: 'Priority', value: form.priority || 'No priority' },
                    { label: 'Deadline', value: form.deadline || '—' },
                    { label: 'Teams', value: form.teams.length > 0 ? form.teams.join(', ') : '—' },
                    { label: 'Engineers', value: assignedEngineerNames || 'Unassigned' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start gap-4 py-2.5 border-b border-[#f8f9fa]">
                      <div className="text-[12px] text-[#9ca3af] w-28 flex-shrink-0">{label}</div>
                      <div className="text-[13px] font-medium text-[#1a1d21]">{value}</div>
                    </div>
                  ))}
                  {form.description && (
                    <div className="flex items-start gap-4 py-2.5">
                      <div className="text-[12px] text-[#9ca3af] w-28 flex-shrink-0">Description</div>
                      <div className="text-[13px] text-[#4b5563] leading-relaxed">{form.description}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:col-span-1">
            <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-lg p-4">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#2563eb] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[12px] font-semibold text-[#1d4ed8] mb-1.5">Edit Guidelines</div>
                  <ul className="text-[12px] text-[#3b82f6] space-y-1 leading-relaxed">
                    <li>• Keep the subject clear and concise</li>
                    <li>• Update the deadline if it has changed</li>
                    <li>• Re-assign if the responsible team changed</li>
                    <li>• Add any new details to the description</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#e1e4e8] rounded-lg p-4">
              <div className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-3">Preview</div>
              <div className="space-y-2">
                <div className="text-[13px] font-medium text-[#0b2235] leading-snug">
                  {form.subject || <span className="text-[#9ca3af] font-normal">No subject</span>}
                </div>
                {form.client && <div className="text-[12px] text-[#6c757d]">{form.client}</div>}
                {form.type && (
                  <span className="inline-block px-2 py-0.5 bg-[#f1f3f5] text-[#6c757d] text-[11px] rounded-md">
                    {form.type}
                  </span>
                )}
                <div className="pt-1 border-t border-[#f1f3f5] text-[11px] text-[#9ca3af]">#{ticket.id}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-[#e1e4e8]">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : navigate(`/tickets/${ticket.id}`)}
            className="flex items-center gap-1.5 h-9 px-4 text-[13px] font-medium text-[#6c757d] border border-[#e1e4e8] rounded-md bg-white hover:border-[#0b2235] hover:text-[#0b2235] transition-colors"
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </button>

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-9 items-center gap-1.5 rounded-md px-4 text-[13px] font-medium transition-colors"
            >
              Continue <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-9 items-center gap-1.5 rounded-md px-4 text-[13px] font-medium transition-colors"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
