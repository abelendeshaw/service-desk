import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft, Building2, Globe, Mail, Phone, Ticket,
  User, Plus, ExternalLink, CheckCircle2,
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';

const contactsData = [
  {
    name: 'EPSS Client', email: 'epss@gmail.com', phone: '0987654321',
    role: 'Primary Contact', status: 'Active', initials: 'EP', color: '#7c3aed',
    company: 'EPSS', companyDesc: 'Electric Power Systems Services',
    tier: 'Enterprise', tickets: 18, activeTickets: 12,
    companyPhone: '+251 11 555 0001', companyWebsite: 'https://epss.example.com',
  },
  {
    name: 'ESLSE Client', email: 'eslse@gmail.com', phone: '0987654321',
    role: 'Primary Contact', status: 'Active', initials: 'ES', color: '#1d4ed8',
    company: 'ESLSE', companyDesc: 'Ethiopian Shipping and Logistics Services',
    tier: 'Enterprise', tickets: 6, activeTickets: 3,
    companyPhone: '+251 11 555 0005', companyWebsite: 'https://eslse.example.com',
  },
  {
    name: 'IE Client', email: 'ie@gmail.com', phone: '0987654321',
    role: 'Technical Contact', status: 'Active', initials: 'IE', color: '#0891b2',
    company: 'IE', companyDesc: 'Innovation Ethiopia',
    tier: 'Enterprise', tickets: 38, activeTickets: 25,
    companyPhone: '+251 11 555 0002', companyWebsite: 'https://ie.example.com',
  },
  {
    name: 'EOTC Client', email: 'eotc@gmail.com', phone: '0987654321',
    role: 'Primary Contact', status: 'Active', initials: 'EO', color: '#7c3aed',
    company: 'EOTC', companyDesc: 'Ethiopian Orthodox Tewahedo Church',
    tier: 'Standard', tickets: 2, activeTickets: 1,
    companyPhone: '+251 11 555 0006', companyWebsite: 'https://eotc.example.com',
  },
  {
    name: 'ERA/MOTL Client', email: 'eramotl@gmail.com', phone: '0987654321',
    role: 'Primary Contact', status: 'Active', initials: 'ER', color: '#059669',
    company: 'ERA/MOTL', companyDesc: 'Government agency focused on infrastructure',
    tier: 'Enterprise', tickets: 16, activeTickets: 9,
    companyPhone: '+251 11 555 0007', companyWebsite: 'https://era.example.com',
  },
  {
    name: 'MinT Client', email: 'mint@gmail.com', phone: '0987654321',
    role: 'Technical Contact', status: 'Inactive', initials: 'MI', color: '#6b7280',
    company: 'MinT', companyDesc: 'Ministry of Innovation and Technology',
    tier: 'Enterprise', tickets: 17, activeTickets: 11,
    companyPhone: '+251 11 555 0008', companyWebsite: 'https://mint.example.com',
  },
  {
    name: 'MoTI Client', email: 'moti@gmail.com', phone: '0987654321',
    role: 'Primary Contact', status: 'Active', initials: 'MO', color: '#6366f1',
    company: 'MoTI', companyDesc: 'Ministry of Trade and Industry',
    tier: 'Premium', tickets: 10, activeTickets: 7,
    companyPhone: '+251 11 555 0009', companyWebsite: 'https://moti.example.com',
  },
  {
    name: 'CSA Client', email: 'csa@gmail.com', phone: '0987654321',
    role: 'Technical Contact', status: 'Active', initials: 'CS', color: '#0891b2',
    company: 'CSA', companyDesc: 'Central Statistics Agency',
    tier: 'Enterprise', tickets: 6, activeTickets: 2,
    companyPhone: '+251 11 555 0003', companyWebsite: 'https://csa.example.com',
  },
  {
    name: 'Abay Bank Client', email: 'abaybank@gmail.com', phone: '0987654321',
    role: 'Primary Contact', status: 'Active', initials: 'AB', color: '#dc2626',
    company: 'Abay Bank', companyDesc: 'Private commercial bank',
    tier: 'Premium', tickets: 9, activeTickets: 4,
    companyPhone: '+251 11 555 0004', companyWebsite: 'https://abay.example.com',
  },
  {
    name: 'MoWS Client', email: 'mows@gmail.com', phone: '0987654321',
    role: 'Technical Contact', status: 'Active', initials: 'MW', color: '#d97706',
    company: 'MoWS', companyDesc: 'Ministry of Water and Sanitation',
    tier: 'Standard', tickets: 13, activeTickets: 8,
    companyPhone: '+251 11 555 0010', companyWebsite: 'https://mows.example.com',
  },
];

