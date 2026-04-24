import React, { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import {
  AlertTriangle,
  Bell,
  Camera,
  CheckCircle2,
  Database,
  Download,
  Eye,
  EyeOff,
  Key,
  Mail,
  Monitor,
  Moon,
  Palette,
  Phone,
  Save,
  Shield,
  Sun,
  Trash2,
  User,
  Webhook,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Switch } from "../components/ui/switch";
import { useServiceDesk } from "../store/serviceDeskStore";

type Section =
  | "profile"
  | "notifications"
  | "security"
  | "appearance"
  | "integrations"
  | "data";

type NotifType = "email" | "push";

const navItems = [
  { key: "profile" as const, icon: User, label: "Profile", description: "Personal information" },
  { key: "notifications" as const, icon: Bell, label: "Notifications", description: "Email and alert preferences" },
  { key: "security" as const, icon: Shield, label: "Security", description: "Password and 2FA" },
  { key: "appearance" as const, icon: Palette, label: "Appearance", description: "Theme and display" },
  { key: "integrations" as const, icon: Webhook, label: "Integrations", description: "Third-party connections" },
  { key: "data" as const, icon: Database, label: "Data & Privacy", description: "Export and deletion" },
];

const notifItems = [
  { key: "new_ticket", label: "New Ticket Created", description: "When a new ticket is submitted", email: true, push: true },
  { key: "ticket_assigned", label: "Ticket Assigned to Me", description: "When a ticket is assigned to your account", email: true, push: true },
  { key: "ticket_resolved", label: "Ticket Resolved", description: "When a ticket you created is resolved", email: true, push: false },
  { key: "team_updates", label: "Team Updates", description: "Changes within your assigned teams", email: false, push: false },
  { key: "weekly_report", label: "Weekly Performance Report", description: "Summary delivered every Monday", email: true, push: false },
  { key: "sla_breach", label: "SLA Breach Alert", description: "When a ticket violates SLA thresholds", email: true, push: true },
];

export function Settings() {
  const { theme, setTheme } = useTheme();
  const { resetToSeed } = useServiceDesk();
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notifState, setNotifState] = useState<Record<string, { email: boolean; push: boolean }>>(
    Object.fromEntries(notifItems.map((item) => [item.key, { email: item.email, push: item.push }]))
  );

  const activeNav = useMemo(() => navItems.find((n) => n.key === activeSection)!, [activeSection]);

  const toggleNotif = (key: string, type: NotifType) => {
    setNotifState((prev) => ({ ...prev, [key]: { ...prev[key], [type]: !prev[key][type] } }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-full bg-muted/30 p-6">
      <div className="mx-auto flex max-w-6xl gap-6">
        <Card className="h-fit w-72 shrink-0">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Workspace and account configuration</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Button
                key={item.key}
                variant={activeSection === item.key ? "secondary" : "ghost"}
                className="h-auto justify-start py-3"
                onClick={() => setActiveSection(item.key)}
              >
                <item.icon data-icon="inline-start" />
                <span className="flex flex-col items-start">
                  <span>{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </span>
              </Button>
            ))}
          </CardContent>
        </Card>

        <div className="flex-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-[14px]">Demo Data</CardTitle>
              <CardDescription>Reload seeded projects/tickets/articles (clears saved local data).</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  resetToSeed();
                  window.location.reload();
                }}
              >
                Reset demo data
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <activeNav.icon className="size-4" />
                  {activeNav.label}
                </CardTitle>
                <CardDescription>{activeNav.description}</CardDescription>
              </div>
              {saved ? (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="size-3.5" />
                  Changes saved
                </Badge>
              ) : null}
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {activeSection === "profile" && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Profile Photo</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                      <div className="relative flex size-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
                        AT
                        <Button size="icon" variant="secondary" className="absolute -bottom-1 -right-1 size-6">
                          <Camera />
                        </Button>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div>
                          <p className="font-medium">Abraham Tayu</p>
                          <p className="text-sm text-muted-foreground">Admin · abreham.t@ienetworks.co</p>
                        </div>
                        <Button variant="outline" size="sm" className="w-fit">
                          Change photo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-1.5">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input id="firstName" defaultValue="Abraham" />
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input id="lastName" defaultValue="Tayu" />
                        </div>
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                          <Input id="email" defaultValue="abreham.t@ienetworks.co" className="pl-9" />
                        </div>
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="phone">Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                          <Input id="phone" defaultValue="+251987654321" className="pl-9" />
                        </div>
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="role">Role</Label>
                        <Input id="role" defaultValue="Admin" disabled />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">System Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                      {[
                        { label: "Version", value: "1.4.2" },
                        { label: "Last Updated", value: "March 19, 2026" },
                        { label: "License", value: "Enterprise" },
                        { label: "Plan", value: "Annual · Renews 2027-01-01" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between rounded-md border p-3 text-sm">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Button onClick={handleSave}>
                    <Save data-icon="inline-start" />
                    Save Changes
                  </Button>
                </>
              )}

              {activeSection === "notifications" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Notification Preferences</CardTitle>
                    <CardDescription>Control which events send email or push notifications.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    {notifItems.map((item) => (
                      <div key={item.key} className="grid grid-cols-3 items-center gap-4 rounded-md border p-3">
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="mx-auto flex items-center gap-2">
                          <Label htmlFor={`${item.key}-email`} className="text-xs text-muted-foreground">
                            Email
                          </Label>
                          <Switch
                            id={`${item.key}-email`}
                            checked={notifState[item.key].email}
                            onCheckedChange={() => toggleNotif(item.key, "email")}
                          />
                        </div>
                        <div className="mx-auto flex items-center gap-2">
                          <Label htmlFor={`${item.key}-push`} className="text-xs text-muted-foreground">
                            Push
                          </Label>
                          <Switch
                            id={`${item.key}-push`}
                            checked={notifState[item.key].push}
                            onCheckedChange={() => toggleNotif(item.key, "push")}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {activeSection === "security" && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Change Password</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                      {["Current Password", "New Password", "Confirm New Password"].map((label) => (
                        <div key={label} className="grid gap-1.5">
                          <Label>{label}</Label>
                          <div className="relative">
                            <Key className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="********"
                              className="pl-9 pr-10"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
                              onClick={() => setShowPassword((prev) => !prev)}
                            >
                              {showPassword ? <EyeOff /> : <Eye />}
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button>Update Password</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
                        <CardDescription>Add an extra layer of security to your account.</CardDescription>
                      </div>
                      <Button variant="secondary">Enable 2FA</Button>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Active Sessions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                      {[
                        { device: "Chrome on MacOS", location: "Addis Ababa, ET", current: true, time: "Active now" },
                        { device: "Firefox on Windows", location: "Addis Ababa, ET", current: false, time: "2 days ago" },
                      ].map((session) => (
                        <div key={session.device} className="flex items-center justify-between rounded-md border p-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{session.device}</p>
                              {session.current ? <Badge variant="secondary">Current</Badge> : null}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {session.location} · {session.time}
                            </p>
                          </div>
                          {!session.current ? (
                            <Button variant="destructive" size="sm">
                              Revoke
                            </Button>
                          ) : null}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </>
              )}

              {activeSection === "appearance" && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Theme</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-3">
                      {[
                        { key: "light", icon: Sun, label: "Light" },
                        { key: "dark", icon: Moon, label: "Dark" },
                        { key: "system", icon: Monitor, label: "System" },
                      ].map(({ key, icon: Icon, label }) => (
                        <Button
                          key={key}
                          variant={theme === key ? "secondary" : "outline"}
                          className="h-auto flex-col gap-2 py-4"
                          onClick={() => setTheme(key)}
                        >
                          <Icon />
                          {label}
                        </Button>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Display</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                      {[
                        { label: "Compact Mode", description: "Reduce spacing throughout the interface" },
                        { label: "Show Ticket IDs", description: "Display ticket IDs in all views" },
                        { label: "Auto-refresh Dashboard", description: "Refresh dashboard metrics every 5 minutes" },
                      ].map(({ label, description }) => (
                        <div key={label} className="flex items-center justify-between rounded-md border p-3">
                          <div>
                            <p className="font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground">{description}</p>
                          </div>
                          <Switch />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </>
              )}

              {activeSection === "integrations" && (
                <div className="grid gap-3">
                  {[
                    { name: "Slack", description: "Get ticket notifications in Slack channels", icon: "💬", connected: false },
                    { name: "Email (SMTP)", description: "Configure outgoing email delivery", icon: "📧", connected: true },
                    { name: "Webhook", description: "Send events to external endpoints", icon: "🔗", connected: false },
                    { name: "SSO / SAML", description: "Single sign-on authentication", icon: "🔐", connected: false },
                  ].map(({ name, description, icon, connected }) => (
                    <Card key={name}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-md bg-muted text-lg">{icon}</div>
                          <div>
                            <p className="font-semibold">{name}</p>
                            <p className="text-sm text-muted-foreground">{description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {connected ? <Badge variant="secondary">Connected</Badge> : null}
                          <Button variant={connected ? "destructive" : "outline"}>
                            {connected ? "Disconnect" : "Connect"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {activeSection === "data" && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Export Data</CardTitle>
                      <CardDescription>Download your data in standard formats.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                      {["Tickets (CSV)", "Contacts (CSV)", "Companies (CSV)", "Full Backup (JSON)"].map((item) => (
                        <div key={item} className="flex items-center justify-between rounded-md border p-3">
                          <span>{item}</span>
                          <Button variant="outline" size="sm">
                            <Download data-icon="inline-start" />
                            Export
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Alert variant="destructive">
                    <AlertTriangle className="size-4" />
                    <AlertTitle>Danger Zone</AlertTitle>
                    <AlertDescription>
                      These actions are permanent and cannot be undone.
                    </AlertDescription>
                    <Separator className="my-3 bg-destructive/20" />
                    <div className="grid gap-2">
                      {[
                        { label: "Delete all tickets", desc: "Permanently remove all ticket records" },
                        { label: "Reset workspace", desc: "Clear all data and start fresh" },
                      ].map(({ label, desc }) => (
                        <div key={label} className="flex items-center justify-between rounded-md border border-destructive/30 bg-background/50 p-3">
                          <div>
                            <p className="font-medium">{label}</p>
                            <p className="text-xs">{desc}</p>
                          </div>
                          <Button variant="destructive" size="sm">
                            <Trash2 data-icon="inline-start" />
                            Delete
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Alert>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
