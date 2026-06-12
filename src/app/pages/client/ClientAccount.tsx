import { useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Save,
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
import { Separator } from "../../components/ui/separator";
import { useAuth } from "../../store/authStore";

export function ClientAccount() {
  const { user, updateProfile } = useAuth();
  const [saved, setSaved] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    jobTitle: user?.jobTitle ?? "",
  });
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const handleSave = () => {
    updateProfile(form);
    setPasswords({ current: "", next: "", confirm: "" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!user) return null;

  return (
    <div className="min-h-full bg-muted/30 p-6">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <User className="size-4" />
                Profile
              </CardTitle>
              <CardDescription>Manage your personal information and password</CardDescription>
            </div>
            {saved && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="size-3.5" />
                Saved
              </Badge>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-violet-600 text-xl font-semibold text-white">
                {user.initials}
              </div>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.jobTitle} · {user.company}</p>
              </div>
            </div>

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

            <Separator />

            <div className="space-y-4">
              <div>
                <h3 className="text-[14px] font-semibold">Change Password</h3>
                <p className="mt-0.5 text-[12px] text-muted-foreground">Update your portal sign-in password</p>
              </div>
              <div>
                <Label className="mb-1.5 block text-[12px]">Current Password</Label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwords.current}
                    onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                    placeholder="••••••••"
                    className="h-9 pr-10 text-[13px]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 size-8 -translate-y-1/2"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block text-[12px]">New Password</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={passwords.next}
                      onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
                      placeholder="••••••••"
                      className="h-9 pr-10 text-[13px]"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 size-8 -translate-y-1/2"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="mb-1.5 block text-[12px]">Confirm New Password</Label>
                  <Input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                    placeholder="••••••••"
                    className="h-9 text-[13px]"
                  />
                </div>
              </div>
            </div>

            <Button className="w-fit gap-1.5 bg-violet-600 hover:bg-violet-700" onClick={handleSave}>
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
