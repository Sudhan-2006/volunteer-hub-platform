import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, ShieldCheck, Heart, HandHeart, MapPin, CheckCircle2, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero.png";

export default function Landing() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <header className="relative z-10 mx-auto flex h-20 w-full max-w-6xl items-center justify-between border-b border-border/70 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3" data-testid="link-home-brand">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#4285F4] font-bold text-white">
            <span className="absolute left-0 top-0 h-2 w-2 rounded-tl-xl bg-[#EA4335]" /><span className="absolute bottom-0 right-0 h-2 w-2 rounded-br-xl bg-[#34A853]" />V
          </div>
          <div><span className="block text-[15px] font-bold leading-none">Volunteer Hub</span><span className="label-mono mt-1 block text-muted-foreground">community network</span></div>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/login" data-testid="link-sign-in" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">Sign in</Link>
          <Link href="/register" data-testid="link-get-started" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90">Get started</Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="page-grid relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.03fr_.97fr] md:py-24">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-7"
          >
            <motion.div variants={item} className="label-mono flex items-center gap-2 text-primary"><span className="h-2 w-2 rounded-full bg-[#34A853]" />trusted local support, made visible</motion.div>
            <motion.h1 variants={item} className="max-w-xl text-5xl font-bold leading-[1.04] tracking-[-.045em] text-foreground sm:text-6xl">
              Connect. Volunteer.<br /><span className="text-primary">Make an impact.</span>
            </motion.h1>
            <motion.p variants={item} className="max-w-lg text-lg leading-relaxed text-muted-foreground">
              A clearer way for neighbors to ask for help, offer their skills, and build trust one good deed at a time.
            </motion.p>
            <motion.div variants={item} className="flex flex-wrap gap-4">
              <Link href="/register" data-testid="link-hero-join" className="inline-flex h-12 items-center rounded-lg bg-primary px-6 font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90">Join the community <ArrowRight className="ml-2 h-4 w-4" /></Link>
              <Link href="/login" data-testid="link-hero-login" className="inline-flex h-12 items-center rounded-lg border border-border bg-card px-6 font-semibold transition hover:-translate-y-0.5 hover:border-primary/40">I have an account</Link>
            </motion.div>
            <motion.div variants={item} className="flex items-center gap-5 pt-2 text-sm text-muted-foreground"><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#34A853]" />Privacy-minded</span><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#34A853]" />People-powered</span></motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-[2rem] border border-[#4285F4]/20 bg-[#4285F4]/[.06] rotate-2"></div>
            <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-2 shadow-xl">
            <img
              src={heroImg} 
              alt="Community helping each other" 
              className="relative aspect-[4/3] w-full rounded-xl object-cover md:aspect-square"
            />
            <div className="absolute bottom-6 left-6 flex items-center gap-3 rounded-xl border border-white/60 bg-card/95 px-4 py-3 shadow-lg"><div className="rounded-lg bg-[#34A853]/12 p-2 text-[#21833E]"><MapPin className="h-4 w-4" /></div><div><p className="text-xs font-semibold">Help is close by</p><p className="label-mono mt-1 text-muted-foreground">your neighborhood</p></div></div>
            </div>
          </motion.div>
          </div>
        </section>

        <section className="border-y border-border/70 bg-card py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-12 max-w-xl"><span className="label-mono text-primary">one network, three perspectives</span><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Everyone has a part to play.</h2><p className="mt-3 text-muted-foreground">Volunteer Hub keeps the experience focused for every person in the circle.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <motion.div 
                whileHover={{ y: -5 }}
                className="rounded-2xl border border-border/80 bg-[#F9AB00]/[.06] p-7 shadow-sm"
              >
                <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F9AB00]/15 text-[#9A6800]">
                  <Heart className="w-7 h-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold">Ask for help</h3><p className="text-muted-foreground">Share what you need, with privacy controls that keep personal details protected until trust is established.</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="rounded-2xl border border-border/80 bg-[#34A853]/[.06] p-7 shadow-sm"
              >
                <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-[#34A853]/15 text-[#21833E]">
                  <HandHeart className="w-7 h-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold">Offer your skills</h3><p className="text-muted-foreground">Find meaningful, local requests that match your availability and experience.</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="rounded-2xl border border-border/80 bg-[#4285F4]/[.06] p-7 shadow-sm"
              >
                <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-[#4285F4]/15 text-[#2563C4]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold">Keep it safe</h3><p className="text-muted-foreground">Admins maintain a healthy network so neighbors can show up with confidence.</p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl bg-[#1E1E1E] px-7 py-12 text-white sm:px-12"><Sparkles className="absolute right-10 top-8 h-20 w-20 text-[#F9AB00]/30" /><span className="label-mono text-[#A9C7FF]">start where you are</span><h2 className="relative mt-4 max-w-lg text-3xl font-bold tracking-tight sm:text-4xl">Small actions make a neighborhood stronger.</h2><Link href="/register" data-testid="link-footer-join" className="relative mt-8 inline-flex items-center rounded-lg bg-white px-5 py-3 font-semibold text-[#1E1E1E] transition hover:-translate-y-0.5">Join Volunteer Hub <ArrowRight className="ml-2 h-4 w-4" /></Link></div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-muted-foreground">
        <p>Volunteer Hub · Built for the community.</p>
      </footer>
    </div>
  );
}
