import { useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Save,
  Shield,
  User,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { useAuth } from "../../store/authStore";

type Section = "profile" | "security" | "notifications";

const navItems = [
  { key: "profile" as const, icon: User, label: "Profile", description: "Personal information" },
  { key: "security" as const, icon: Shield, label: "Security", description: "Password & access" },
  { key: "notifications" as const, icon: Bell, label: "Notifications", description: "Alert preferences" },
];

export function ClientAccount() {
  const { user, updateProfile } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    jobTitle: user?.jobTitle ?? "",
  });
  const [notifications, setNotifications] = useState({
    ticketUpdates: true,
    statusChanges: true,
    slaReminders: true,
    weeklyDigest: false,
  });

  const activeNav = useMemo(() => navItems.find((n) => n.key === activeSection)!, [activeSection]);

  const handleSave = () => {
    updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!user) return null;

  return (
    <div className="min-h-full bg-muted/30 p-6">
      <div className="mx-auto flex max-w-6xl gap-6">
        <Card className="h-fit w-72 shrink-0">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your client portal profile</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Button
                key={item.key}
                variant={activeSection === item.key ? "secondary" : "ghost"}
                className="h-auto justify-start py-3"
                onClick={() => setActiveSection(item.key)}
              >
                <item.icon className="mr-2 size-4" />
                <span className="flex flex-col items-start">
                  <span>{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </span>
              </Button>
            ))}
          </CardContent>
        </Card>

        <div className="flex-1">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <activeNav.icon className="size-4" />
                  {activeNav.label}
                </CardTitle>
                <CardDescription>{activeNav.description}</CardDescription>
              </div>
              {saved && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="size-3.5" />
                  Saved
                </Badge>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {activeSection === "profile" && (
                <>
                  <Card>
                    <CardContent className="flex items-center gap-4 pt-6">
                      <div className="flex size-16 items-center justify-center rounded-full bg-violet-600 text-xl font-semibold text-white">
                        {user.initials}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.jobTitle} · {user.company}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-1.5 block text-[12px]">Full Name</Label>
                      <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="h-9 text-[13px]" />
                    </div>
                    <div>
                      <Label className="mb-1.5 block text-[12px]">Job Title</Label>
                      <Input value={form.jobTitle} onChange={(e) => setForm((p) => ({ ...p, jobTitle: e.target.value }))} className="h-9 text-[13px]" />
                    </div>
                    <div>
                      <Label className="mb-1.5 block text-[12px]">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="h-9 pl-9 text-[13px]" />
                      </div>
                    </div>
                    <div>
                      <Label className="mb-1.5 block text-[12px]">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="h-9 pl-9 text-[13px]" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-[12px]">Organization</Label>
                    <Input value={user.company} disabled className="h-9 bg-muted text-[13px]" />
                  </div>
                  <Button className="w-fit gap-1.5 bg-violet-600 hover:bg-violet-700" onClick={handleSave}>
                    <Save className="w-3.5 h-3.5" />
                    Save Profile
                  </Button>
                </>
              )}

              {activeSection === "security" && (
                <>
                  <Card className="border-amber-200 bg-amber-50/50">
                    <CardContent className="pt-6 text-[13px] text-amber-900">
                      Password changes are managed by your organization&apos;s IT administrator. Contact them to reset your credentials.
                    </CardContent>
                  </Card>
                  <div>
                    <Label className="mb-1.5 block text-[12px]">Current Password</Label>
                    <div className="relative max-w-md">
                      <Input type={showPassword ? "text" : "password"} placeholder="••••••••" disabled className="h-9 pr-10 text-[13px]" />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 size-8 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {activeSection === "notifications" && (
                <div className="space-y-4">
                  {[
                    { key: "ticketUpdates" as const, label: "Ticket updates", desc: "When a field engineer responds or updates your ticket" },
                    { key: "statusChanges" as const, label: "Status changes", desc: "When ticket status changes (Open, Resolved, etc.)" },
                    { key: "slaReminders" as const, label: "SLA reminders", desc: "Contract expiry and renewal notifications" },
                    { key: "weeklyDigest" as const, label: "Weekly digest", desc: "Summary of open tickets and recent activity" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <div className="text-[13px] font-medium">{label}</div>
                        <div className="text-[12px] text-muted-foreground">{desc}</div>
                      </div>
                      <Switch
                        checked={notifications[key]}
                        onCheckedChange={(checked) => setNotifications((p) => ({ ...p, [key]: checked }))}
                      />
                    </div>
                  ))}
                  <Button className="w-fit gap-1.5 bg-violet-600 hover:bg-violet-700" onClick={handleSave}>
                    <Save className="w-3.5 h-3.5" />
                    Save Preferences
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
