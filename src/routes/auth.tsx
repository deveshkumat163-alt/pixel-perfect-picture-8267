import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import "@lovable.dev/cloud-auth-js/styles.css";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/logo";
import { safeRedirect } from "@/lib/safe-redirect";

type AuthSearch = { redirect?: string | undefined };
type Mode = "signin" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): AuthSearch => ({
    redirect: typeof s["redirect"] === "string" ? s["redirect"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Dev Creative Works Admin" },
      { name: "description", content: "Secure sign-in for the Dev Creative Works team." },
      { property: "og:title", content: "Sign in | Dev Creative Works" },
      { property: "og:description", content: "Team sign-in for the Dev Creative Works platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
  );
}

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const dest = safeRedirect(search.redirect);
  const [mode, setMode] = useState<Mode>("signin");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) navigate({ to: dest, replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: dest, replace: true });
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [dest, navigate]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const fullName = String(fd.get("full_name") ?? "").trim();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth`, data: { full_name: fullName } },
        });
        if (error) throw error;
        setSent(`We sent a confirmation link to ${email}. Open it to activate your account.`);
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSent(`If an account exists for ${email}, a reset link is on its way.`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function oauth(provider: "google" | "lovable") {
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin + "/auth" });
    if (result.error) toast.error(result.error.message ?? "Sign-in failed");
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-16">
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="animate-aurora pointer-events-none absolute -top-40 left-1/2 h-[30rem] w-[40rem] -translate-x-1/2 rounded-full bg-gradient-brand opacity-25 blur-[120px]" aria-hidden />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="gradient-border rounded-[2rem] bg-card p-7 shadow-card md:p-9">
          <h1 className="text-2xl font-semibold">
            {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your team account" : "Reset your password"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {mode === "forgot" ? "We'll email you a secure link." : "Access the Dev Creative Works admin."}
          </p>

          {sent ? (
            <div className="mt-6 rounded-2xl bg-gradient-brand-soft p-5 text-sm">
              {sent}
              <Button variant="link" className="mt-2 h-auto px-0" onClick={() => { setSent(null); setMode("signin"); }}>
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
              {mode !== "forgot" && (
                <div className="mt-6 grid gap-2.5">
                  <button
                    type="button"
                    onClick={() => oauth("google")}
                    className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-[#8E918F] bg-[#131314] px-3 text-sm font-medium text-[#E3E3E3]"
                  >
                    <GoogleIcon /> Continue with Google
                  </button>
                  <button type="button" className="lovable-auth-button w-full" onClick={() => oauth("lovable")}>
                    Continue with Lovable
                  </button>
                  <div className="my-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="h-px flex-1 bg-border" /> or with email <span className="h-px flex-1 bg-border" />
                  </div>
                </div>
              )}
              <form onSubmit={onSubmit} className="mt-4 space-y-4">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full name</Label>
                    <Input id="full_name" name="full_name" required autoComplete="name" className="h-11 rounded-xl" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required autoComplete="email" className="h-11 rounded-xl" />
                </div>
                {mode !== "forgot" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {mode === "signin" && (
                        <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary-glow hover:underline">
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      className="h-11 rounded-xl"
                    />
                  </div>
                )}
                <Button type="submit" variant="hero" size="lg" className="h-11 w-full" disabled={busy}>
                  {busy && <Loader2 className="animate-spin" />}
                  {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                {mode === "signin" ? (
                  <>New team member? <button className="text-primary-glow hover:underline" onClick={() => setMode("signup")}>Create an account</button></>
                ) : (
                  <>Already have an account? <button className="text-primary-glow hover:underline" onClick={() => setMode("signin")}>Sign in</button></>
                )}
              </p>
            </>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          New accounts need a role from a Super Admin before they can open the dashboard.
        </p>
      </div>
    </div>
  );
}
