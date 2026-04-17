import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Building2, Globe, Phone, Users } from 'lucide-react';

import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';

const companies = [
  { name: 'EPSS', description: 'Electric Power Systems Services', tier: 'Enterprise', health: 74, tickets: 18, contacts: 1, phone: '+251 11 555 0001', website: 'https://epss.example.com' },
  { name: 'IE', description: 'Innovation Ethiopia', tier: 'Enterprise', health: 96, tickets: 38, contacts: 1, phone: '+251 11 555 0002', website: 'https://ie.example.com' },
  { name: 'CSA', description: 'Central Statistics Agency', tier: 'Enterprise', health: 93, tickets: 6, contacts: 2, phone: '+251 11 555 0003', website: 'https://csa.example.com' },
  { name: 'Abay Bank', description: 'Private commercial bank', tier: 'Premium', health: 88, tickets: 9, contacts: 1, phone: '+251 11 555 0004', website: 'https://abay.example.com' },
];

export function CompanyDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const company = useMemo(
    () => companies.find((item) => item.name === decodeURIComponent(id ?? '')) ?? companies[0],
    [id],
  );

  return (
    <div className="min-h-full bg-muted/30 p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <Button variant="ghost" className="w-fit gap-1" onClick={() => navigate('/companies')}>
          <ArrowLeft className="size-4" />
          Back to companies
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-4" />
              {company.name}
            </CardTitle>
            <CardDescription>{company.description}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Tier</p>
              <Badge variant="secondary" className="mt-2">{company.tier}</Badge>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Open Tickets</p>
              <p className="mt-2 text-xl font-semibold">{company.tickets}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Contacts</p>
              <p className="mt-2 text-xl font-semibold">{company.contacts}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Health Score</p>
              <p className="mt-2 text-xl font-semibold">{company.health}%</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Service Health</CardTitle>
              <CardDescription>Current customer health index.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={company.health} />
              <p className="text-sm text-muted-foreground">Includes SLA adherence, response time, and CSAT trend.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="flex items-center gap-2">
                <Phone className="size-4 text-muted-foreground" />
                {company.phone}
              </p>
              <p className="flex items-center gap-2">
                <Globe className="size-4 text-muted-foreground" />
                {company.website}
              </p>
              <p className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" />
                {company.contacts} primary contacts
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
