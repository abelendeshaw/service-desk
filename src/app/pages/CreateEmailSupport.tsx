import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  Mail,
  Users,
  Tag,
  ChevronRight,
  Info,
  Bold,
  Italic,
  Link,
  List,
  Paperclip,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const steps = ['Compose', 'Routing', 'Review'];

const clients = [
  { name: 'EPSS Client', email: 'epss@gmail.com', color: '#7c3aed', initials: 'EP' },
  { name: 'ESLSE Client', email: 'eslse@gmail.com', color: '#1d4ed8', initials: 'ES' },
  { name: 'IE Client', email: 'ie@gmail.com', color: '#0891b2', initials: 'IE' },
  { name: 'EOTC Client', email: 'eotc@gmail.com', color: '#7c3aed', initials: 'EO' },
  { name: 'ERA/MOTL Client', email: 'eramotl@gmail.com', color: '#059669', initials: 'ER' },
  { name: 'MinT Client', email: 'mint@gmail.com', color: '#6b7280', initials: 'MI' },
  { name: 'MoTI Client', email: 'moti@gmail.com', color: '#6366f1', initials: 'MO' },
];

export function CreateEmailSupport() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    to: '',
    cc: '',
    subject: '',
    body: '',
    priority: 'Medium',
    tag: '',
    agent: '',
    team: '',
  });
  const [attachments, setAttachments] = useState<string[]>([]);

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const fieldClasses = "w-full h-9 px-3 border border-[#e1e4e8] rounded-md text-[13px] text-[#1a1d21] bg-white focus:outline-none focus:ring-2 focus:ring-[#0b2235]/20 focus:border-[#0b2235] transition-all placeholder-[#9ca3af]";
  const selectClasses = `${fieldClasses} appearance-none`;
  const labelClasses = "block text-[12px] font-medium text-[#4b5563] mb-1.5";

  const selectedClient = clients.find(c => c.email === form.to);

  const checklist = [
    { label: 'Recipient selected', done: !!form.to },
    { label: 'Subject added', done: !!form.subject },
    { label: 'Message body written', done: form.body.length > 20 },
    { label: 'Priority set', done: !!form.priority },
    { label: 'Team assigned', done: !!form.team },
  ];

  return (
    <div className="min-h-full bg-[#f8f9fa] p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/email-support')}
            className="w-8 h-8 flex items-center justify-center text-[#6c757d] hover:text-[#0b2235] hover:bg-white border border-[#e1e4e8] rounded-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-[20px] font-semibold text-[#0b2235]">Compose Email</h1>
            <p className="text-[13px] text-[#6c757d]">Send a new email support message to a client</p>
          </div>
        </div>

        {/* Steps */}
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
              <>
                {/* Recipients */}
                <div className="bg-white border border-[#e1e4e8] rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="w-4 h-4 text-[#9ca3af]" />
                    <h3 className="text-[14px] font-semibold text-[#0b2235]">Recipients</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className={labelClasses}>To <span className="text-red-500">*</span></label>
                      <select
                        value={form.to}
                        onChange={e => update('to', e.target.value)}
                        className={selectClasses}
                      >
                        <option value="">Select client recipient</option>
                        {clients.map(c => (
                          <option key={c.email} value={c.email}>
                            {c.name} — {c.email}
                          </option>
                        ))}
                      </select>
                      {selectedClient && (
                        <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-[#f8f9fa] rounded-md border border-[#e1e4e8]">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0"
                            style={{ backgroundColor: selectedClient.color }}
                          >
                            {selectedClient.initials}
                          </div>
                          <div className="text-[12px] text-[#1a1d21] font-medium">{selectedClient.name}</div>
                          <div className="text-[12px] text-[#9ca3af]">{selectedClient.email}</div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className={labelClasses}>CC <span className="text-[#9ca3af] font-normal">(optional)</span></label>
                      <input
                        value={form.cc}
                        onChange={e => update('cc', e.target.value)}
                        placeholder="cc@company.com"
                        className={fieldClasses}
                      />
                    </div>
                  </div>
                </div>

                {/* Subject & Body */}
                <div className="bg-white border border-[#e1e4e8] rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-4 h-4 text-[#9ca3af]" />
                    <h3 className="text-[14px] font-semibold text-[#0b2235]">Message</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className={labelClasses}>Subject <span className="text-red-500">*</span></label>
                      <input
                        value={form.subject}
                        onChange={e => update('subject', e.target.value)}
                        placeholder="Brief description of the issue or request"
                        className={fieldClasses}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Priority</label>
                      <div className="flex items-center gap-2">
                        {['Critical', 'High', 'Medium', 'Low'].map(p => (
                          <button
                            key={p}
                            onClick={() => update('priority', p)}
                            className={`flex-1 h-8 rounded-md text-[12px] font-medium border transition-all ${
                              form.priority === p
                                ? p === 'Critical' ? 'bg-red-50 border-red-200 text-red-600'
                                  : p === 'High' ? 'bg-orange-50 border-orange-200 text-orange-600'
                                  : p === 'Medium' ? 'bg-amber-50 border-amber-200 text-amber-600'
                                  : 'bg-green-50 border-green-200 text-green-600'
                                : 'bg-white border-[#e1e4e8] text-[#9ca3af] hover:border-[#0b2235] hover:text-[#4b5563]'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={labelClasses}>Body <span className="text-red-500">*</span></label>
                      {/* Formatting Toolbar */}
                      <div className="flex items-center gap-0.5 px-2 py-1.5 border border-[#e1e4e8] rounded-t-md bg-[#f8f9fa] border-b-0">
                        {[
                          { Icon: Bold, label: 'Bold' },
                          { Icon: Italic, label: 'Italic' },
                          { Icon: Link, label: 'Link' },
                          { Icon: List, label: 'List' },
                        ].map(({ Icon, label }) => (
                          <button
                            key={label}
                            title={label}
                            className="w-7 h-7 flex items-center justify-center text-[#9ca3af] hover:text-[#4b5563] hover:bg-white rounded transition-colors"
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </button>
                        ))}
                        <div className="w-px h-4 bg-[#e1e4e8] mx-1" />
                        <button className="flex items-center gap-1 px-2 h-6 text-[11px] text-[#9ca3af] hover:text-[#4b5563] hover:bg-white rounded transition-colors">
                          <Paperclip className="w-3 h-3" />
                          Attach
                        </button>
                      </div>
                      <textarea
                        value={form.body}
                        onChange={e => update('body', e.target.value)}
                        placeholder="Write your message here. Include relevant details such as error messages, affected systems, and urgency level..."
                        rows={8}
                        className="w-full px-3 py-2.5 border border-[#e1e4e8] rounded-b-md text-[13px] text-[#1a1d21] bg-white focus:outline-none focus:ring-2 focus:ring-[#0b2235]/20 focus:border-[#0b2235] resize-none placeholder-[#9ca3af]"
                      />
                    </div>

                    {/* Attachments */}
                    {attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {attachments.map((att, i) => (
                          <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#f8f9fa] border border-[#e1e4e8] rounded-md">
                            <Paperclip className="w-3 h-3 text-[#9ca3af]" />
                            <span className="text-[12px] text-[#4b5563]">{att}</span>
                            <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}>
                              <X className="w-3 h-3 text-[#9ca3af] hover:text-[#6c757d]" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
              <div className="bg-white border border-[#e1e4e8] rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-[#9ca3af]" />
                  <h3 className="text-[14px] font-semibold text-[#0b2235]">Routing & Assignment</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className={labelClasses}>Assign Team <span className="text-red-500">*</span></label>
                    <select value={form.team} onChange={e => update('team', e.target.value)} className={selectClasses}>
                      <option value="">Select team</option>
                      <option>END Team</option>
                      <option>ICT Field Team</option>
                      <option>CSD Team</option>
                      <option>NOC Team</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClasses}>Assign Agent <span className="text-[#9ca3af] font-normal">(optional)</span></label>
                    <select value={form.agent} onChange={e => update('agent', e.target.value)} className={selectClasses}>
                      <option value="">Auto-assign based on availability</option>
                      <option>Wongel Wondyifraw</option>
                      <option>Sisay Shiferaw</option>
                      <option>Masresha Melese</option>
                      <option>Dawit Bekele</option>
                      <option>Mebrate Degu</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClasses}>Tag</label>
                    <select value={form.tag} onChange={e => update('tag', e.target.value)} className={selectClasses}>
                      <option value="">Select tag (optional)</option>
                      <option>Network</option>
                      <option>Access</option>
                      <option>Infrastructure</option>
                      <option>Reporting</option>
                      <option>CSAT</option>
                      <option>Critical</option>
                    </select>
                  </div>

                  <div className="p-3 bg-[#f8f9fa] rounded-md border border-[#e1e4e8]">
                    <div className="text-[11px] font-semibold text-[#4b5563] mb-2">Routing Preview</div>
                    <div className="text-[12px] text-[#6c757d] space-y-1">
                      <div className="flex gap-2">
                        <span className="text-[#9ca3af] w-20">To:</span>
                        <span className="font-medium text-[#1a1d21]">{form.to || '—'}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[#9ca3af] w-20">Team:</span>
                        <span className="font-medium text-[#1a1d21]">{form.team || 'Not assigned'}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[#9ca3af] w-20">Agent:</span>
                        <span className="font-medium text-[#1a1d21]">{form.agent || 'Auto-assign'}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[#9ca3af] w-20">Priority:</span>
                        <span className="font-medium text-[#1a1d21]">{form.priority}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white border border-[#e1e4e8] rounded-lg p-5">
                <h3 className="text-[14px] font-semibold text-[#0b2235] mb-4">Review & Send</h3>

                {/* Email Preview */}
                <div className="border border-[#e1e4e8] rounded-md overflow-hidden mb-4">
                  <div className="bg-[#f8f9fa] px-4 py-3 border-b border-[#e1e4e8]">
                    <div className="text-[12px] text-[#4b5563] space-y-1">
                      <div className="flex gap-2">
                        <span className="text-[#9ca3af] w-14">From:</span>
                        <span className="font-medium">support@ienetworks.co</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[#9ca3af] w-14">To:</span>
                        <span className="font-medium">{form.to || '—'}</span>
                      </div>
                      {form.cc && (
                        <div className="flex gap-2">
                          <span className="text-[#9ca3af] w-14">CC:</span>
                          <span className="font-medium">{form.cc}</span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <span className="text-[#9ca3af] w-14">Subject:</span>
                        <span className="font-medium">{form.subject || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    {form.body ? (
                      <pre className="text-[13px] text-[#4b5563] leading-relaxed font-sans whitespace-pre-wrap">{form.body}</pre>
                    ) : (
                      <div className="text-[13px] text-[#9ca3af] italic">No message body</div>
                    )}
                  </div>
                </div>

                <div className="space-y-0">
                  {[
                    { label: 'Team', value: form.team || '—' },
                    { label: 'Agent', value: form.agent || 'Auto-assign' },
                    { label: 'Priority', value: form.priority },
                    { label: 'Tag', value: form.tag || 'None' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-4 py-2.5 border-b border-[#f8f9fa] last:border-0">
                      <div className="text-[12px] text-[#9ca3af] w-24 flex-shrink-0">{label}</div>
                      <div className="text-[13px] font-medium text-[#1a1d21]">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-start gap-2.5 p-3 bg-[#eff6ff] border border-[#bfdbfe] rounded-md">
                  <AlertCircle className="w-4 h-4 text-[#2563eb] flex-shrink-0 mt-0.5" />
                  <p className="text-[12px] text-[#3b82f6]">
                    This email will be sent from <span className="font-medium">support@ienetworks.co</span> and tracked as EM-{String(Date.now()).slice(-3)}.
                  </p>
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
                  <div className="text-[12px] font-semibold text-[#1d4ed8] mb-1.5">Email Guidelines</div>
                  <ul className="text-[12px] text-[#3b82f6] space-y-1 leading-relaxed">
                    <li>• Use clear, professional subject lines</li>
                    <li>• Reference ticket IDs when applicable</li>
                    <li>• Set appropriate priority levels</li>
                    <li>• Assign to the correct team</li>
                    <li>• All emails are tracked and logged</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#e1e4e8] rounded-lg p-4">
              <div className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-3">Checklist</div>
              <div className="space-y-2">
                {checklist.map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${done ? 'border-[#059669] bg-[#059669]' : 'border-[#d1d5db]'}`}>
                      {done && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className={`text-[12px] ${done ? 'text-[#059669]' : 'text-[#9ca3af]'}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {form.subject && (
              <div className="bg-white border border-[#e1e4e8] rounded-lg p-4">
                <div className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-3">Preview</div>
                <div className="space-y-2">
                  <div className="text-[13px] font-medium text-[#0b2235] leading-snug">{form.subject}</div>
                  {selectedClient && (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-semibold"
                        style={{ backgroundColor: selectedClient.color }}
                      >
                        {selectedClient.initials}
                      </div>
                      <span className="text-[12px] text-[#6c757d]">{selectedClient.name}</span>
                    </div>
                  )}
                  {form.priority && (
                    <span className={`inline-block px-2 py-0.5 text-[11px] rounded-md font-medium ${
                      form.priority === 'Critical' ? 'bg-red-50 text-red-600' :
                      form.priority === 'High' ? 'bg-orange-50 text-orange-600' :
                      form.priority === 'Medium' ? 'bg-amber-50 text-amber-600' :
                      'bg-green-50 text-green-600'
                    }`}>
                      {form.priority}
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
            onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/email-support')}
            className="flex items-center gap-1.5 h-9 px-4 text-[13px] font-medium text-[#6c757d] border border-[#e1e4e8] rounded-md bg-white hover:border-[#0b2235] hover:text-[#0b2235] transition-colors"
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </button>

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-1.5 h-9 px-4 text-[13px] font-medium text-white bg-[#0b2235] rounded-md hover:bg-[#0f2d45] transition-colors"
            >
              Continue <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/email-support')}
              className="flex items-center gap-1.5 h-9 px-4 text-[13px] font-medium text-white bg-[#059669] rounded-md hover:bg-[#047857] transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Send Email
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
