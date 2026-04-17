import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Info, LifeBuoy, Users, Calendar, Tag, ChevronRight, Building2, CheckCircle2 } from 'lucide-react';

const steps = ['Type & Scope', 'Client & Team', 'Duration', 'Review'];

export function CreateSupport() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    type: '',
    name: '',
    client: '',
    team: '',
    agent: '',
    startDate: '',
    endDate: '',
    notes: '',
  });

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const fieldClasses = "w-full h-9 px-3 border border-[#e1e4e8] rounded-md text-[13px] text-[#1a1d21] bg-white focus:outline-none focus:ring-2 focus:ring-[#0b2235]/20 focus:border-[#0b2235] transition-all placeholder-[#9ca3af]";
  const selectClasses = `${fieldClasses} appearance-none`;
  const labelClasses = "block text-[12px] font-medium text-[#4b5563] mb-1.5";

  const supportTypes = ['Technical Support', 'Maintenance', 'Network Support', 'General Support', 'CSAT Support'];
  const clients = ['EPSS Client', 'ESLSE Client', 'IE Client', 'EOTC Client', 'ERA/MOTL Client', 'MinT Client', 'MoTI Client'];
  const teams = ['END Team', 'ICT Field Team', 'CSD Team', 'NOC Team'];

  const sectionIcons: any[] = [Tag, Users, Calendar, CheckCircle2];

  return (
    <div className="min-h-full bg-[#f8f9fa] p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/support')}
            className="w-8 h-8 flex items-center justify-center text-[#6c757d] hover:text-[#0b2235] hover:bg-white border border-[#e1e4e8] rounded-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-[20px] font-semibold text-[#0b2235]">Create Support</h1>
            <p className="text-[13px] text-[#6c757d]">Set up a new client support engagement</p>
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
          <div className="col-span-2 space-y-4">
            {step === 0 && (
              <div className="bg-white border border-[#e1e4e8] rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4 text-[#9ca3af]" />
                  <h3 className="text-[14px] font-semibold text-[#0b2235]">Support Type & Scope</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className={labelClasses}>Support Type <span className="text-red-500">*</span></label>
                    <select value={form.type} onChange={e => update('type', e.target.value)} className={selectClasses}>
                      <option value="">Select support type</option>
                      {supportTypes.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClasses}>Engagement Name <span className="text-red-500">*</span></label>
                    <input
                      value={form.name}
                      onChange={e => update('name', e.target.value)}
                      placeholder="e.g. EPSS Technical Support Q1 2026"
                      className={fieldClasses}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Notes</label>
                    <textarea
                      value={form.notes}
                      onChange={e => update('notes', e.target.value)}
                      placeholder="Additional notes about this support engagement..."
                      rows={3}
                      className="w-full px-3 py-2.5 border border-[#e1e4e8] rounded-md text-[13px] text-[#1a1d21] bg-white focus:outline-none focus:ring-2 focus:ring-[#0b2235]/20 focus:border-[#0b2235] resize-none placeholder-[#9ca3af]"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="bg-white border border-[#e1e4e8] rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-[#9ca3af]" />
                  <h3 className="text-[14px] font-semibold text-[#0b2235]">Client & Team Assignment</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className={labelClasses}>Client <span className="text-red-500">*</span></label>
                    <select value={form.client} onChange={e => update('client', e.target.value)} className={selectClasses}>
                      <option value="">Select client</option>
                      {clients.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClasses}>Solutions (Team) <span className="text-red-500">*</span></label>
                    <select value={form.team} onChange={e => update('team', e.target.value)} className={selectClasses}>
                      <option value="">Select team</option>
                      {teams.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClasses}>Lead Agent</label>
                    <select value={form.agent} onChange={e => update('agent', e.target.value)} className={selectClasses}>
                      <option value="">Select agent (optional)</option>
                      <option>Sisay Shiferaw</option>
                      <option>Wongel Wondyifraw</option>
                      <option>Masresha Melese</option>
                      <option>Mebrate Degu</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white border border-[#e1e4e8] rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-[#9ca3af]" />
                  <h3 className="text-[14px] font-semibold text-[#0b2235]">Support Duration</h3>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Start Date <span className="text-red-500">*</span></label>
                      <input type="date" value={form.startDate} onChange={e => update('startDate', e.target.value)} className={fieldClasses} />
                    </div>
                    <div>
                      <label className={labelClasses}>End Date <span className="text-red-500">*</span></label>
                      <input type="date" value={form.endDate} onChange={e => update('endDate', e.target.value)} className={fieldClasses} />
                    </div>
                  </div>
                  {form.startDate && form.endDate && (
                    <div className="flex items-center gap-2 p-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-md text-[12px] text-[#059669]">
                      <CheckCircle2 className="w-4 h-4" />
                      Duration selected: {form.startDate} to {form.endDate}
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white border border-[#e1e4e8] rounded-lg p-5">
                <h3 className="text-[14px] font-semibold text-[#0b2235] mb-4">Review & Confirm</h3>
                <div className="space-y-0">
                  {[
                    { label: 'Support Type', value: form.type || '—' },
                    { label: 'Name', value: form.name || '—' },
                    { label: 'Client', value: form.client || '—' },
                    { label: 'Team', value: form.team || '—' },
                    { label: 'Lead Agent', value: form.agent || 'Not assigned' },
                    { label: 'Start Date', value: form.startDate || '—' },
                    { label: 'End Date', value: form.endDate || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-4 py-2.5 border-b border-[#f8f9fa] last:border-0">
                      <div className="text-[12px] text-[#9ca3af] w-28 flex-shrink-0">{label}</div>
                      <div className="text-[13px] font-medium text-[#1a1d21]">{value}</div>
                    </div>
                  ))}
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
                  <div className="text-[12px] font-semibold text-[#1d4ed8] mb-2">About CSAT</div>
                  <p className="text-[12px] text-[#3b82f6] leading-relaxed">
                    Customer Satisfaction (CSAT) tracking is automatically enabled for all support engagements. Clients receive automated feedback requests after ticket resolution.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#e1e4e8] rounded-lg p-4">
              <div className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-3">Checklist</div>
              <div className="space-y-2">
                {[
                  { label: 'Support type selected', done: !!form.type },
                  { label: 'Name provided', done: !!form.name },
                  { label: 'Client assigned', done: !!form.client },
                  { label: 'Team assigned', done: !!form.team },
                  { label: 'Duration set', done: !!(form.startDate && form.endDate) },
                ].map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${done ? 'border-[#059669] bg-[#059669]' : 'border-[#d1d5db]'}`}>
                      {done && <div className="w-1.5 h-1 border-l border-b border-white rotate-[-45deg] mt-px" />}
                    </div>
                    <span className={`text-[12px] ${done ? 'text-[#059669]' : 'text-[#9ca3af]'}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-[#e1e4e8]">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/support')}
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
              onClick={() => navigate('/support')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-9 items-center gap-1.5 rounded-md px-4 text-[13px] font-medium transition-colors"
            >
              Create Support
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
