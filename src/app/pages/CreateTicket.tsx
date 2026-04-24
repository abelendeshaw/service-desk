import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, AlertCircle, ChevronRight, Info, Users, Building2, Tag, Calendar, AlignLeft } from 'lucide-react';
import { useServiceDesk } from '../store/serviceDeskStore';

const steps = ['Basic Info', 'Assignment', 'Review'];

export function CreateTicket() {
  const navigate = useNavigate();
  const { engineers, createTicket } = useServiceDesk();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    client: '',
    support: '',
    team: '',
    engineerId: '',
    subject: '',
    type: '',
    deadline: '',
    description: '',
    priority: '',
  });

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const fieldClasses = "w-full h-9 px-3 border border-[#e1e4e8] rounded-md text-[13px] text-[#1a1d21] bg-white focus:outline-none focus:ring-2 focus:ring-[#0b2235]/20 focus:border-[#0b2235] transition-all placeholder-[#9ca3af]";
  const selectClasses = `${fieldClasses} appearance-none`;
  const labelClasses = "block text-[12px] font-medium text-[#4b5563] mb-1.5";

  const clients = ['EPSS Client', 'ESLSE Client', 'IE Client', 'EOTC Client', 'ERA/MOTL Client', 'MinT Client', 'MoTI Client'];
  const supports = ['Technical Support', 'Network Support', 'General Support', 'Maintenance Support'];
  const teams = ['END Team', 'ICT Field Team', 'CSD Team', 'NOC Team'];
  const types = ['Incident', 'Request', 'Problem', 'Maintenance', 'Change'];
  const priorities = ['Critical', 'High', 'Medium', 'Low'];

  return (
    <div className="min-h-full bg-[#f8f9fa] p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/tickets')}
            className="w-8 h-8 flex items-center justify-center text-[#6c757d] hover:text-[#0b2235] hover:bg-white border border-[#e1e4e8] rounded-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-[20px] font-semibold text-[#0b2235]">Create Ticket</h1>
            <p className="text-[13px] text-[#6c757d]">Capture a new support request</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all ${
                    i < step ? 'bg-[#059669] text-white' :
                    i === step ? 'bg-[#0b2235] text-white' :
                    'bg-[#f1f3f5] text-[#9ca3af]'
                  }`}
                >
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-[12px] font-medium ${i === step ? 'text-[#0b2235]' : i < step ? 'text-[#059669]' : 'text-[#9ca3af]'}`}>
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-px w-12 ${i < step ? 'bg-[#059669]' : 'bg-[#e1e4e8]'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Form */}
          <div className="col-span-2 flex flex-col gap-4">
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
                      <select value={form.client} onChange={e => update('client', e.target.value)} className={selectClasses}>
                        <option value="">Select client</option>
                        {clients.map(c => <option key={c}>{c}</option>)}
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
                        <label className={labelClasses}>
                          Type <span className="text-red-500 ml-0.5">*</span>
                        </label>
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
                      <label className={labelClasses}>
                        Expected End Date <span className="text-red-500 ml-0.5">*</span>
                      </label>
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
                <div className="space-y-4">
                  <div>
                    <label className={labelClasses}>
                      Assign Team <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <select value={form.team} onChange={e => update('team', e.target.value)} className={selectClasses}>
                      <option value="">Select team</option>
                      {teams.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClasses}>Assign Agent</label>
                    <select value={form.engineerId} onChange={e => update('engineerId', e.target.value)} className={selectClasses}>
                      <option value="">Select engineer (optional)</option>
                      {engineers.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
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
                    { label: 'Support Type', value: form.support || '—' },
                    { label: 'Subject', value: form.subject || '—' },
                    { label: 'Type', value: form.type || '—' },
                    { label: 'Priority', value: form.priority || 'No priority' },
                    { label: 'Deadline', value: form.deadline || '—' },
                    { label: 'Team', value: form.team || '—' },
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
          <div className="space-y-4">
            <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-lg p-4">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#2563eb] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[12px] font-semibold text-[#1d4ed8] mb-1.5">Ticket Guidelines</div>
                  <ul className="text-[12px] text-[#3b82f6] space-y-1 leading-relaxed">
                    <li>• Include all relevant error messages</li>
                    <li>• Specify affected systems or sites</li>
                    <li>• Set a realistic deadline</li>
                    <li>• Assign to the appropriate team</li>
                  </ul>
                </div>
              </div>
            </div>

            {form.subject && (
              <div className="bg-white border border-[#e1e4e8] rounded-lg p-4">
                <div className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-3">Preview</div>
                <div className="space-y-2">
                  <div className="text-[13px] font-medium text-[#0b2235] leading-snug">{form.subject}</div>
                  {form.client && <div className="text-[12px] text-[#6c757d]">{form.client}</div>}
                  {form.type && (
                    <span className="inline-block px-2 py-0.5 bg-[#f1f3f5] text-[#6c757d] text-[11px] rounded-md">
                      {form.type}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-[#e1e4e8]">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/tickets')}
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
              onClick={() => {
                const id = createTicket({
                  project: form.client ? form.client.split(' ')[0] : 'Unknown',
                  contactName: form.client || 'Client Contact',
                  supportType: form.support || 'General Support',
                  subject: form.subject || 'New Ticket',
                  description: form.description || '',
                  priority: (form.priority as any) || null,
                  resolutionDueDate: form.deadline || null,
                  issues: [
                    {
                      title: form.subject || 'Issue',
                      description: form.description || '',
                      attachments: [],
                    },
                  ],
                  initialAssignmentEngineerId: form.engineerId || null,
                });
                navigate(`/tickets/${id}`);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-9 items-center gap-1.5 rounded-md px-4 text-[13px] font-medium transition-colors"
            >
              Create Ticket
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
