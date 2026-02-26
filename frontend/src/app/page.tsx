"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth";
import Link from "next/link";

const IS_COMING_SOON = process.env.NEXT_PUBLIC_COMING_SOON === "true";

/* ───────────────────────── Coming Soon ───────────────────────── */
function ComingSoon() {
  const TARGET = new Date("2026-05-01T00:00:00+03:00").getTime();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    function calc() {
      const diff = Math.max(0, TARGET - Date.now());
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    }
    setTimeLeft(calc());
    const id = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(id);
  }, [TARGET]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Brand */}
        <div className="animate-fade-in-up">
          <span className="text-2xl font-bold text-white tracking-tight">SiteTakip</span>
        </div>

        {/* Heading */}
        <h1 className="mt-8 text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight animate-fade-in-up-delay-1">
          Yakında Hizmetinizdeyiz
        </h1>
        <p className="mt-6 text-lg text-slate-400 max-w-lg mx-auto leading-relaxed animate-fade-in-up-delay-2">
          Site yönetimini kolaylaştıran platformumuz üzerinde çalışıyoruz.
          Aidat takibi, gider yönetimi ve raporlama — hepsi tek yerde.
        </p>

        {/* Countdown */}
        <div className="mt-12 flex items-center justify-center gap-3 sm:gap-5 animate-fade-in-up-delay-3">
          {([
            ["days", "Gün"],
            ["hours", "Saat"],
            ["minutes", "Dakika"],
            ["seconds", "Saniye"],
          ] as const).map(([key, label]) => (
            <div key={key} className="flex flex-col items-center">
              <div className="countdown-box w-16 h-16 sm:w-20 sm:h-20 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl flex items-center justify-center">
                <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                  {String(timeLeft[key]).padStart(2, "0")}
                </span>
              </div>
              <span className="mt-2 text-xs text-slate-500 uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>

        {/* Email form */}
        <div className="mt-12 animate-fade-in-up-delay-3">
          {submitted ? (
            <div className="inline-flex items-center gap-2 text-green-400 bg-green-400/10 border border-green-400/20 rounded-xl px-6 py-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-sm font-medium">Kaydınız alındı! Lansman günü sizi bilgilendireceğiz.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresiniz"
                className="w-full sm:flex-1 bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <button
                type="submit"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl px-6 py-3 text-sm transition-colors whitespace-nowrap"
              >
                Beni Haberdar Et
              </button>
            </form>
          )}
        </div>

        {/* Footer hint */}
        <p className="mt-16 text-xs text-slate-600 animate-fade-in-up-delay-3">
          &copy; {new Date().getFullYear()} SiteTakip
        </p>
      </div>
    </div>
  );
}

/* ───────────────────────────── FAQ Data ───────────────────────────── */
const faqs = [
  {
    q: "Ücretsiz deneme süresi var mı?",
    a: "Evet! Tüm paketlerde 3 ay ücretsiz deneme süresi sunuyoruz. Kredi kartı bilgisi gerekmez.",
  },
  {
    q: "Verilerim güvende mi?",
    a: "Tüm veriler SSL şifreleme ile korunur ve düzenli yedekleme yapılır. Verileriniz yalnızca size aittir.",
  },
  {
    q: "Kaç site ekleyebilirim?",
    a: "Paketinize bağlı olarak birden fazla site yönetebilirsiniz. Her site için ayrı daire, sakin ve aidat takibi yapabilirsiniz.",
  },
  {
    q: "Mevcut verilerimi aktarabilir miyim?",
    a: "Excel veya CSV formatındaki mevcut verilerinizi kolayca içe aktarabilirsiniz. Destek ekibimiz geçiş sürecinde size yardımcı olur.",
  },
  {
    q: "Teknik destek sunuyor musunuz?",
    a: "Gold ve Platinum paketlerde öncelikli e-posta ve telefon desteği sunuyoruz. Silver pakette topluluk forumu desteği mevcuttur.",
  },
];

/* ───────────────────────────── Page ───────────────────────────── */
export default function Home() {
  if (IS_COMING_SOON) return <ComingSoon />;

  return <LandingPage />;
}

function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  // Navbar background on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // If logged in, show loading while redirecting
  if (!loading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navbar ─── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <Link href="/" className="text-xl font-bold text-slate-900 tracking-tight">
            SiteTakip
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Özellikler
            </a>
            <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Fiyatlandırma
            </a>
            <a href="#faq" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              SSS
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors px-4 py-2"
            >
              Giriş Yap
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 transition-colors"
            >
              Ücretsiz Dene
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            aria-label="Menüyü aç"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-6 pb-4 space-y-3">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-600 hover:text-slate-900 py-1"
            >
              Özellikler
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-600 hover:text-slate-900 py-1"
            >
              Fiyatlandırma
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-600 hover:text-slate-900 py-1"
            >
              SSS
            </a>
            <div className="flex gap-3 pt-2">
              <Link href="/login" className="text-sm font-medium text-slate-700 py-2">
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium text-white bg-blue-600 rounded-lg px-4 py-2"
              >
                Ücretsiz Dene
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ─── Hero ─── */}
      <section className="pt-32 pb-20 px-6 md:pt-40 md:pb-28">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <span className="inline-block text-sm font-medium text-blue-600 bg-blue-50 rounded-full px-4 py-1.5 mb-6">
              3 ay ücretsiz deneme
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight animate-fade-in-up-delay-1">
            Site Yönetimini
            <br />
            Kolaylaştırın
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed animate-fade-in-up-delay-2">
            Aidat takibi, gider yönetimi, raporlama — tek platformda.
            <br className="hidden sm:block" />
            Karmaşık Excel tablolarına elveda deyin.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up-delay-3">
            <Link
              href="/register"
              className="w-full sm:w-auto text-center font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-8 py-3.5 text-base transition-colors shadow-lg shadow-blue-600/20"
            >
              Ücretsiz Deneyin
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto text-center font-medium text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-xl px-8 py-3.5 text-base transition-colors"
            >
              Nasıl Çalışır?
            </a>
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="mt-16 max-w-5xl mx-auto animate-fade-in-up-delay-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl shadow-slate-200/50 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-white">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-3 text-xs text-slate-400">site-takip.com/dashboard</span>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Toplam Aidat", value: "₺45.600", color: "text-slate-900" },
                  { label: "Ödenen", value: "₺38.200", color: "text-green-600" },
                  { label: "Bekleyen", value: "₺5.400", color: "text-yellow-600" },
                  { label: "Geciken", value: "₺2.000", color: "text-red-500" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-xl p-4 border border-slate-100">
                    <p className="text-xs text-slate-500">{stat.label}</p>
                    <p className={`text-lg font-semibold mt-1 ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { unit: "Daire 1 — Ahmet Yılmaz", amount: "₺1.200", status: "Ödendi", statusColor: "bg-green-100 text-green-700" },
                  { unit: "Daire 2 — Fatma Demir", amount: "₺1.200", status: "Bekliyor", statusColor: "bg-yellow-100 text-yellow-700" },
                  { unit: "Daire 3 — Mehmet Kaya", amount: "₺1.200", status: "Gecikmiş", statusColor: "bg-red-100 text-red-700" },
                ].map((row) => (
                  <div
                    key={row.unit}
                    className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-slate-100 text-sm"
                  >
                    <span className="text-slate-700">{row.unit}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-900 font-medium">{row.amount}</span>
                      <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${row.statusColor}`}>
                        {row.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-20 px-6 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              İhtiyacınız olan her şey
            </h2>
            <p className="mt-4 text-slate-500 text-lg max-w-xl mx-auto">
              Site yönetiminin tüm süreçlerini tek bir platformdan yönetin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Aidat Takibi */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Aidat Takibi</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Toplu aidat oluşturma, ödeme takibi ve gecikme bildirimi ile aidatlarınızı kolayca yönetin.
              </p>
            </div>

            {/* Gider Yönetimi */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Gider Yönetimi</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Kategorili gider kaydı, fatura yükleme ve otomatik raporlama ile harcamalarınızı kontrol altına alın.
              </p>
            </div>

            {/* Raporlama */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Raporlama</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Aylık gelir-gider özeti, daire bazlı analiz ve görsel grafiklerle sitenizin mali durumunu takip edin.
              </p>
            </div>

            {/* Bildirimler */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">Bildirimler</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                WhatsApp bağlantısı ve SMS hatırlatma ile sakinlerinizi aidat ödemelerinden haberdar edin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Nasıl çalışır?
            </h2>
            <p className="mt-4 text-slate-500 text-lg">
              Üç adımda site yönetiminizi dijitalleştirin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                step: "1",
                title: "Kayıt olun",
                desc: "Ücretsiz hesabınızı oluşturun ve sitenizi ekleyin. 2 dakikadan kısa sürer.",
              },
              {
                step: "2",
                title: "Tanımlayın",
                desc: "Daireleri ve sakinleri sisteme girin. Excel'den toplu aktarım da yapabilirsiniz.",
              },
              {
                step: "3",
                title: "Takip edin",
                desc: "Aidatları oluşturun, ödemeleri takip edin ve raporlarınızı görüntüleyin.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-20 px-6 bg-slate-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Fiyatlandırma
            </h2>
            <p className="mt-4 text-slate-500 text-lg">
              Sitenizin büyüklüğüne uygun planı seçin. Tüm planlarda 3 ay ücretsiz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Silver */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 flex flex-col">
              <h3 className="text-lg font-semibold text-slate-900">Silver</h3>
              <p className="text-sm text-slate-500 mt-1">Küçük siteler için</p>
              <div className="mt-6 mb-8">
                <span className="text-4xl font-bold text-slate-900">₺199</span>
                <span className="text-slate-500 text-sm">/ay</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {["50 daireye kadar", "Aidat takibi", "Gider yönetimi", "Temel raporlama", "E-posta desteği"].map(
                  (f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <svg className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {f}
                    </li>
                  )
                )}
              </ul>
              <Link
                href="/register"
                className="block text-center font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-xl px-6 py-3 transition-colors"
              >
                Ücretsiz Başla
              </Link>
            </div>

            {/* Gold — Popular */}
            <div className="bg-white rounded-2xl p-8 border-2 border-blue-600 flex flex-col relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white text-xs font-semibold rounded-full px-3 py-1">
                  Popüler
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Gold</h3>
              <p className="text-sm text-slate-500 mt-1">Orta ölçekli siteler</p>
              <div className="mt-6 mb-8">
                <span className="text-4xl font-bold text-slate-900">₺399</span>
                <span className="text-slate-500 text-sm">/ay</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "500 daireye kadar",
                  "Tüm Silver özellikleri",
                  "Gelişmiş raporlama",
                  "Grafik ve analizler",
                  "Öncelikli destek",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block text-center font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-6 py-3 transition-colors shadow-lg shadow-blue-600/20"
              >
                Ücretsiz Başla
              </Link>
            </div>

            {/* Platinum */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 flex flex-col">
              <h3 className="text-lg font-semibold text-slate-900">Platinum</h3>
              <p className="text-sm text-slate-500 mt-1">Büyük siteler ve yönetim şirketleri</p>
              <div className="mt-6 mb-8">
                <span className="text-4xl font-bold text-slate-900">₺799</span>
                <span className="text-slate-500 text-sm">/ay</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "5000 daireye kadar",
                  "Tüm Gold özellikleri",
                  "API erişimi",
                  "Çoklu site yönetimi",
                  "7/24 telefon desteği",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block text-center font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-xl px-6 py-3 transition-colors"
              >
                Ücretsiz Başla
              </Link>
            </div>
          </div>

          <p className="text-center text-sm text-slate-400 mt-8">
            Tüm fiyatlara KDV dahildir. 3 ay ücretsiz deneme sonrası faturalandırma başlar.
          </p>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Sıkça Sorulan Sorular
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-slate-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-900 pr-4">{faq.q}</span>
                  <svg
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-20 px-6 bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Site yönetiminizi kolaylaştırmaya
            <br />
            bugün başlayın
          </h2>
          <p className="mt-4 text-slate-400 text-lg">
            3 ay ücretsiz deneyin. Kredi kartı gerekmez.
          </p>
          <Link
            href="/register"
            className="inline-block mt-8 font-medium text-slate-900 bg-white hover:bg-slate-100 rounded-xl px-8 py-3.5 text-base transition-colors"
          >
            Ücretsiz Hesap Oluştur
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-slate-200 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <span className="text-lg font-bold text-slate-900 tracking-tight">SiteTakip</span>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed max-w-sm">
                Site yöneticileri için modern aidat takip ve yönetim platformu.
                Aidatlarınızı kolayca yönetin, giderlerinizi takip edin.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Hızlı Linkler</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
                    Özellikler
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
                    Fiyatlandırma
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
                    SSS
                  </a>
                </li>
                <li>
                  <Link href="/login" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
                    Giriş Yap
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">İletişim</h4>
              <ul className="space-y-2">
                <li className="text-sm text-slate-500">info@site-takip.com</li>
                <li className="text-sm text-slate-500">İstanbul, Türkiye</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} SiteTakip. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
