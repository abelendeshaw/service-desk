import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Users } from 'lucide-react';

import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const teams = [
  { code: 'CA', name: 'Customer Assurance', lead: 'Abraham Tayu', members: 6 },
  { code: 'ITF', name: 'Implementation Task Force', lead: 'Masresha Melese', members: 4 },
  { code: 'CSD', name: 'Customer Support Desk', lead: 'Sisay Shiferaw', members: 7 },
  { code: 'NOC', name: 'Network Operations Center', lead: 'Dawit Bekele', members: 5 },
];

const employees = [
  { name: 'Abraham Tayu', teams: ['CA', 'ITF', 'CSD', 'NOC'] },
  { name: 'Masresha Melese', teams: ['ITF'] },
  { name: 'Sisay Shiferaw', teams: ['CSD', 'NOC'] },
  { name: 'Wongel Wondyifraw', teams: ['CA'] },
];

export function EmployeeTeamManagement() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('CA');

  const filteredEmployees = employees.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-full bg-muted/30 p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <Button variant="ghost" className="w-fit gap-1" onClick={() => navigate('/employees')}>
          <ArrowLeft className="size-4" />
          Back to employees
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4" />
              Team Management
            </CardTitle>
            <CardDescription>Create teams and assign employees to delivery groups.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {teams.map((team) => (
              <button
                key={team.code}
                type="button"
                onClick={() => setSelectedTeam(team.code)}
                className={`rounded-md border p-3 text-left transition-colors ${selectedTeam === team.code ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{team.code}</p>
                  <Badge variant="outline">{team.members}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{team.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">Lead: {team.lead}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assign Employees</CardTitle>
            <CardDescription>Selected team: {selectedTeam}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search employees..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="max-w-sm"
            />
            <div className="grid gap-3 md:grid-cols-2">
              {filteredEmployees.map((employee) => {
                const checked = employee.teams.includes(selectedTeam);
                return (
                  <div key={employee.name} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <Label>{employee.name}</Label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {employee.teams.map((team) => (
                          <Badge key={team} variant="outline">{team}</Badge>
                        ))}
                      </div>
                    </div>
                    <Checkbox checked={checked} />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Save Team Assignments</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
