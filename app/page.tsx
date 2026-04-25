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
          <Link href="/about" style={{ background: 'transparent', color: 'white', padding: '0.85rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '1rem', border: '2px solid rgba(255,255,255,0.4)' }}>
            Learn More
          </Link>
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

      {/* CTA */}
      <section style={{ padding: '4rem 2rem', textAlign: 'center', background: 'white' }}>
        <h2 style={{ color: '#1a2456', fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Ready to Scale Your Business?</h2>
        <p style={{ color: '#666', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>Book a service today and let Sakzee handle your logistics while you focus on growth.</p>
        <Link href="/book" style={{ background: '#f97316', color: 'white', padding: '1rem 2.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '1.1rem' }}>
          Get Started — Book Now
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#111827', color: 'white', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          <span>sak</span><span style={{ color: '#f97316' }}>zee</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', margin: '0 0 0.5rem' }}>Moving Dreams, Delivering Growth</p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
          📍 Ubuntu Court Estate, Oyarifa, Accra, Ghana &nbsp;|&nbsp; 📞 0256089599 / 0256089598 &nbsp;|&nbsp; ✉️ Sakzee373@gmail.com
        </p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '1rem' }}>© 2025 Sakzee Company Limited. All rights reserved.</p>
      </footer>

    </main>
  );
}