import Link from 'next/link';

const whatsappUrl = "https://wa.me/233256089599?text=Hi%20Sakzee!%20I%20would%20like%20to%20know%20more%20about%20your%20services.";

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.529 5.845L.057 23.535a.75.75 0 00.908.908l5.69-1.472A11.932 11.932 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.712 9.712 0 01-4.953-1.355l-.355-.212-3.68.952.972-3.558-.232-.368A9.712 9.712 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
    </svg>
  );
}

const services = [
  {
    title: 'Warehousing & Inventory',
    desc: 'Secure storage with real-time inventory tracking and management.',
    art: (
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <rect width="44" height="44" rx="12" fill="#f0f3ff" />
        <path d="M7 19L22 11L37 19V35H7V19Z" fill="white" stroke="#1a2456" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7 19L22 11L37 19" stroke="#f97316" strokeWidth="2" strokeLinejoin="round" />
        <rect x="16" y="26" width="12" height="9" rx="1.5" fill="#f97316" fillOpacity="0.15" stroke="#1a2456" strokeWidth="1.3" />
        <path d="M22 26V35" stroke="#1a2456" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
        <circle cx="33" cy="15" r="4" fill="#f97316" />
        <path d="M31.5 15L33 16.5L35 14" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Order Fulfillment',
    desc: 'Automated picking, packing and shipping — fast and accurate.',
    art: (
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <rect width="44" height="44" rx="12" fill="#fff3e8" />
        <rect x="9" y="11" width="20" height="22" rx="2.5" fill="white" stroke="#1a2456" strokeWidth="1.5" />
        <path d="M13 17H25M13 21H25M13 25H20" stroke="#1a2456" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="33" cy="30" r="6" fill="#f97316" />
        <path d="M30.5 30L32.2 31.8L35.5 28.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M29 13L33 9L37 13" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M33 9V19" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Shipping & Delivery',
    desc: 'Nationwide last-mile delivery tracked from shelf to doorstep.',
    art: (
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <rect width="44" height="44" rx="12" fill="#f0f3ff" />
        <rect x="5" y="15" width="22" height="15" rx="2.5" fill="white" stroke="#1a2456" strokeWidth="1.5" />
        <path d="M27 19H36L40 27V30H27V19Z" fill="#f97316" fillOpacity="0.12" stroke="#1a2456" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="12" cy="32" r="3.5" fill="white" stroke="#1a2456" strokeWidth="1.5" />
        <circle cx="12" cy="32" r="1.2" fill="#f97316" />
        <circle cx="32" cy="32" r="3.5" fill="white" stroke="#1a2456" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="1.2" fill="#f97316" />
        <path d="M9 21H20" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Returns Management',
    desc: 'Hassle-free returns that keep your customers satisfied.',
    art: (
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <rect width="44" height="44" rx="12" fill="#fff3e8" />
        <path d="M22 8C14.82 8 9 13.82 9 21" stroke="#1a2456" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 21L6 18M9 21L12 18" stroke="#1a2456" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 36C29.18 36 35 30.18 35 23" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M35 23L38 26M35 23L32 26" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="16" y="17" width="12" height="12" rx="2.5" fill="white" stroke="#1a2456" strokeWidth="1.5" />
        <path d="M19 23L21 25L25 21" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'E-commerce Integration',
    desc: 'Connect your Shopify, WooCommerce or Instagram shop.',
    art: (
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <rect width="44" height="44" rx="12" fill="#f0f3ff" />
        <rect x="7" y="11" width="30" height="22" rx="3.5" fill="white" stroke="#1a2456" strokeWidth="1.5" />
        <path d="M7 17H37" stroke="#1a2456" strokeWidth="1.3" />
        <circle cx="12" cy="14" r="1.5" fill="#f97316" />
        <circle cx="17" cy="14" r="1.5" fill="#1a2456" fillOpacity="0.25" />
        <circle cx="22" cy="14" r="1.5" fill="#1a2456" fillOpacity="0.25" />
        <path d="M14 27L18 23L22 26L26 21L30 24" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="30" cy="24" r="2.5" fill="#f97316" />
      </svg>
    ),
  },
];

const industries = ['E-commerce', 'Retail & Wholesale', 'Health & Wellness', 'Consumer Electronics', 'Fashion & Apparel', 'Food & Beverage', 'Subscription Services'];
const stats = [{ num: '16+', label: 'Regions covered' }, { num: 'Same day', label: 'Processing' }, { num: 'Real-time', label: 'Tracking' }, { num: '5 star', label: 'Service' }];

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif", background: 'white' }}>
      <style>{`
        * { box-sizing: border-box; }
        .nav-link { color: rgba(255,255,255,0.8); text-decoration: none; font-size: 0.9rem; transition: opacity 0.15s; }
        .nav-link:hover { opacity: 0.6; }
        .scard { transition: transform 0.18s, box-shadow 0.18s; }
        .scard:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(26,36,86,0.1) !important; }
        .cc { transition: transform 0.15s; text-decoration: none; }
        .cc:hover { transform: translateY(-2px); }
        .waf { transition: transform 0.15s; }
        .waf:hover { transform: scale(1.06); }
      `}</style>

      {/* NAV */}
      <nav style={{ background: '#1a2456', padding: '0.9rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>sak<span style={{ color: '#f97316' }}>zee</span></div>
        <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/services" className="nav-link">Services</Link>
          <Link href="/about" className="nav-link">About</Link>
          <Link href="/book" style={{ background: '#f97316', color: 'white', padding: '0.5rem 1.25rem', borderRadius: '7px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700 }}>Book Now</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: '#1a2456', padding: '5rem 2rem 4.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <svg style={{ position: 'absolute', right: '-40px', top: '-40px', opacity: 0.055, pointerEvents: 'none' }} width="360" height="360" viewBox="0 0 360 360" fill="none">
          <circle cx="180" cy="180" r="160" stroke="white" strokeWidth="1.5" />
          <circle cx="180" cy="180" r="110" stroke="white" strokeWidth="1" />
          <circle cx="180" cy="180" r="62" stroke="white" strokeWidth="0.8" />
          <line x1="20" y1="180" x2="340" y2="180" stroke="white" strokeWidth="0.6" />
          <line x1="180" y1="20" x2="180" y2="340" stroke="white" strokeWidth="0.6" />
          <line x1="67" y1="67" x2="293" y2="293" stroke="white" strokeWidth="0.6" />
          <line x1="293" y1="67" x2="67" y2="293" stroke="white" strokeWidth="0.6" />
        </svg>
        <svg style={{ position: 'absolute', left: '-50px', bottom: '-20px', opacity: 0.04, pointerEvents: 'none' }} width="260" height="260" viewBox="0 0 260 260" fill="none">
          <rect x="15" y="15" width="230" height="230" rx="38" stroke="white" strokeWidth="1.5" />
          <rect x="48" y="48" width="164" height="164" rx="24" stroke="white" strokeWidth="1" />
          <rect x="80" y="80" width="100" height="100" rx="14" stroke="white" strokeWidth="0.8" />
        </svg>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(249,115,22,0.14)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: '30px', padding: '0.32rem 0.85rem', fontSize: '0.77rem', fontWeight: 600, color: '#fba366', marginBottom: '1.4rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f97316', display: 'inline-block' }} />
            Ghana&apos;s Trusted Logistics Partner
          </div>
          <h1 style={{ color: 'white', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, margin: '0 0 1rem', lineHeight: 1.1 }}>
            Moving Dreams,<br /><span style={{ color: '#f97316' }}>Delivering Growth</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.02rem', maxWidth: '520px', margin: '0 auto 2.25rem', lineHeight: 1.7 }}>
            From storage to doorstep — we handle your logistics so you can focus on growing your business across Ghana and beyond.
          </p>
          <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/book" style={{ background: '#f97316', color: 'white', padding: '0.85rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              Book a Service
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ background: '#25D366', color: 'white', padding: '0.85rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <WhatsAppIcon size={18} /> Chat on WhatsApp
            </a>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginTop: '3.5rem', borderTop: '1px solid rgba(255,255,255,0.09)', paddingTop: '2rem' }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{ flex: '1', minWidth: '120px', padding: '0 1rem', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.09)' : 'none', textAlign: 'center' }}>
                <div style={{ color: '#f97316', fontWeight: 800, fontSize: '1.25rem' }}>{s.num}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.76rem', marginTop: '0.2rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section style={{ padding: '4.5rem 2rem', background: '#f8f9ff' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-block', background: '#fff3e8', color: '#f97316', padding: '0.28rem 0.85rem', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.7rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>What We Do</div>
            <h2 style={{ color: '#1a2456', fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.55rem' }}>Our Core Services</h2>
            <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto', lineHeight: 1.65, fontSize: '0.92rem' }}>Everything your business needs to scale — under one roof</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))', gap: '1.15rem' }}>
            {services.map(s => (
              <div key={s.title} className="scard" style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.045)', border: '1px solid #efefef' }}>
                <div style={{ marginBottom: '1rem' }}>{s.art}</div>
                <h3 style={{ color: '#1a2456', fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.4rem', lineHeight: 1.3 }}>{s.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.8rem', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
            <Link href="/services" style={{ color: '#f97316', fontWeight: 700, textDecoration: 'none', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              View pricing & full details
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* WHY SAKZEE */}
      <section style={{ padding: '4.5rem 2rem', background: '#1a2456' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(249,115,22,0.14)', color: '#fba366', padding: '0.28rem 0.85rem', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.9rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Why Choose Us</div>
            <h2 style={{ color: 'white', fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.9rem', lineHeight: 1.15 }}>Built for Ghanaian businesses</h2>
            <p style={{ color: 'rgba(255,255,255,0.58)', lineHeight: 1.75, marginBottom: '1.6rem', fontSize: '0.92rem' }}>We understand the challenges of running a business in Ghana — from space constraints to unreliable delivery. Sakzee was built to solve exactly these problems.</p>
            <Link href="/about" style={{ color: '#f97316', fontWeight: 700, textDecoration: 'none', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              Read our story <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { title: 'Reliability you can trust', desc: 'Consistent service your business depends on every day.' },
              { title: 'Flexible & scalable', desc: 'Ship 10 or 10,000 orders — we grow as your business grows.' },
              { title: 'Transparent pricing', desc: 'No hidden fees. You know exactly what you pay for.' },
              { title: 'Nationwide coverage', desc: 'All 16 regions of Ghana with global ambitions.' },
            ].map(item => (
              <div key={item.title} style={{ display: 'flex', gap: '0.8rem', padding: '0.95rem 1.1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)', alignItems: 'flex-start' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f97316', marginTop: '5px', flexShrink: 0 }} />
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.18rem' }}>{item.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.48)', fontSize: '0.8rem', lineHeight: 1.55 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section style={{ padding: '4.5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '840px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: '#fff3e8', color: '#f97316', padding: '0.28rem 0.85rem', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 700, marginBottom: '0.7rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Industries</div>
          <h2 style={{ color: '#1a2456', fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.55rem' }}>We Serve All Industries</h2>
          <p style={{ color: '#6b7280', marginBottom: '2.25rem', lineHeight: 1.65, fontSize: '0.92rem' }}>From market stalls to large warehouses — if you sell, we deliver</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', justifyContent: 'center' }}>
            {industries.map(ind => (
              <span key={ind} style={{ background: '#f8f9ff', border: '1.5px solid #e5e7eb', borderRadius: '30px', padding: '0.5rem 1rem', color: '#1a2456', fontSize: '0.85rem', fontWeight: 600 }}>{ind}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section style={{ padding: '4rem 2rem', background: '#f8f9ff' }}>
        <div style={{ maxWidth: '840px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: '#1a2456', fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.45rem' }}>Get in Touch</h2>
          <p style={{ color: '#6b7280', marginBottom: '2.1rem', fontSize: '0.92rem' }}>We are always ready to help your business grow</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { href: 'tel:+233256089599', label: '0256 089 599', sub: 'Call us', ibg: '#f0f3ff', ic: '#1a2456', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" /></svg> },
              { href: 'tel:+233256089598', label: '0256 089 598', sub: 'Call us', ibg: '#f0f3ff', ic: '#1a2456', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" /></svg> },
              { href: 'mailto:info@sakzee.com', label: 'info@sakzee.com', sub: 'Email us', ibg: '#fff3e8', ic: '#f97316', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg> },
            ].map(c => (
              <a key={c.href} href={c.href} className="cc" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white', padding: '0.85rem 1.2rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1.5px solid #e5e7eb', color: '#1a2456', fontWeight: 600 }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: c.ibg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.ic, flexShrink: 0 }}>{c.icon}</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 500 }}>{c.sub}</div>
                  <div style={{ fontSize: '0.86rem' }}>{c.label}</div>
                </div>
              </a>
            ))}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="cc" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#25D366', padding: '0.85rem 1.2rem', borderRadius: '12px', color: 'white', fontWeight: 600 }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><WhatsAppIcon size={19} /></div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.68rem', opacity: 0.75, fontWeight: 500 }}>WhatsApp</div>
                <div style={{ fontSize: '0.86rem' }}>Chat with us</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '4.5rem 2rem', background: '#f97316', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <svg style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.07, pointerEvents: 'none' }} width="220" height="220" viewBox="0 0 220 220" fill="none">
          <circle cx="110" cy="110" r="100" stroke="white" strokeWidth="1.5" />
          <circle cx="110" cy="110" r="65" stroke="white" strokeWidth="1" />
          <circle cx="110" cy="110" r="32" stroke="white" strokeWidth="0.8" />
        </svg>
        <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: 800, margin: '0 0 0.8rem' }}>Ready to Scale Your Business?</h2>
        <p style={{ color: 'rgba(255,255,255,0.82)', marginBottom: '2.25rem', fontSize: '0.97rem', maxWidth: '420px', margin: '0 auto 2.25rem', lineHeight: 1.65 }}>
          Join businesses across Ghana who trust Sakzee to handle their logistics.
        </p>
        <Link href="/book" style={{ background: 'white', color: '#f97316', padding: '0.9rem 2.5rem', borderRadius: '9px', textDecoration: 'none', fontWeight: 800, fontSize: '0.97rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          Book a Service Today
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0d1530', color: 'white', padding: '2.75rem 2rem 2rem' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem' }}>sak<span style={{ color: '#f97316' }}>zee</span></div>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.8rem', maxWidth: '200px', lineHeight: 1.65, margin: 0 }}>Moving Dreams, Delivering Growth. Ghana&apos;s trusted fulfillment partner.</p>
            </div>
            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '0.7rem' }}>Pages</div>
                {[['/', 'Home'], ['/about', 'About'], ['/services', 'Services'], ['/book', 'Book Now']].map(([href, label]) => (
                  <div key={href} style={{ marginBottom: '0.42rem' }}>
                    <Link href={href} style={{ color: 'rgba(255,255,255,0.48)', textDecoration: 'none', fontSize: '0.83rem' }}>{label}</Link>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '0.7rem' }}>Contact</div>
                {[{ href: 'tel:+233256089599', label: '0256 089 599' }, { href: 'tel:+233256089598', label: '0256 089 598' }, { href: 'mailto:info@sakzee.com', label: 'info@sakzee.com' }].map(c => (
                  <div key={c.href} style={{ marginBottom: '0.42rem' }}>
                    <a href={c.href} style={{ color: 'rgba(255,255,255,0.48)', textDecoration: 'none', fontSize: '0.83rem' }}>{c.label}</a>
                  </div>
                ))}
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem', marginTop: '0.2rem' }}>Ubuntu Court Estate, Oyarifa, Accra</div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.76rem', margin: 0 }}>© 2025 Sakzee Company Limited. All rights reserved.</p>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <WhatsAppIcon size={14} /> WhatsApp us
            </a>
          </div>
        </div>
      </footer>

      {/* FLOATING WHATSAPP */}
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="waf"
        style={{ position: 'fixed', bottom: '1.75rem', right: '1.75rem', zIndex: 999, background: '#25D366', color: 'white', borderRadius: '50px', padding: '0.8rem 1.3rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.55rem', fontWeight: 700, fontSize: '0.88rem', boxShadow: '0 4px 20px rgba(37,211,102,0.35)' }}>
        <WhatsAppIcon size={19} /> Chat with us
      </a>
    </main>
  );
}
