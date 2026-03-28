// ============================================================
// ZAPP Donuts ERP - Public Landing Page
// ============================================================

import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  UserCheck,
  Truck,
  TrendingUp,
  MapPin,
  Factory,
  Handshake,
  Sparkles,
  ArrowRight,
  ChevronRight,
  BarChart3,
  Shield,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui';

// ── Section wrapper ────────────────────────────────────────────

function Section({
  id,
  className = '',
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

// ── Landing Page ──────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navbar ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-orange-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <img src="/Logo.jpg" alt="ZAPP Donuts" className="h-9 w-9 rounded-lg object-cover" />
            <span className="text-lg font-bold text-zapp-brown">
              ZAPP <span className="text-zapp-orange">Donuts</span>
            </span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#about" className="text-sm font-medium text-gray-600 hover:text-zapp-orange transition-colors">
              About
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-zapp-orange transition-colors">
              How It Works
            </a>
<a href="#plants" className="text-sm font-medium text-gray-600 hover:text-zapp-orange transition-colors">
              Our Plants
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/stores')}>
              View Stores
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/apply')}>
              Apply Now
            </Button>
          </div>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zapp-orange via-orange-400 to-zapp-cream">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-white/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-white/5" />

        <Section className="relative py-20 sm:py-28 lg:py-36">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                <Sparkles size={14} />
                AI-Powered Franchise Operations
              </div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Franchise Your{' '}
                <span className="relative">
                  Success
                  <span className="absolute -bottom-1 left-0 h-1 w-full rounded bg-zapp-gold" />
                </span>{' '}
                with ZAPP Donuts
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90">
                Join the fastest-growing donut franchise in the Philippines. With three strategic plants,
                AI-assisted inventory management, and a modern ERP platform, we make franchise ownership
                simple, profitable, and scalable.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  iconRight={<ArrowRight size={18} />}
                  onClick={() => navigate('/apply')}
                  className="!bg-white !text-zapp-orange hover:!bg-zapp-cream font-bold shadow-lg"
                >
                  Apply Now
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  iconRight={<ChevronRight size={18} />}
                  onClick={() => navigate('/stores')}
                  className="!text-white hover:!bg-white/20 border border-white/30"
                >
                  View Stores
                </Button>
              </div>

              {/* Quick stats */}
              <div className="mt-12 grid grid-cols-3 gap-6">
                {[
                  { value: '3', label: 'Production Plants' },
                  { value: '50+', label: 'Active Stores' },
                  { value: '5', label: 'Distributor Partners' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl font-extrabold text-white">{stat.value}</div>
                    <div className="mt-1 text-sm text-white/70">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side: visual card */}
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-white/10 blur-2xl" />
                <div className="relative rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: <Factory size={28} />, text: 'Multi-Plant Production' },
                      { icon: <Truck size={28} />, text: 'Daily Deliveries' },
                      { icon: <BarChart3 size={28} />, text: 'AI-Powered Analytics' },
                      { icon: <Shield size={28} />, text: 'Full ERP Support' },
                    ].map((item) => (
                      <div
                        key={item.text}
                        className="flex flex-col items-center gap-3 rounded-2xl bg-white/10 p-6 text-center"
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 text-white">
                          {item.icon}
                        </div>
                        <span className="text-sm font-semibold text-white">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* ─── About Section ──────────────────────────────────── */}
      <Section id="about" className="py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-sm font-bold uppercase tracking-wider text-zapp-orange">About Us</span>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">About ZAPP Donuts</h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              ZAPP Donuts is a Philippine-based donut franchise that operates on a multi-plant distribution
              model. With production facilities in <strong>Daraga (Bicol)</strong>,{' '}
              <strong>Manila (NCR)</strong>, and <strong>Cebu (Visayas)</strong>, we ensure fresh daily
              deliveries to franchise stores across the nation.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              We partner with franchisees to provide a seamless and scalable business experience, backed by
              reliable logistics, consistent product quality, and strong operational support.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              What sets us apart is our <strong>AI-assisted operations platform</strong> — a modern ERP
              system that handles inventory counting via image recognition, automated billing reconciliation,
              demand forecasting, and real-time sales analytics. Franchise owners spend less time on
              paperwork and more time growing their business.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              {
                icon: <Zap size={24} className="text-zapp-orange" />,
                title: 'AI-Assisted Operations',
                desc: 'Computer vision for inventory, smart forecasting, and automated billing.',
              },
              {
                icon: <Truck size={24} className="text-zapp-orange" />,
                title: 'Daily Fresh Deliveries',
                desc: 'Products baked and delivered daily from the nearest plant.',
              },
              {
                icon: <Handshake size={24} className="text-zapp-orange" />,
                title: 'Two Franchise Models',
                desc: 'Choose between distributor-linked or direct franchise partnerships.',
              },
              {
                icon: <BarChart3 size={24} className="text-zapp-orange" />,
                title: 'Modern ERP Platform',
                desc: 'Full-featured dashboard for sales tracking, billing, and reporting.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-6 transition-colors hover:border-orange-200 hover:bg-orange-50/30"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-orange-100">
                  {item.icon}
                </div>
                <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── How It Works ───────────────────────────────────── */}
      <Section id="how-it-works" className="bg-zapp-cream/40 py-20 lg:py-28">
        <div className="text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-zapp-orange">How It Works</span>
          <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
            Four Simple Steps to Franchise Ownership
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Our streamlined application process gets you from interested applicant to operational franchise
            owner in no time.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: 1,
              icon: <ClipboardCheck size={28} />,
              title: 'Apply with Referral Code',
              desc: 'Get a referral code from a distributor or ZAPP representative. Fill out the online application with your details and store information.',
            },
            {
              step: 2,
              icon: <UserCheck size={28} />,
              title: 'Get Reviewed & Approved',
              desc: 'Our area supervisors and operations team review your application, verify documents, and approve your franchise within days.',
            },
            {
              step: 3,
              icon: <Truck size={28} />,
              title: 'Receive Daily Deliveries',
              desc: 'Once approved, your store receives fresh donut deliveries daily from the nearest plant. AI verifies each delivery receipt.',
            },
            {
              step: 4,
              icon: <TrendingUp size={28} />,
              title: 'Track Sales & Grow',
              desc: 'Use the ZAPP ERP to track sales, manage billing, view analytics, and grow your franchise with data-driven insights.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Step number */}
              <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-zapp-orange text-sm font-bold text-white shadow-md shadow-orange-200">
                {item.step}
              </div>
              <div className="mt-2 mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-50 text-zapp-orange">
                {item.icon}
              </div>
              <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── Our Plants ─────────────────────────────────────── */}
      <Section id="plants" className="bg-zapp-cream/40 py-20 lg:py-28">
        <div className="text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-zapp-orange">
            Our Plants
          </span>
          <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
            Strategically Located Production
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Three production plants across the Philippines ensure fresh daily deliveries to every franchise
            store in their region.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {[
            {
              name: 'Daraga Plant',
              code: 'DRG',
              location: 'Daraga, Albay',
              region: 'Bicol Region',
              coverage: 'Albay, Camarines Sur, Sorsogon, and nearby provinces',
              color: 'from-orange-500 to-red-500',
              iconBg: 'bg-orange-100 text-orange-600',
            },
            {
              name: 'Manila Plant',
              code: 'MNL',
              location: 'Tondo, Manila',
              region: 'National Capital Region',
              coverage: 'Manila, Makati, Quezon City, Pasig, and Metro Manila',
              color: 'from-blue-500 to-indigo-500',
              iconBg: 'bg-blue-100 text-blue-600',
            },
            {
              name: 'Cebu Plant',
              code: 'CEB',
              location: 'Mandaue, Cebu',
              region: 'Visayas Region',
              coverage: 'Cebu, Mandaue, Lapu-Lapu, and surrounding Visayan areas',
              color: 'from-emerald-500 to-teal-500',
              iconBg: 'bg-emerald-100 text-emerald-600',
            },
          ].map((plant) => (
            <div
              key={plant.code}
              className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-lg"
            >
              {/* Gradient header */}
              <div className={`bg-gradient-to-r ${plant.color} px-6 py-8 text-white`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-white/70">
                      Plant Code: {plant.code}
                    </div>
                    <h3 className="mt-1 text-xl font-bold">{plant.name}</h3>
                  </div>
                  <Factory size={32} className="text-white/30" />
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} className="text-gray-400" />
                  {plant.location}
                </div>
                <div className="mt-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Region</span>
                  <p className="mt-0.5 text-sm font-semibold text-gray-900">{plant.region}</p>
                </div>
                <div className="mt-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Coverage</span>
                  <p className="mt-0.5 text-sm text-gray-600">{plant.coverage}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── CTA Section ────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-zapp-orange to-orange-500">
        <Section className="py-20 lg:py-24">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
              Ready to Join ZAPP Donuts?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
              Start your franchise journey today. Apply now and become part of the ZAPP Donuts family --
              where AI meets delicious donuts.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                variant="secondary"
                iconRight={<ArrowRight size={18} />}
                onClick={() => navigate('/apply')}
                className="!bg-white !text-zapp-orange hover:!bg-zapp-cream font-bold shadow-lg"
              >
                Apply Now
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => navigate('/stores')}
                className="!text-white hover:!bg-white/20 border border-white/30"
              >
                Browse Store Directory
              </Button>
            </div>
          </div>
        </Section>
      </div>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <img src="/Logo.jpg" alt="ZAPP Donuts" className="h-8 w-8 rounded-lg object-cover" />
              <span className="text-sm font-bold text-gray-900">ZAPP Donuts ERP</span>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/stores')}
                className="text-sm text-gray-500 hover:text-zapp-orange transition-colors"
              >
                Store Directory
              </button>
              <button
                onClick={() => navigate('/apply')}
                className="text-sm text-gray-500 hover:text-zapp-orange transition-colors"
              >
                Apply
              </button>
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-gray-500 hover:text-zapp-orange transition-colors"
              >
                Franchisee Login
              </button>
            </div>
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} ZAPP Donuts. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
