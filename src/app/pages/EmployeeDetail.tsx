import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Mail, Phone, Shield, Users } from 'lucide-react';

import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const employees = [
  { name: 'Abraham Tayu', email: 'abreham.t@ienetworks.co', phone: '0987654321', role: 'Admin', teams: ['CA', 'ITF', 'CSD', 'NOC'], status: 'Active', lastSeen: '2 hours ago' },
  { name: 'Masresha Melese', email: 'masresha.melese@ienetworks.co', phone: '0987654321', role: 'Field Engineer', teams: ['ITF'], status: 'Active', lastSeen: '1 day ago' },
  { name: 'Sisay Shiferaw', email: 'sisay.shiferaw@ienetworks.co', phone: '0987654321', role: 'Support Engineer', teams: ['CSD', 'NOC'], status: 'Active', lastSeen: '30 mins ago' },
  { name: 'Abay Bank Client', email: 'abaybank@gmail.com', phone: '0987654321', role: 'External', teams: [], status: 'Inactive', lastSeen: '15 days ago' },
];

export function EmployeeDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const employee = useMemo(
    () => employees.find((item) => item.email === decodeURIComponent(id ?? '')) ?? employees[0],
    [id],
  );

  return (
    <div className="min-h-full bg-muted/30 p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <Button variant="ghost" className="w-fit gap-1" onClick={() => navigate('/employees')}>
          <ArrowLeft className="size-4" />
          Back to employees
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{employee.name}</span>
              <Badge variant={employee.status === 'Active' ? 'secondary' : 'outline'}>{employee.status}</Badge>
            </CardTitle>
            <CardDescription>Detailed employee profile and assignment view.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-md border p-3 text-sm">
              <p className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" />{employee.email}</p>
            </div>
            <div className="rounded-md border p-3 text-sm">
              <p className="flex items-center gap-2"><Phone className="size-4 text-muted-foreground" />{employee.phone}</p>
            </div>
            <div className="rounded-md border p-3 text-sm">
              <p className="flex items-center gap-2"><Shield className="size-4 text-muted-foreground" />{employee.role}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Assignment</CardTitle>
            <CardDescription>Teams this employee belongs to and current workload.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {employee.teams.length > 0 ? employee.teams.map((team) => (
                <Badge key={team} variant="outline">{team}</Badge>
              )) : <Badge variant="secondary">No team assigned</Badge>}
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="size-4" />
              Last seen: {employee.lastSeen}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => navigate('/employees/teams')}>Manage Teams</Button>
              <Button>Assign Task</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
