export default function MaintenancePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Nunito', sans-serif;
          background: #07111F;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .page {
          position: relative;
          min-height: 100dvh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          text-align: center;
        }

        .noise {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 128px 128px;
          z-index: 0;
        }

        .glow {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(30,111,168,0.14) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .glow-green {
          position: fixed;
          bottom: -100px;
          right: -100px;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(111,191,26,0.07) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .content {
          position: relative;
          z-index: 1;
          max-width: 440px;
          width: 100%;
          margin: 0 auto;
        }

        .logo {
          font-family: 'Nunito', sans-serif;
          font-weight: 900;
          font-size: 1.35rem;
          letter-spacing: -0.02em;
          margin-bottom: 36px;
        }
        .logo-blue  { color: #1E6FA8; }
        .logo-green { color: #6FBF1A; }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(30,111,168,0.12);
          border: 1px solid rgba(30,111,168,0.25);
          border-radius: 999px;
          padding: 6px 14px;
          margin-bottom: 28px;
        }
        .badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #6FBF1A;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        .badge-text {
          color: #A9D6F2;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.8); }
        }

        h1 {
          font-family: 'Nunito', sans-serif;
          font-weight: 900;
          font-size: clamp(2rem, 6vw, 2.8rem);
          color: #FFFFFF;
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin-bottom: 14px;
        }

        .sub {
          color: #8AABBF;
          font-size: 0.93rem;
          font-weight: 400;
          line-height: 1.65;
          margin-bottom: 6px;
        }
        .location {
          color: #4A6785;
          font-size: 0.78rem;
          font-weight: 600;
          margin-bottom: 32px;
          letter-spacing: 0.04em;
        }

        .divider {
          width: 80px;
          height: 1px;
          background: linear-gradient(to right, transparent, #1E6FA8, transparent);
          margin: 0 auto 32px;
        }

        .cards {
          display: flex;
          gap: 10px;
          margin-bottom: 32px;
          justify-content: center;
        }
        .card {
          flex: 1;
          max-width: 130px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 14px 10px;
          text-align: center;
        }
        .card-icon {
          font-size: 1.3rem;
          margin-bottom: 6px;
        }
        .card-label {
          color: #4A6785;
          font-size: 0.6rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 3px;
        }
        .card-value {
          color: #A9D6F2;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .wa-prompt {
          color: #4A6785;
          font-size: 0.78rem;
          font-weight: 400;
          margin-bottom: 14px;
        }

        .wa-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #25D366;
          color: #FFFFFF;
          font-family: 'Nunito', sans-serif;
          font-weight: 800;
          font-size: 0.9rem;
          padding: 13px 28px;
          border-radius: 999px;
          text-decoration: none;
          transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 20px rgba(37,211,102,0.25);
          margin-bottom: 36px;
        }
        .wa-btn:hover {
          background: #1ebe5a;
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(37,211,102,0.35);
        }
        .wa-btn:active { transform: scale(0.97); }

        .wa-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .progress-wrap {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border-radius: 999px;
          height: 3px;
          overflow: hidden;
          margin-bottom: 32px;
        }
        .progress-bar {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(to right, #1E6FA8, #6FBF1A);
          animation: progress-flow 3s ease-in-out infinite alternate;
        }
        @keyframes progress-flow {
          from { width: 30%; margin-left: 0; }
          to   { width: 60%; margin-left: 40%; }
        }

        .footer {
          color: #243648;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.08em;
        }
      `}</style>

      <div className="page">
        <div className="noise" />
        <div className="glow" />
        <div className="glow-green" />

        <div className="content">

          <div className="logo">
            <span className="logo-blue">Apexbytes</span>
            <span className="logo-green">Hub</span>
          </div>

          <div className="badge">
            <span className="badge-dot" />
            <span className="badge-text">Maintenance in progress</span>
          </div>

          <h1>We'll be right back.</h1>

          <p className="sub">
            We're making improvements to give you a better experience. Everything will be back shortly.
          </p>
          <p className="location">Apexbytes Hub · Kgotsong, Bothaville</p>

          <div className="divider" />

          <div className="cards">
            <div className="card">
              <div className="card-icon">🖨️</div>
              <div className="card-label">Still open</div>
              <div className="card-value">Print & Docs</div>
            </div>
            <div className="card">
              <div className="card-icon">📱</div>
              <div className="card-label">Reach us</div>
              <div className="card-value">WhatsApp</div>
            </div>
            <div className="card">
              <div className="card-icon">⚡</div>
              <div className="card-label">Response</div>
              <div className="card-value">Under 30 min</div>
            </div>
          </div>

          <div className="progress-wrap">
            <div className="progress-bar" />
          </div>

          <p className="wa-prompt">Need something urgent? We're still here.</p>
          <a
            href="https://wa.me/27753338260?text=Hi%20Apexbytes%20Hub!%20I%20saw%20your%20site%20is%20under%20maintenance.%20Can%20you%20still%20help%20me%3F"
            className="wa-btn"
          >
            <svg className="wa-icon" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Chat With Us
          </a>

          <p className="footer">© {new Date().getFullYear()} Apexbytes Hub · All rights reserved</p>

        </div>
      </div>
    </>
  )
}
