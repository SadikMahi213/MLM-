"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { useSettingsStore } from "@/stores/settings-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  Gift,
  Globe,
  Lock,
  Network,
  Route,
  TrendingUp,
  Users,
  Wallet,
  Star,
  Quote,
  Menu,
  X,
  Check,
  ChevronRight,
} from "lucide-react"

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const features = [
  {
    icon: Network,
    title: "Binary MLM System",
    description: "Powerful binary compensation plan with automatic spillover and matching bonuses.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Wallet,
    title: "Smart Wallet",
    description: "Multi-currency wallet with instant deposits, withdrawals, and real-time balance tracking.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Comprehensive dashboard with live metrics, charts, and performance insights.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Globe,
    title: "Global Referrals",
    description: "Track referrals worldwide with unique referral links and multi-level commission tracking.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Gift,
    title: "Daily Rewards",
    description: "Automated daily bonus distribution with rank achievements and pool sharing.",
    gradient: "from-amber-500 to-yellow-500",
  },
  {
    icon: Lock,
    title: "Secure Platform",
    description: "Bank-grade security with 2FA, encrypted transactions, and fraud detection systems.",
    gradient: "from-indigo-500 to-violet-500",
  },
]

const steps = [
  {
    number: "01",
    title: "Register Account",
    description: "Create your free account in minutes. No upfront fees required to get started.",
    icon: Users,
  },
  {
    number: "02",
    title: "Choose Package",
    description: "Select from our range of investment packages tailored to your goals.",
    icon: Route,
  },
  {
    number: "03",
    title: "Grow Your Team",
    description: "Share your referral link and build your network across the globe.",
    icon: Network,
  },
  {
    number: "04",
    title: "Earn Rewards",
    description: "Receive commissions, bonuses, and rewards as your team grows.",
    icon: Gift,
  },
]

const packages = [
  {
    name: "Starter",
    price: "99",
    description: "Perfect for beginners",
    features: [
      "Binary MLM placement",
      "5% referral commission",
      "Basic analytics",
      "Email support",
      "1 wallet address",
    ],
    popular: false,
  },
  {
    name: "Professional",
    price: "499",
    description: "Best for growing teams",
    features: [
      "Everything in Starter",
      "10% referral commission",
      "Advanced analytics",
      "Priority support",
      "Multiple wallets",
      "Daily bonus eligibility",
      "Team matching bonus",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "999",
    description: "For serious networkers",
    features: [
      "Everything in Professional",
      "15% referral commission",
      "Real-time analytics API",
      "24/7 dedicated support",
      "Unlimited wallets",
      "Daily & weekly bonuses",
      "Global pool sharing",
      "Rank achievement rewards",
    ],
    popular: false,
  },
]

const testimonials = [
  {
    name: "Sarah Al-Abdullah",
    role: "Top Earner, Saudi Arabia",
    content: "This platform has transformed my financial future. The binary system is incredibly rewarding and the support team is outstanding.",
    rating: 5,
  },
  {
    name: "Ahmed Hassan",
    role: "Team Leader, UAE",
    content: "I've tried many MLM platforms, but this one stands out with its transparency, real-time tracking, and consistent payouts.",
    rating: 5,
  },
  {
    name: "Maria Khan",
    role: "Regional Director, Pakistan",
    content: "The global reach of this platform is amazing. I've built a team across 15 countries and the commissions keep growing.",
    rating: 5,
  },
]

const faqs = [
  {
    question: "How do I earn commissions?",
    answer: "You earn commissions through your binary MLM structure. When you refer new members and they join packages, you receive referral commissions. Additionally, you earn from team matching bonuses and daily reward pools based on your rank and activity.",
  },
  {
    question: "What is the minimum withdrawal amount?",
    answer: "The minimum withdrawal amount is $50 for most payment methods. Withdrawals are processed within 24-48 hours and can be made to your bank account, cryptocurrency wallet, or e-wallet.",
  },
  {
    question: "How does the binary MLM system work?",
    answer: "Our binary MLM system places new members in your left and right legs. You earn commissions based on the weaker leg's volume, ensuring balanced growth and encouraging team support. Spillover from upline members helps your team grow faster.",
  },
  {
    question: "Is my investment secure?",
    answer: "Absolutely. We employ bank-grade encryption, two-factor authentication, and advanced fraud detection. All transactions are recorded on an immutable ledger, and we maintain segregated accounts for client funds.",
  },
  {
    question: "Can I upgrade my package later?",
    answer: "Yes, you can upgrade your package at any time. When you upgrade, you gain access to higher commission rates, additional features, and enhanced bonus opportunities. The upgrade fee is adjusted based on your current package.",
  },
]

const navLinks = ["Features", "Packages", "Testimonials", "FAQ"]

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { getString } = useSettingsStore()
  const siteName = getString("app_name", "MLM Pro")

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg">
            <span className="text-sm font-bold text-white">{siteName.charAt(0)}</span>
          </div>
          <span className="text-lg font-bold">{siteName}</span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <a href="/login">Sign In</a>
          </Button>
          <Button size="sm" asChild>
            <a href="/register">Get Started</a>
          </Button>
        </div>
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-white/10 bg-background px-4 py-4 md:hidden"
        >
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {link}
              </a>
            ))}
            <Separator />
            <Button variant="outline" size="sm" asChild>
              <a href="/login">Sign In</a>
            </Button>
            <Button size="sm" asChild>
              <a href="/register">Get Started</a>
            </Button>
          </div>
        </motion.div>
      )}
    </nav>
  )
}

