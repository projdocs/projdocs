import Link from "next/link";
import { Button } from "@packages/ui/components/button";
import { Badge } from "@packages/ui/components/badge";
import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  FileText,
  Plug,
  Server,
  ShieldCheck,
  Users,
} from "lucide-react";
import Logo from "@packages/ui/branding/logo/logo";

// Brand icon — not available in lucide-react v1+
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

const features = [
  {
    icon: Server,
    title: "Self-host for free",
    description:
      "Run ProjDocs on your own infrastructure at no cost. Full control, no vendor lock-in, forever free.",
  },
  {
    icon: Users,
    title: "Multi-tenant",
    description:
      "Manage multiple organizations from a single instance. Isolate data, roles, and permissions per tenant.",
  },
  {
    icon: ShieldCheck,
    title: "Custom OIDC / OAuth",
    description:
      "Bring your own identity provider. Connect to Okta, Azure AD, Google Workspace, or any OIDC-compliant IdP.",
  },
  {
    icon: Plug,
    title: "In-app connectors",
    description:
      "Edit documents directly inside ProjDocs. Microsoft Word connector available today, with more on the way.",
  },
  {
    icon: FileText,
    title: "Document management",
    description:
      "Organize, version, and search your documents with a clean, intuitive interface built for teams.",
  },
  {
    icon: Cloud,
    title: "Managed hosting",
    description:
      "Let us handle the infrastructure. Get automatic updates, backups, and uptime SLAs without lifting a finger.",
  },
];

const selfHostBenefits = [
  "No licensing fees, ever",
  "Full data ownership",
  "Deploy on-prem or any cloud",
  "Active open-source community",
];

const managedBenefits = [
  "Zero infrastructure overhead",
  "Automatic updates & backups",
  "Priority support",
  "SLA-backed uptime",
];

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Logo className={"mb-10 h-[30px]"} />

            {/*<Favicon width={25} height={25} />*/}
            {/*<span className="text-lg font-semibold tracking-tight">ProjDocs</span>*/}
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <a
              href="#features"
              className="transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#hosting"
              className="transition-colors hover:text-foreground"
            >
              Hosting
            </a>
            <a
              href="https://github.com/projdocs/projdocs/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <GithubIcon className="h-4 w-4" />
              GitHub
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-24 text-center md:py-32">
          <Badge variant="secondary" className="gap-1.5">
            <GithubIcon className="h-3.5 w-3.5" />
            Open source &amp; free to self-host
          </Badge>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            Document management,{" "}
            <span className="text-primary">on your terms</span>
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            ProjDocs is an open-source DMS built for teams that want control.
            Self-host for free or let us manage it — your documents, your rules.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/auth/register">
                Start for free <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a
                href="https://github.com/projdocs/projdocs/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GithubIcon className="mr-1.5 h-4 w-4" />
                View on GitHub
              </a>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Everything your team needs
              </h2>
              <p className="mt-3 text-muted-foreground">
                Built for real-world document workflows, not just file storage.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-xl border bg-background p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-1.5 font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hosting options */}
        <section id="hosting" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Choose how you run it
              </h2>
              <p className="mt-3 text-muted-foreground">
                Self-host with full control or let us handle the ops — both are
                first-class options.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Self-host */}
              <div className="rounded-xl border bg-background p-8 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">Self-hosted</h3>
                </div>
                <p className="mb-1 text-3xl font-bold">
                  Free
                  <span className="ml-1 text-base font-normal text-muted-foreground">
                    forever
                  </span>
                </p>
                <p className="mb-6 text-sm text-muted-foreground">
                  Download, deploy, and run ProjDocs on any infrastructure you
                  own.
                </p>
                <ul className="mb-8 space-y-2.5">
                  {selfHostBenefits.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <a
                    href="https://github.com/projdocs/projdocs/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GithubIcon className="mr-1.5 h-4 w-4" />
                    Get the source
                  </a>
                </Button>
              </div>

              {/* Managed */}
              <div className="rounded-xl border-2 border-primary bg-background p-8 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">Managed</h3>
                </div>
                <p className="mb-1 text-3xl font-bold">
                  Hosted
                  <span className="ml-1 text-base font-normal text-muted-foreground">
                    by us
                  </span>
                </p>
                <p className="mb-6 text-sm text-muted-foreground">
                  We run and maintain your ProjDocs instance so you can focus on
                  your work.
                </p>
                <ul className="mb-8 space-y-2.5">
                  {managedBenefits.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" asChild>
                  <Link href="/auth/register">
                    Get started <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t bg-muted/30 py-20">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to take control of your documents?
            </h2>
            <p className="text-muted-foreground">
              Join teams that trust ProjDocs for secure, flexible document
              management. Free to start, always open source.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/auth/register">
                  Create a free account{" "}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="font-medium text-foreground">ProjDocs</span>
            <span>— open-source document management</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/projdocs/projdocs/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <GithubIcon className="h-4 w-4" />
              GitHub
            </a>
            <Link
              href="/auth/login"
              className="transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
