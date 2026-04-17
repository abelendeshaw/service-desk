import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Building2, Mail, Phone, Ticket, User } from 'lucide-react';

import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';

const contacts = [
  { name: 'EPSS Client', email: 'epss@gmail.com', company: 'EPSS', phone: '0987654321', role: 'Primary Contact', status: 'Active' },
  { name: 'IE Client', email: 'ie@gmail.com', company: 'IE', phone: '0987654321', role: 'Technical Contact', status: 'Active' },
  { name: 'MinT Client', email: 'mint@gmail.com', company: 'MinT', phone: '0987654321', role: 'Technical Contact', status: 'Inactive' },
  { name: 'CSA Client', email: 'csa@gmail.com', company: 'CSA', phone: '0987654321', role: 'Technical Contact', status: 'Active' },
  { name: 'Abay Bank Client', email: 'abaybank@gmail.com', company: 'Abay Bank', phone: '0987654321', role: 'Primary Contact', status: 'Active' },
];

export function ContactDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const contact = useMemo(
    () => contacts.find((item) => item.email === decodeURIComponent(id ?? '')) ?? contacts[0],
    [id],
  );

  return (
    <div className="min-h-full bg-muted/30 p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <Button variant="ghost" className="w-fit gap-1" onClick={() => navigate('/contacts')}>
          <ArrowLeft className="size-4" />
          Back to contacts
        </Button>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{contact.name}</span>
                <Badge variant={contact.status === 'Active' ? 'secondary' : 'outline'}>{contact.status}</Badge>
              </CardTitle>
              <CardDescription>Primary profile and communication information.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <span>{contact.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-muted-foreground" />
                <span>{contact.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-muted-foreground" />
                <span>{contact.company}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                <span>{contact.role}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest interactions with support.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-md border p-3">
                <p className="font-medium">Follow-up on outage</p>
                <p className="text-muted-foreground">Ticket #SUP-204 · 2 hours ago</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="font-medium">Escalation approved</p>
                <p className="text-muted-foreground">Email · Yesterday</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Open Tickets</CardTitle>
            <CardDescription>Issues currently owned by this contact.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {['VPN access intermittent', 'Billing report mismatch', 'Endpoint onboarding request'].map((subject) => (
              <div key={subject} className="flex items-center justify-between rounded-md border p-3 text-sm">
                <span className="flex items-center gap-2">
                  <Ticket className="size-4 text-muted-foreground" />
                  {subject}
                </span>
                <Badge variant="outline">Open</Badge>
              </div>
            ))}
            <Separator />
            <div className="flex justify-end gap-2">
              <Button variant="outline">Send Email</Button>
              <Button>Create Ticket</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
