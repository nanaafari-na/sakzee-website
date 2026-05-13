'use client';
import Link from 'next/link';
import { useState } from 'react';

const SERVICES = [
  { icon: '🏭', title: 'Warehousing & Inventory', desc: 'Secure storage with real-time tracking and daily inventory counts.' },
  { icon: '📦', title: 'Order Fulfillment & Returns', desc: 'Pick, pack, ship and handle returns — automated and fast.' },
  { icon: '🚚', title: 'Shipping & Delivery', desc: 'Nationwide last-mile delivery from Accra to every region.' },
  { icon: '🛒', title: 'E-commerce Integration', desc: 'Connect Shopify, WooCommerce and more directly to our system.' },
];

const INDUSTRIES = [
  'E-commerce', 'Fashion & Apparel',
  'Consumer Electronics', 'Health & Wellness',
  'Food & Beverage', 'Retail & Wholesale',
  'Subscription Services', 'Agriculture & Agribusiness',
];

const WHY = [
  { icon: '✅', title: 'Reliability You Can Trust', desc: 'Consistent, on-time fulfillment every single order.' },
  { icon: '🔄', title: 'Flexible Solutions', desc: 'Scale up or down — no long-term contracts required.' },
  { icon: '🌍', title: 'Nationwide Reach', desc: 'From Accra to every region across Ghana.' },
  { icon: '💰', title: 'Transparent Pricing', desc: 'No hidden fees. Pay only for what you use.' },
  { icon: '👥', title: 'People-First Service', desc: 'Real humans available via phone and WhatsApp.' },
  { icon: '⚡', title: 'Fast Turnaround', desc: 'Same-day processing and dispatch for Accra orders.' },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: '100vh', background: 'white' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .nav-link { color: rgba(255,255,255,0.8); text-decoration: none; font-size: 0.9rem; }
        .nav-link:hover { color: white; }
        /* Desktop: show all CTA buttons */
        .hero-cta-desktop { display: flex; }
        .hero-cta-mobile { display: none; }
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
          .hero-title { font-size: 2rem !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .services-grid { grid-template-columns: 1fr !important; }
          .industries-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .why-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .contact-strip { flex-direction: column !important; gap: 0.75rem !important; text-align: center; }
          .footer-grid { flex-direction: column !important; gap: 1.5rem !important; }
          .footer-links { flex-direction: column !important; gap: 1.5rem !important; }
          /* Mobile: swap hero buttons */
          .hero-cta-desktop { display: none !important; }
          .hero-cta-mobile { display: flex !important; flex-direction: column; align-items: stretch; gap: 0.75rem; }
          .delivery-banner { display: block !important; }
        }
        @media (max-width: 380px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .industries-grid { grid-template-columns: 1fr !important; }
          .why-grid { grid-template-columns: 1fr !important; }
        }
        .delivery-banner { display: none; }
      `}</style>

      {/* NAV */}
      <nav style={{ background: '#1a2456', padding: '0.9rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.4rem', fontWeight: 800 }}>
          sak<span style={{ color: '#f97316' }}>zee</span>
        </Link>
        <div className="desktop-nav" style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
          <Link href="/services" className="nav-link">Services</Link>
          <Link href="/pricing" className="nav-link">Pricing</Link>
          <Link href="/about" className="nav-link">About</Link>
          <Link href="/track" className="nav-link">Track</Link>
          <Link href="/book/delivery" style={{ background: '#f97316', color: 'white', padding: '0.5rem 1.25rem', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700 }}>
            🚚 Book Delivery
          </Link>
        </div>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', flexDirection: 'column', gap: '5px', padding: '4px' }}>
          {[0, 1, 2].map(i => <span key={i} style={{ display: 'block', width: '22px', height: '2px', background: 'white', borderRadius: '2px' }} />)}
        </button>
      </nav>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div style={{ background: '#1a2456', padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {[['/', 'Home'], ['/services', 'Services'], ['/pricing', 'Pricing'], ['/about', 'About'], ['/track', 'Track Order']].map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}>{label}</Link>
          ))}
          <Link href="/book/delivery" onClick={() => setMenuOpen(false)} style={{ background: '#f97316', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, textAlign: 'center', marginTop: '0.25rem' }}>
            🚚 Book a Delivery
          </Link>
          <Link href="/vendor/login" onClick={() => setMenuOpen(false)} style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.85rem', textAlign: 'center' }}>Vendor Login</Link>
        </div>
      )}

      {/* HERO */}
      <section style={{ background: '#1a2456', padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '30px', padding: '0.32rem 0.9rem', fontSize: '0.78rem', fontWeight: 600, color: '#fba366', marginBottom: '1.25rem' }}>
            Ghana's Fulfillment Partner
          </div>
          <h1 className="hero-title" style={{ color: 'white', fontSize: '3rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem' }}>
            Moving Dreams,<br /><span style={{ color: '#f97316' }}>Delivering Growth</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.02rem', lineHeight: 1.75, marginBottom: '2rem', maxWidth: '520px', margin: '0 auto 2rem' }}>
            From storage to delivery — we give businesses of all sizes the space, systems and support to scale freely across Ghana.
          </p>

          {/* DESKTOP CTAs */}
          <div className="hero-cta-desktop" style={{ gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/book/delivery" style={{ background: '#f97316', color: 'white', padding: '0.9rem 2.25rem', borderRadius: '9px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              🚚 Book a Delivery
            </Link>
            <Link href="/book" style={{ background: 'transparent', color: 'white', padding: '0.9rem 2.25rem', borderRadius: '9px', textDecoration: 'none', fontWeight: 600, fontSize: '1rem', border: '2px solid rgba(255,255,255,0.35)', display: 'inline-block', textAlign: 'center' }}>
              Other Services
            </Link>
            <Link href="/vendor/register" style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)', padding: '0.9rem 2.25rem', borderRadius: '9px', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem', border: '1px solid rgba(255,255,255,0.2)', display: 'inline-block', textAlign: 'center' }}>
              Become a Vendor
            </Link>
          </div>

          {/* MOBILE CTAs */}
          <div className="hero-cta-mobile" style={{ gap: '0.75rem', maxWidth: '360px', margin: '0 auto' }}>
            <Link href="/book/delivery" style={{ background: '#f97316', color: 'white', padding: '1rem', borderRadius: '9px', textDecoration: 'none', fontWeight: 700, fontSize: '1.05rem', textAlign: 'center', display: 'block' }}>
              🚚 Book a Delivery Now
            </Link>
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <Link href="/book" style={{ flex: 1, background: 'transparent', color: 'white', padding: '0.8rem', borderRadius: '9px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', border: '2px solid rgba(255,255,255,0.35)', textAlign: 'center', display: 'block' }}>Other Services</Link>
              <Link href="/vendor/register" style={{ flex: 1, background: 'transparent', color: 'rgba(255,255,255,0.75)', padding: '0.8rem', borderRadius: '9px', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center', display: 'block' }}>Be a Vendor</Link>
            </div>
          </div>
        </div>
      </section>

      {/* DELIVERY HIGHLIGHT BANNER */}
      <section style={{ background: '#f97316', padding: '1.5rem 1.5rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.75rem' }}>🚚</span>
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: '1rem' }}>Same-day delivery across Accra</div>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem' }}>From GHS 45 · Pay now · Instant confirmation</div>
            </div>
          </div>
          <Link href="/book/delivery" style={{ background: 'white', color: '#f97316', padding: '0.7rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 800, fontSize: '0.9rem', whiteSpace: 'nowrap' as const }}>
            Book Now →
          </Link>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: '#1a2456', padding: '2.5rem 1.5rem' }}>
        <div className="stats-grid" style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
          {[['Same Day', 'Accra Delivery'], ['Nationwide', 'Coverage'], ['Real-time', 'Tracking'], ['Instant', 'Confirmation']].map(([val, label]) => (
            <div key={label}>
              <div style={{ color: 'white', fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.1 }}>{val}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', marginTop: '0.25rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES — 2x2 */}
      <section style={{ padding: 'clamp(3rem, 5vw, 4.5rem) 1.5rem', background: '#f8f9ff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ color: '#1a2456', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Our Services</h2>
            <p style={{ color: '#6b7280', fontSize: '0.92rem', maxWidth: '420px', margin: '0 auto' }}>Everything your business needs under one roof</p>
          </div>
          <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
            {SERVICES.map(s => (
              <div key={s.title} style={{ background: 'white', borderRadius: '14px', padding: '1.75rem', border: '1px solid #efefef', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '2.25rem', marginBottom: '0.85rem' }}>{s.icon}</div>
                <h3 style={{ color: '#1a2456', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.5rem' }}>{s.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link href="/services" style={{ background: '#1a2456', color: 'white', padding: '0.85rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.92rem', display: 'inline-block' }}>View All Services →</Link>
          </div>
        </div>
      </section>

      {/* INDUSTRIES — 2x4 */}
      <section style={{ padding: 'clamp(3rem, 5vw, 4.5rem) 1.5rem', background: 'white' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: '#1a2456', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Industries We Serve</h2>
          <p style={{ color: '#6b7280', fontSize: '0.92rem', marginBottom: '2.5rem' }}>Built for every type of business</p>
          <div className="industries-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem' }}>
            {INDUSTRIES.map(ind => (
              <div key={ind} style={{ background: '#1a2456', borderRadius: '10px', padding: '1rem 0.75rem', color: 'white', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.4 }}>
                {ind}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY SAKZEE — 2x3 */}
      <section style={{ padding: 'clamp(3rem, 5vw, 4.5rem) 1.5rem', background: '#f8f9ff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: '#1a2456', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Why Choose Sakzee</h2>
          <p style={{ color: '#6b7280', fontSize: '0.92rem', marginBottom: '2.5rem' }}>More than logistics — a growth partner</p>
          <div className="why-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {WHY.map(item => (
              <div key={item.title} style={{ background: 'white', borderRadius: '12px', padding: '1.4rem', border: '1px solid #efefef', textAlign: 'left' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                <div style={{ fontWeight: 700, color: '#1a2456', fontSize: '0.9rem', marginBottom: '0.35rem' }}>{item.title}</div>
                <div style={{ color: '#6b7280', fontSize: '0.82rem', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#1a2456', padding: 'clamp(3rem, 5vw, 4rem) 1.5rem', textAlign: 'center' }}>
        <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: 800, marginBottom: '0.85rem' }}>Ready to move with Sakzee?</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', marginBottom: '2rem', maxWidth: '440px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
          Book a delivery now or register as a vendor to access our full fulfillment platform.
        </p>
        <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/book/delivery" style={{ background: '#f97316', color: 'white', padding: '0.9rem 2.25rem', borderRadius: '9px', textDecoration: 'none', fontWeight: 700, fontSize: '0.97rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            🚚 Book a Delivery
          </Link>
          <Link href="/vendor/register" style={{ background: 'transparent', color: 'white', padding: '0.9rem 2.25rem', borderRadius: '9px', textDecoration: 'none', fontWeight: 600, fontSize: '0.97rem', border: '2px solid rgba(255,255,255,0.35)', display: 'inline-block', textAlign: 'center' }}>
            Become a Vendor
          </Link>
        </div>
      </section>

      {/* CONTACT STRIP */}
      <section style={{ background: '#f97316', padding: '1.25rem 1.5rem' }}>
        <div className="contact-strip" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          {[{ href: 'tel:+233256089599', label: '📞 0256 089 599' }, { href: 'tel:+233256089598', label: '📞 0256 089 598' }, { href: 'mailto:info@sakzee.com', label: '✉️ info@sakzee.com' }, { href: '#', label: '📍 Oyarifa, Accra' }].map(c => (
            <a key={c.label} href={c.href} style={{ color: 'white', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>{c.label}</a>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0d1530', color: 'white', padding: '2.5rem 1.5rem 2rem' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div className="footer-grid" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', marginBottom: '1.75rem' }}>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem' }}>sak<span style={{ color: '#f97316' }}>zee</span></div>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.8rem', maxWidth: '200px', lineHeight: 1.65 }}>Moving Dreams, Delivering Growth.</p>
            </div>
            <div className="footer-links" style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '0.7rem' }}>Pages</div>
                {[['/', 'Home'], ['/services', 'Services'], ['/pricing', 'Pricing'], ['/about', 'About'], ['/book/delivery', 'Book a Delivery'], ['/book', 'Other Services'], ['/vendor/register', 'Become a Vendor']].map(([href, label]) => (
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
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.2rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.76rem' }}>© 2025 Sakzee Company Limited. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* FLOATING WHATSAPP */}
      <a href="https://wa.me/233256089599?text=Hi%20Sakzee!%20I%20would%20like%20to%20book%20a%20delivery." target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: '1.75rem', right: '1.75rem', zIndex: 999, background: '#25D366', color: 'white', borderRadius: '50px', padding: '0.8rem 1.3rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.55rem', fontWeight: 700, fontSize: '0.88rem', boxShadow: '0 4px 20px rgba(37,211,102,0.35)' }}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.529 5.845L.057 23.535a.75.75 0 00.908.908l5.69-1.472A11.932 11.932 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.712 9.712 0 01-4.953-1.355l-.355-.212-3.68.952.972-3.558-.232-.368A9.712 9.712 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
        </svg>
        Chat with us
      </a>
    </main>
  );
}