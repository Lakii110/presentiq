"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Shield } from "lucide-react";
import BotLogo from "@/components/BotLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { login } from "@/lib/api";
import { setAccessToken } from "@/lib/auth-token";

const AdminLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      if (!res.is_admin) {
        toast.error("This account does not have admin access.");
        setLoading(false);
        return;
      }
      setAccessToken(res.access_token);
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Welcome back, Admin.");
      router.replace("/admin");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left panel */}
      <div
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden lg:flex"
        style={{ background: "radial-gradient(ellipse at 30% 20%, hsl(230 50% 18%) 0%, hsl(230 40% 12%) 40%, hsl(230 45% 8%) 100%)" }}
      >
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)" }} />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[20%] top-[15%] h-1.5 w-1.5 rounded-full bg-info/30 animate-float" />
          <div className="absolute right-[25%] top-[35%] h-1 w-1 rounded-full bg-primary/25 animate-float-card-2" />
          <div className="absolute bottom-[30%] left-[15%] h-1 w-1 rounded-full bg-accent/20 animate-float-card-3" />
          <div className="absolute right-[15%] top-[60%] h-1.5 w-1.5 rounded-full bg-info/20 animate-float-card-1" />
        </div>

        {/* Header */}
        <div className="relative z-10 p-8">
          <div className="flex items-center gap-2">
            <BotLogo size={36} />
            <span className="text-lg font-bold text-primary-foreground">PresentIQ</span>
          </div>
        </div>

        {/* Center */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5">
          <div className="animate-fade-in">
            <div className="relative rounded-2xl px-6 py-3.5 text-sm text-primary-foreground/90 text-center"
              style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", whiteSpace: "pre-line" }}>
              {"Admin Portal\nManage users, sessions\nand platform settings."}
              <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45"
                style={{ background: "rgba(255,255,255,0.07)", borderRight: "1px solid rgba(255,255,255,0.1)", borderBottom: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
          </div>

          {/* Neumorphic Robot */}
          <div className="relative animate-float" style={{ marginTop: 8 }}>
            <div
              className="absolute inset-0 scale-150 rounded-[32px] blur-3xl"
              style={{ background: "rgba(34,211,238,0.1)" }}
            />
            <div
              className="relative flex h-[160px] w-[160px] items-center justify-center rounded-[30px]"
              style={{
                background: "linear-gradient(145deg, #FFFFFF, #F0F2F5)",
                boxShadow:
                  "12px 12px 28px rgba(0,0,0,0.12), -8px -8px 20px rgba(255,255,255,0.6), inset 1px 1px 3px rgba(255,255,255,0.8)",
              }}
            >
              <div
                className="relative flex h-[110px] w-[110px] items-center justify-center rounded-[22px]"
                style={{
                  background: "linear-gradient(145deg, #1F2A37, #0F172A)",
                  boxShadow:
                    "inset 0 3px 12px rgba(0,0,0,0.5), 0 0 24px rgba(15,23,42,0.3)",
                }}
              >
                <div
                  className="absolute -top-[5px] left-1/2 h-[6px] w-[6px] -translate-x-1/2 rounded-full animate-pulse-glow"
                  style={{
                    background: "#38BDF8",
                    boxShadow: "0 0 6px #38BDF8, 0 0 14px rgba(56,189,248,0.4)",
                  }}
                />
                <div className="flex items-center gap-[16px]">
                  <div
                    className="h-[32px] w-[16px] rounded-full animate-blink"
                    style={{
                      background: "#22D3EE",
                      boxShadow:
                        "0 0 10px #22D3EE, 0 0 20px #67E8F9, 0 0 30px rgba(34,211,238,0.25)",
                    }}
                  />
                  <div
                    className="h-[32px] w-[16px] rounded-full animate-blink"
                    style={{
                      animationDelay: "0.1s",
                      background: "#22D3EE",
                      boxShadow:
                        "0 0 10px #22D3EE, 0 0 20px #67E8F9, 0 0 30px rgba(34,211,238,0.25)",
                    }}
                  />
                </div>
                <div
                  className="absolute bottom-[22px] left-[20px] h-[8px] w-[8px] rounded-full"
                  style={{ background: "#F472B6", opacity: 0.3, filter: "blur(2px)" }}
                />
                <div
                  className="absolute bottom-[22px] right-[20px] h-[8px] w-[8px] rounded-full"
                  style={{ background: "#F472B6", opacity: 0.3, filter: "blur(2px)" }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 p-8 text-xs text-primary-foreground/30">© 2026 PresentIQ. All rights reserved.</div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full flex-col overflow-y-auto lg:w-1/2" style={{ background: "hsl(var(--background))" }}>
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center px-8 py-10">

          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <BotLogo size={36} />
            <span className="text-lg font-bold text-foreground">PresentIQ</span>
          </div>

          {/* Admin badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 w-fit">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">Admin Portal</span>
          </div>

          <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground">Admin Sign In</h1>
          <p className="mb-8 text-sm text-muted-foreground">Access restricted to administrators only.</p>

          <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="admin@company.com"
                className="h-11"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-11 pr-11"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} size="lg"
              className="w-full gradient-primary text-primary-foreground shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg">
              {loading ? "Signing in…" : "Sign In to Admin"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Not an admin?{" "}
            <a href="/login" className="font-semibold text-primary hover:underline">Go to user login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
