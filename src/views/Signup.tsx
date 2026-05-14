import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import BotLogo from "@/components/BotLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { login, register } from "@/lib/api";
import { setAccessToken } from "@/lib/auth-token";

const Signup = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left - Dark panel */}
      <div
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden lg:flex"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, hsl(230 50% 18%) 0%, hsl(230 40% 12%) 40%, hsl(230 45% 8%) 100%)",
        }}
      >
        {/* Vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)",
          }}
        />

        {/* Floating particles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[20%] top-[15%] h-1.5 w-1.5 rounded-full bg-info/30 animate-float" />
          <div className="absolute right-[25%] top-[35%] h-1 w-1 rounded-full bg-primary/25 animate-float-card-2" />
          <div className="absolute bottom-[30%] left-[15%] h-1 w-1 rounded-full bg-accent/20 animate-float-card-3" />
          <div className="absolute right-[15%] top-[60%] h-1.5 w-1.5 rounded-full bg-info/20 animate-float-card-1" />
          <div className="absolute left-[40%] top-[80%] h-1 w-1 rounded-full bg-primary/15 animate-float-card-4" />
          <div className="absolute right-[40%] top-[10%] h-1 w-1 rounded-full bg-info/20 animate-float" />
        </div>

        {/* Header */}
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <BotLogo size={36} />
              <span className="text-lg font-bold text-primary-foreground">PresentIQ</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-primary-foreground/40 transition-colors duration-200 hover:text-primary-foreground/70"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to home
            </Link>
          </div>
        </div>

        {/* Center - Bot + Speech bubble */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5">
          {/* Speech bubble */}
          <div className="animate-fade-in">
            <div
              className="relative rounded-2xl px-6 py-3.5 text-sm text-primary-foreground/90"
              style={{
                background: "rgba(255,255,255,0.07)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              }}
            >
              Let's get you started! 🎤
              <div
                className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  borderRight: "1px solid rgba(255,255,255,0.1)",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              />
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

        {/* Footer */}
        <div className="relative z-10 p-8 text-xs text-primary-foreground/30">
          © {new Date().getFullYear()} PresentIQ. All rights reserved.
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex w-full flex-col overflow-y-auto lg:w-1/2" style={{ background: "hsl(var(--background))" }}>
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center px-8 py-10">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <BotLogo size={36} />
            <span className="text-lg font-bold text-foreground">PresentIQ</span>
          </div>

          <h1 className="mb-1.5 text-2xl font-bold tracking-tight text-foreground">Create Your Account</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Start improving your presentations today — completely free.
          </p>

          <form
            className="space-y-3.5"
            onSubmit={async (e) => {
              e.preventDefault();
              if (password !== confirm) {
                toast.error("Passwords do not match");
                return;
              }
              if (password.length < 8) {
                toast.error("Password must be at least 8 characters");
                return;
              }
              setLoading(true);
              try {
                await register(email.trim(), password);
                const tok = await login(email.trim(), password);
                setAccessToken(tok.access_token);
                if (name.trim()) {
                  localStorage.setItem("presentiq_display_name", name.trim());
                }
                await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
                toast.success("Account created — you're signed in");
                router.replace("/dashboard");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not create account");
              } finally {
                setLoading(false);
              }
            }}
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="John Doe"
                className="h-11 transition-shadow duration-200 focus:shadow-[0_0_0_3px_hsl(var(--ring)/0.12)]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@company.com"
                className="h-11 transition-shadow duration-200 focus:shadow-[0_0_0_3px_hsl(var(--ring)/0.12)]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="h-11 pr-11 transition-shadow duration-200 focus:shadow-[0_0_0_3px_hsl(var(--ring)/0.12)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-r-md text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
                  <p className="mt-1.5 text-xs text-muted-foreground/60">Must be at least 8 characters.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Confirm Password</label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="h-11 pr-11 transition-shadow duration-200 focus:shadow-[0_0_0_3px_hsl(var(--ring)/0.12)]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-r-md text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Checkbox id="terms" className="mt-1" />
              <label htmlFor="terms" className="cursor-pointer text-sm leading-5 text-muted-foreground">
                I agree to the{" "}
                <a href="#" className="font-medium text-primary transition-colors duration-200 hover:text-primary/80 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="font-medium text-primary transition-colors duration-200 hover:text-primary/80 hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-1 w-full gradient-primary text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25 active:translate-y-0 active:shadow-sm"
              size="lg"
            >
              {loading ? "Creating account…" : "Create Account"}
            </Button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-xs font-medium text-muted-foreground/60">or continue with</span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-11 gap-2.5 border-border/60 bg-background transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </Button>
            <Button
              variant="outline"
              className="h-11 gap-2.5 border-border/60 bg-background transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#00A4EF" d="M11 11H1V1h10z" />
                <path fill="#7FBA00" d="M23 11H13V1h10z" />
                <path fill="#FFB900" d="M11 23H1V13h10z" />
                <path fill="#F25022" d="M23 23H13V13h10z" />
              </svg>
              Microsoft
            </Button>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary transition-colors duration-200 hover:text-primary/80 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
