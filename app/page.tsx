import Link from 'next/link';

const services = [
  { icon: '🏭', title: 'Warehousing & Inventory', desc: 'Secure storage with real-time inventory tracking and management systems.' },
  { icon: '📦', title: 'Order Fulfillment', desc: 'Automated picking, packing, and shipping to get products to customers fast.' },
  { icon: '🚚', title: 'Shipping & Delivery', desc: 'Nationwide reach with optimized last-mile delivery to every doorstep.' },
  { icon: '↩️', title: 'Returns Management', desc: 'Hassle-free returns processing to keep customers satisfied.' },
  { icon: '🛒', title: 'E-commerce Integration', desc: 'Seamless connection with online stores and marketplaces.' },
];

const industries = ['E-commerce', 'Retail & Wholesale', 'Health & Wellness', 'Consumer Electronics', 'Fashion & Apparel', 'Food & Beverage', 'Subscription Services'];

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* NAV */}
      <nav style={{ background: '#1a2456', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>
          <span>sak</span><span style={{ color: '#f97316' }}>zee</span>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem' }}>Home</Link>
          <Link href="/services" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem' }}>Services</Link>
          <Link href="/about" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem' }}>About</Link>
          <Link href="/book" style={{ background: '#f97316', color: 'white', padding: '0.5rem 1.25rem', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Book Now</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: '#1a2456', color: 'white', padding: '5rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: '0 0 1rem', lineHeight: 1.1 }}>
          Moving Dreams,<br /><span style={{ color: '#f97316' }}>Delivering Growth</span>
        </h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem', opacity: 0.9, lineHeight: 1.6 }}>
          Ghana&apos;s trusted fulfillment and logistics partner. We store, pack, ship — so you can focus on growing your business.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/book" style={{ background: '#f97316', color: 'white', padding: '0.85rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem' }}>
            Book a Service
          </Link>
          <a href="https://wa.me/233256089599?text=Hi%20Sakzee!%20I%20would%20like%20to%20know%20more%20about%20your%20services." target="_blank" rel="noopener noreferrer"
            style={{ background: '#25D366', color: 'white', padding: '0.85rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.529 5.845L.057 23.535a.75.75 0 00.908.908l5.69-1.472A11.932 11.932 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.712 9.712 0 01-4.953-1.355l-.355-.212-3.68.952.972-3.558-.232-.368A9.712 9.712 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" /></svg>
            Chat on WhatsApp
          </a>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ background: '#f97316', padding: '2rem', display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
        {[['Fast Delivery', 'Nationwide'], ['Real-Time', 'Tracking'], ['Flexible', 'Pricing'], ['All Industries', 'Served']].map(([a, b]) => (
          <div key={a} style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{a}</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>{b}</div>
          </div>
        ))}
      </section>

      {/* SERVICES */}
      <section style={{ padding: '4rem 2rem', background: '#f8f9ff', textAlign: 'center' }}>
        <h2 style={{ color: '#1a2456', fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Our Core Services</h2>
        <p style={{ color: '#666', marginBottom: '3rem' }}>Everything your business needs to scale without limits</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
          {services.map(s => (
            <div key={s.title} style={{ background: 'white', borderRadius: '12px', padding: '1.75rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #eee', textAlign: 'left' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{s.icon}</div>
              <h3 style={{ color: '#1a2456', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{s.title}</h3>
              <p style={{ color: '#666', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* INDUSTRIES */}
      <section style={{ padding: '4rem 2rem', background: '#1a2456', textAlign: 'center' }}>
        <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Industries We Serve</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2.5rem' }}>From market stalls to warehouses — we serve all</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', maxWidth: '700px', margin: '0 auto' }}>
          {industries.map(i => (
            <span key={i} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.6rem 1.25rem', borderRadius: '30px', fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.2)' }}>{i}</span>
          ))}
        </div>
      </section>

      {/* CONTACT STRIP */}
      <section style={{ background: '#f8f9ff', padding: '2.5rem 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem' }}>
          <a href="tel:+233256089599" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white', padding: '1rem 1.5rem', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #eee', color: '#1a2456', fontWeight: 600 }}>
            <span style={{ fontSize: '1.5rem' }}>📞</span>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 400 }}>Call us</div>
              <div>0256 089 599</div>
            </div>
          </a>
          <a href="tel:+233256089598" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white', padding: '1rem 1.5rem', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #eee', color: '#1a2456', fontWeight: 600 }}>
            <span style={{ fontSize: '1.5rem' }}>📞</span>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 400 }}>Call us</div>
              <div>0256 089 598</div>
            </div>
          </a>
          <a href="mailto:Sakzee373@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white', padding: '1rem 1.5rem', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #eee', color: '#1a2456', fontWeight: 600 }}>
            <span style={{ fontSize: '1.5rem' }}>✉️</span>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 400 }}>Email us</div>
              <div>Sakzee373@gmail.com</div>
            </div>
          </a>
          <a href="https://wa.me/233256089599?text=Hi%20Sakzee!%20I%20would%20like%20to%20know%20more%20about%20your%20services." target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#25D366', padding: '1rem 1.5rem', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', color: 'white', fontWeight: 600 }}>
            <span style={{ fontSize: '1.5rem' }}>💬</span>
            <div>
              <div style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 400 }}>WhatsApp</div>
              <div>Chat with us</div>
            </div>
          </a>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '4rem 2rem', textAlign: 'center', background: 'white' }}>
        <h2 style={{ color: '#1a2456', fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Ready to Scale Your Business?</h2>
        <p style={{ color: '#666', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>Book a service today and let Sakzee handle your logistics while you focus on growth.</p>
        <Link href="/book" style={{ background: '#f97316', color: 'white', padding: '1rem 2.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '1.1rem' }}>
          Get Started — Book Now
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#111827', color: 'white', padding: '2.5rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          <span>sak</span><span style={{ color: '#f97316' }}>zee</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', margin: '0 0 1rem' }}>Moving Dreams, Delivering Growth</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <a href="tel:+233256089599" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.85rem' }}>📞 0256 089 599</a>
          <a href="tel:+233256089598" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.85rem' }}>📞 0256 089 598</a>
          <a href="mailto:Sakzee373@gmail.com" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.85rem' }}>✉️ Sakzee373@gmail.com</a>
          <a href="https://wa.me/233256089599" target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', textDecoration: 'none', fontSize: '0.85rem' }}>💬 WhatsApp</a>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>📍 Ubuntu Court Estate, Oyarifa, Accra, Ghana</p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '0.75rem' }}>© 2025 Sakzee Company Limited. All rights reserved.</p>
      </footer>

      {/* FLOATING WHATSAPP BUTTON */}
      <a
        href="https://wa.me/233256089599?text=Hi%20Sakzee!%20I%20would%20like%20to%20know%20more%20about%20your%20services."
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 999,
          background: '#25D366', color: 'white', borderRadius: '50px',
          padding: '0.85rem 1.25rem', textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          fontWeight: 700, fontSize: '0.95rem',
          boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.529 5.845L.057 23.535a.75.75 0 00.908.908l5.69-1.472A11.932 11.932 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.712 9.712 0 01-4.953-1.355l-.355-.212-3.68.952.972-3.558-.232-.368A9.712 9.712 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
        </svg>
        Chat with us
      </a>

    </main>
  );
}