function HeroSection() {
  const { getString, getBool } = useSettingsStore()
  const heroTitle = getString("hero_title", "Build Your MLM Empire")
  const heroSubtitle = getString("hero_subtitle", "Empower your network with cutting-edge tools")
  const heroCtaText = getString("hero_cta_text", "Get Started")
  const heroCtaUrl = getString("hero_cta_url", "/register")
  const siteName = getString("app_name", "MLM Pro")
  const featuresVisible = getBool("features_visible", true)

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/10 to-cyan-600/20 dark:from-purple-900/30 dark:via-blue-900/20 dark:to-cyan-900/30" />
      <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-purple-500/20 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="mx-auto max-w-4xl text-center"
        >
          {featuresVisible && (
            <motion.div variants={fadeUp}>
              <Badge variant="premium" className="mb-6 px-4 py-1.5 text-sm">
                <Star className="mr-1.5 h-3.5 w-3.5" /> World-Class MLM Platform
              </Badge>
            </motion.div>
          )}
          <motion.h1
            variants={fadeUp}
            className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
          >
            {heroTitle}
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-6 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto"
          >
            {heroSubtitle}
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Button size="xl" className="w-full sm:w-auto" asChild>
              <a href={heroCtaUrl}>
                {heroCtaText} <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button
              variant="glass"
              size="xl"
              className="w-full sm:w-auto"
              asChild
            >
              <a href="#features">Learn More</a>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:grid-cols-4 sm:p-8"
        >
          {[
            { value: "50K+", label: "Active Users" },
            { value: "$10M+", label: "Total Paid" },
            { value: "150+", label: "Countries" },
            { value: "$50M+", label: "Volume" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold sm:text-3xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center"
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-bold sm:text-4xl">
            Everything You Need to Succeed
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Our platform provides all the tools and features to build and scale your network
            marketing business effectively.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div key={feature.title} variants={fadeUp}>
                <Card className="group h-full border-white/10 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div
                      className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

function CTASection({ title, subtitle, primaryText, primaryHref }: {
  title: string
  subtitle: string
  primaryText: string
  primaryHref: string
}) {
  return (
    <section className="relative py-20">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-cyan-600/10" />
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
        className="relative mx-auto max-w-3xl px-4 text-center sm:px-6"
      >
        <motion.h2 variants={fadeUp} className="text-3xl font-bold sm:text-4xl">
          {title}
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mt-4 text-lg text-muted-foreground"
        >
          {subtitle}
        </motion.p>
        <motion.div variants={fadeUp} className="mt-8">
          <Button size="xl" asChild>
            <a href={primaryHref}>
              {primaryText} <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}

function HowItWorksSection() {
  return (
    <section id="packages" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center"
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-bold sm:text-4xl">
            How It Works
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Start your journey in four simple steps and begin earning commissions immediately.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div key={step.number} variants={fadeUp} className="relative text-center">
                {index < steps.length - 1 && (
                  <div className="absolute top-8 left-[60%] hidden h-[2px] w-[80%] bg-gradient-to-r from-purple-500/50 to-transparent lg:block" />
                )}
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div className="mb-2 text-sm font-bold text-purple-400">{step.number}</div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

function PricingSection() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center"
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-bold sm:text-4xl">
            Choose Your Package
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Select the package that matches your ambition. Upgrade anytime as your business grows.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="mt-14 grid gap-8 lg:grid-cols-3"
        >
          {packages.map((pkg, index) => (
            <motion.div key={pkg.name} variants={fadeUp} className="relative">
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge variant="premium" className="px-4 py-1 text-sm">
                    Most Popular
                  </Badge>
                </div>
              )}
              <Card
                className={`relative h-full border-white/10 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${
                  pkg.popular
                    ? "border-purple-500/50 shadow-purple-500/10 scale-105"
                    : "hover:border-white/20"
                }`}
              >
                <CardContent className="flex flex-col p-8">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <CardDescription className="mt-1">{pkg.description}</CardDescription>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${pkg.price}</span>
                    <span className="text-sm text-muted-foreground">/ one-time</span>
                  </div>
                  <ul className="mt-8 flex-1 space-y-3">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-8 w-full"
                    variant={pkg.popular ? "default" : "outline"}
                    size="lg"
                    asChild
                  >
                    <a href="/register">
                      {pkg.popular ? "Get Started Now" : "Choose Plan"}{" "}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center"
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-bold sm:text-4xl">
            What Our Members Say
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Join thousands of successful entrepreneurs who have transformed their lives with our platform.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="mt-14 grid gap-8 md:grid-cols-3"
        >
          {testimonials.map((testimonial) => (
            <motion.div key={testimonial.name} variants={fadeUp}>
              <Card className="h-full border-white/10 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:shadow-xl">
                <CardContent className="flex flex-col p-8">
                  <Quote className="mb-4 h-8 w-8 text-purple-500/50" />
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                    "{testimonial.content}"
                  </p>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-sm font-bold text-white">
                      {testimonial.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function FAQSection() {
  const [openItem, setOpenItem] = useState<string | null>(null)

  return (
    <section id="faq" className="relative py-20 sm:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center"
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-bold sm:text-4xl">
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 text-lg text-muted-foreground"
          >
            Everything you need to know about our platform
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="mt-12 space-y-3"
        >
          {faqs.map((faq) => (
            <motion.div key={faq.question} variants={fadeUp}>
              <Collapsible
                open={openItem === faq.question}
                onOpenChange={() =>
                  setOpenItem(openItem === faq.question ? null : faq.question)
                }
              >
                <Card className="border-white/10 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-white/20">
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-6 text-left">
                    <span className="text-sm font-medium sm:text-base">{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                        openItem === faq.question ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-6 pb-6">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function Footer() {
  const { getString, getBool } = useSettingsStore()
  const siteName = getString("app_name", "MLM Pro")
  const footerText = getString("footer_text", "")
  const facebookUrl = getString("facebook_url", "#")
  const twitterUrl = getString("twitter_url", "#")
  const telegramUrl = getString("telegram_url", "#")
  const whatsappNumber = getString("whatsapp_number", "")
  const termsUrl = getBool("terms_of_service", false) ? getString("terms_of_service", "") : null
  const privacyUrl = getBool("privacy_policy", false) ? getString("privacy_policy", "") : null

  return (
    <footer className="border-t border-white/10 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg">
                <span className="text-sm font-bold text-white">{siteName.charAt(0)}</span>
              </div>
              <span className="text-lg font-bold">{siteName}</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Empowering entrepreneurs worldwide with cutting-edge MLM technology and
              unparalleled earning opportunities.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">Platform</h4>
            <ul className="space-y-2">
              {["Features", "Packages", "FAQ", "Testimonials"].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">Company</h4>
            <ul className="space-y-2">
              {["About", "Blog", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2">
              {privacyUrl && (
                <li>
                  <a href={privacyUrl} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    Privacy Policy
                  </a>
                </li>
              )}
              {termsUrl && (
                <li>
                  <a href={termsUrl} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    Terms of Service
                  </a>
                </li>
              )}
              <li>
                <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  GDPR
                </a>
              </li>
            </ul>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            {footerText || `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`}
          </p>
          <div className="flex gap-4">
            {facebookUrl && facebookUrl !== "#" && (
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Facebook
              </a>
            )}
            {twitterUrl && twitterUrl !== "#" && (
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Twitter
              </a>
            )}
            {telegramUrl && telegramUrl !== "#" && (
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Telegram
              </a>
            )}
            {whatsappNumber && (
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function LandPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <CTASection
          title="Ready to Build Your Empire?"
          subtitle="Join thousands of successful entrepreneurs already earning with MLM Pro."
          primaryText="Start Your Journey"
          primaryHref="/register"
        />
        <HowItWorksSection />
        <PricingSection />
        <CTASection
          title="Don't Wait — Your Future Starts Now"
          subtitle="The best time to start building your network is today."
          primaryText="Get Started Free"
          primaryHref="/register"
        />
        <TestimonialsSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}
