import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Ticket,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';

const features = [
  {
    icon: Ticket,
    title: 'Unified Ticket Management',
    desc: 'Centralize all client requests and incidents in one intelligent workspace.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time CSAT Analytics',
    desc: 'Track satisfaction scores and resolution rates across all engagements.',
  },
  {
    icon: Zap,
    title: 'Multi-Channel Support',
    desc: 'Handle tickets, emails, and support engagements from a single platform.',
  },
  {
    icon: Shield,
    title: 'Enterprise-Grade Security',
    desc: 'Role-based access control with full audit trails and compliance tools.',
  },
];

const stats = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '4.2min', label: 'Avg. Response' },
  { value: '94%', label: 'CSAT Score' },
];

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 800);
  };

  return (
    <div
      className="min-h-screen flex bg-white"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[52%] bg-[#0b2235] flex-col relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500/5 border border-blue-400/10" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-blue-500/5 border border-blue-400/10" />
        <div className="absolute top-1/2 -right-8 w-48 h-48 rounded-full bg-blue-400/5 border border-blue-400/8" />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-lg">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white text-[15px] font-semibold leading-tight">Service Desk</div>
              <div className="text-white/40 text-[11px]">Enterprise Platform</div>
            </div>
          </div>

          {/* Headline */}
          <div className="mb-12">
            <h1 className="text-[36px] font-semibold text-white leading-[1.15] tracking-tight mb-4">
              Support operations,<br />
              <span className="text-primary">built for scale.</span>
            </h1>
            <p className="text-white/50 text-[15px] leading-relaxed max-w-sm">
              The enterprise service desk platform that unifies tickets, client
              engagements, and knowledge management in one workspace.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-5 mb-auto">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-md bg-white/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <f.icon className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-white text-[13px] font-medium leading-snug">{f.title}</div>
                  <div className="text-white/40 text-[12px] leading-relaxed mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="border-t border-white/8 pt-8 mt-8">
            <div className="">
             <p className='text-white/40 text-[12px] font-base text-center'>Powered By Selamnew Workspace</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#f8f9fa]">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-[#0b2235] rounded-lg flex items-center justify-center">
              <Ticket className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="text-primary text-[15px] font-semibold">Service Desk</div>
          </div>

          {/* Card */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-8">
            <div className="mb-8">
              <h2 className="text-primary text-[22px] font-semibold tracking-tight">Welcome back</h2>
              <p className="text-muted-foreground mt-1.5 text-[13px]">Sign in to your Service Desk workspace</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <Label htmlFor="email" className="mb-1.5 block text-[12px]">
                  Work Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="h-10 text-[13px]"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="password" className="text-[12px]">Password</Label>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-[12px]"
                  >
                    Forgot password?
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    required
                    className="h-10 pr-10 text-[13px]"
                  />
                  <Button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 size-8 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2.5">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(checked) => setRemember(Boolean(checked))}
                />
                <Label htmlFor="remember" className="cursor-pointer text-[13px] text-muted-foreground">
                  Keep me signed in
                </Label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="mt-2 h-10 w-full text-[13px]"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <Separator className="flex-1" />
              <span className="text-[11px] text-[#9ca3af]">or continue with SSO</span>
              <Separator className="flex-1" />
            </div>

            {/* SSO Button */}
            <Button variant="outline" className="h-10 w-full gap-2 text-[13px]">
              <Shield className="text-muted-foreground w-4 h-4" />
              Single Sign-On (SSO)
            </Button>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-[12px] text-[#9ca3af]">
              Don't have an account?{' '}
              <Button variant="link" className="h-auto p-0 font-medium">
                Contact your administrator
              </Button>
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <span className="text-primary/70 text-[11px]">© 2026 Service Desk</span>
            <span className="w-1 h-1 rounded-full bg-[#d1d5db]" />
            <Button variant="link" className="h-auto p-0 text-[11px] text-[#c4c9d0] hover:text-[#9ca3af]">Privacy</Button>
            <span className="w-1 h-1 rounded-full bg-[#d1d5db]" />
            <Button variant="link" className="h-auto p-0 text-[11px] text-[#c4c9d0] hover:text-[#9ca3af]">Terms</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
