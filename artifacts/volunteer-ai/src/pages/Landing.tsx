import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Heart, HandHeart } from "lucide-react";
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
    <div className="min-h-screen bg-background flex flex-col">
      <header className="container mx-auto px-4 h-20 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold font-serif text-xl italic">
            V
          </div>
          <span className="font-bold text-xl">Volunteer AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            <motion.h1 variants={item} className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
              Help reaches your neighborhood, <span className="text-primary italic font-serif">faster.</span>
            </motion.h1>
            <motion.p variants={item} className="text-xl text-muted-foreground leading-relaxed">
              Connect with local volunteers ready to help with medical needs, education, elder care, and disaster relief. Powered by community trust.
            </motion.p>
            <motion.div variants={item} className="flex flex-wrap gap-4">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full">
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full">
                  Sign In
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/10 rounded-[2rem] transform rotate-3 scale-105 transition-transform duration-500 hover:rotate-6"></div>
            <img 
              src={heroImg} 
              alt="Community helping each other" 
              className="relative rounded-[2rem] shadow-2xl object-cover w-full aspect-video md:aspect-square"
            />
          </motion.div>
        </section>

        <section className="bg-muted/30 py-24 border-y">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for three roles</h2>
              <p className="text-muted-foreground text-lg">A unified platform connecting those in need, those who can help, and those who organize.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-card p-8 rounded-3xl shadow-sm border border-card-border"
              >
                <div className="w-14 h-14 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                  <Heart className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Users</h3>
                <p className="text-muted-foreground">Post requests for help securely. Approve the volunteers you trust and get the assistance you need quickly.</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-card p-8 rounded-3xl shadow-sm border border-card-border"
              >
                <div className="w-14 h-14 bg-teal-500/10 text-teal-600 rounded-2xl flex items-center justify-center mb-6">
                  <HandHeart className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Volunteers</h3>
                <p className="text-muted-foreground">Browse local requests, apply with your skills, and make a real difference in your community.</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-card p-8 rounded-3xl shadow-sm border border-card-border"
              >
                <div className="w-14 h-14 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <Shield className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Admins</h3>
                <p className="text-muted-foreground">Oversee the platform, track metrics, and ensure a safe environment for all community members.</p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-24 container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">Ready to make an impact?</h2>
          <Link href="/register">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full">
              Join the Community
            </Button>
          </Link>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-muted-foreground">
        <p>Volunteer AI. Built for the community.</p>
      </footer>
    </div>
  );
}