const tierConfig: Record<string, { badgeClass: string }> = {
  Enterprise: { badgeClass: 'bg-violet-50 text-violet-700 border-violet-200' },
  Premium:    { badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  Standard:   { badgeClass: 'bg-slate-50 text-slate-600 border-slate-200' },
};

const sampleTickets = [
  { id: '#00135', subject: 'VPN access intermittent', status: 'Open', priority: 'High', age: '3d' },
  { id: '#00118', subject: 'Billing report mismatch', status: 'In Progress', priority: 'Medium', age: '8d' },
  { id: '#00102', subject: 'Endpoint onboarding request', status: 'Open', priority: null, age: '12d' },
];

const statusConfig: Record<string, { dot: string; badgeClass: string }> = {
  Open:          { dot: 'bg-blue-500',        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  'In Progress': { dot: 'bg-violet-500',      badgeClass: 'bg-violet-50 text-violet-700 border-violet-200' },
  Escalated:     { dot: 'bg-red-500',         badgeClass: 'bg-red-50 text-red-700 border-red-200' },
  Resolved:      { dot: 'bg-emerald-500',     badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Closed:        { dot: 'bg-muted-foreground',badgeClass: 'bg-muted text-muted-foreground border-border' },
};

export function ContactDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const contact = useMemo(
    () => contactsData.find((c) => c.email === decodeURIComponent(id ?? '')) ?? contactsData[0],
    [id],
  );

  const tc = tierConfig[contact.tier];

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" className="gap-1.5 text-[13px] text-muted-foreground" onClick={() => navigate('/contacts')}>
            <ArrowLeft className="w-3.5 h-3.5" />
            Contacts
          </Button>
        </div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex size-12 items-center justify-center rounded-xl text-[14px] font-bold text-white flex-shrink-0"
              style={{ backgroundColor: contact.color }}
            >
              {contact.initials}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[20px] font-semibold tracking-tight">{contact.name}</h1>
                <Badge
                  variant="outline"
                  className={`text-[11px] ${contact.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-muted text-muted-foreground border-border'}`}
                >
                  <span className={`mr-1 size-1.5 rounded-full inline-block ${contact.status === 'Active' ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                  {contact.status}
                </Badge>
              </div>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {contact.role} · <span className="font-medium text-foreground">{contact.company}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-[13px]">
              <Mail className="w-3.5 h-3.5" />
              Send Email
            </Button>
            <Button size="sm" className="gap-1.5 text-[13px]" onClick={() => navigate('/tickets/new')}>
              <Plus className="w-3.5 h-3.5" />
              New Ticket
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-5">

          {/* Contact + Company info row */}
          <div className="grid grid-cols-2 gap-5">

            {/* Contact Details — FIRST */}
            <Card className="gap-0 p-0">
              <CardHeader className="border-b px-5 py-4">
                <CardTitle className="flex items-center gap-2 text-[14px]">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 py-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <div className="text-[11px] text-muted-foreground">Email</div>
                    <div className="text-[13px]">{contact.email}</div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <div className="text-[11px] text-muted-foreground">Phone</div>
                    <div className="text-[13px]">{contact.phone}</div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <div className="text-[11px] text-muted-foreground">Role</div>
                    <div className="text-[13px]">{contact.role}</div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <div className="text-[11px] text-muted-foreground">Organization</div>
                    <div className="text-[13px] font-medium">{contact.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Details — SECOND */}
            <Card className="gap-0 p-0">
              <CardHeader className="border-b px-5 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-[14px]">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    Company Details
                  </CardTitle>
                  <Badge variant="outline" className={`text-[11px] ${tc.badgeClass}`}>{contact.tier}</Badge>
                </div>
              </CardHeader>
              <CardContent className="px-5 py-4 space-y-3">
                <div>
                  <div className="text-[11px] text-muted-foreground">Name</div>
                  <div className="text-[13px] font-semibold">{contact.company}</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">{contact.companyDesc}</div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[11px] text-muted-foreground">Total Tickets</div>
                    <div className="text-[20px] font-semibold">{contact.tickets}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground">Open Tickets</div>
                    <div className="text-[20px] font-semibold text-blue-600">{contact.activeTickets}</div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <div className="text-[11px] text-muted-foreground">Phone</div>
                    <div className="text-[13px]">{contact.companyPhone}</div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <div className="text-[11px] text-muted-foreground">Website</div>
                    <a href={contact.companyWebsite} target="_blank" rel="noreferrer" className="text-[13px] text-primary flex items-center gap-1 hover:underline" onClick={(e) => e.stopPropagation()}>
                      {contact.companyWebsite.replace('https://', '')}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Open Tickets */}
          <Card className="gap-0 p-0">
            <CardHeader className="border-b px-5 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[14px]">
                  <Ticket className="w-4 h-4 text-muted-foreground" />
                  Open Tickets
                </CardTitle>
                <Button variant="outline" size="sm" className="gap-1.5 text-[12px] h-7 px-2.5" onClick={() => navigate('/tickets')}>
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y">
              {sampleTickets.map((ticket) => {
                const sc = statusConfig[ticket.status];
                return (
                  <div
                    key={ticket.id}
                    className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] text-muted-foreground font-mono">{ticket.id}</span>
                        {ticket.priority && <span className="text-[11px] text-muted-foreground">· {ticket.priority}</span>}
                      </div>
                      <div className="text-[13px] font-medium truncate">{ticket.subject}</div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[11px] text-muted-foreground">{ticket.age}</span>
                      <Badge variant="outline" className={`gap-1 text-[11px] ${sc.badgeClass}`}>
                        <span className={`size-1.5 rounded-full ${sc.dot}`} />
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {sampleTickets.length === 0 && (
                <div className="py-10 text-center">
                  <CheckCircle2 className="mx-auto mb-2 w-8 h-8 text-emerald-500" />
                  <div className="text-[13px] font-medium">No open tickets</div>
                  <div className="mt-0.5 text-[12px] text-muted-foreground">All issues are resolved</div>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
