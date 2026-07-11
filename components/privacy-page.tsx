import { BIZ } from "@/lib/brand"

const LAST_UPDATED = "July 2026"

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background pt-[74px]">
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">

        {/* Header */}
        <div className="mb-12">
          <span className="text-[0.7rem] font-black uppercase tracking-widest text-brand-blue bg-brand-blue/10 px-3 py-1.5 rounded-full">
            Legal
          </span>
          <h1 className="mt-4 font-sans font-black text-3xl md:text-4xl text-zinc-900 dark:text-zinc-50 leading-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            {BIZ.name} &mdash; Last updated {LAST_UPDATED}
          </p>
          <p className="mt-6 text-[0.9rem] leading-relaxed text-zinc-600 dark:text-zinc-400 p-4 rounded-[12px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
            This Privacy Policy explains how <strong className="text-zinc-800 dark:text-zinc-200">{BIZ.name}</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, stores, and protects your personal information. It is written in compliance with the <strong className="text-zinc-800 dark:text-zinc-200">Protection of Personal Information Act, 2013 (POPIA)</strong> of South Africa.
          </p>
        </div>

        <div className="space-y-10 text-[0.9rem] text-zinc-600 dark:text-zinc-400 leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="font-black text-lg text-zinc-900 dark:text-zinc-50 mb-3">1. Who We Are</h2>
            <p>
              <strong className="text-zinc-700 dark:text-zinc-300">{BIZ.name}</strong> is a local technology and print services business based at {BIZ.addressFull}. We provide printing, document services, graphic design, e-government assistance, and tech support to individuals and small businesses in the Kgotsong and Bothaville area.
            </p>
            <p className="mt-3">
              <strong className="text-zinc-700 dark:text-zinc-300">Contact for privacy matters:</strong><br />
              Email: <a href={`mailto:${BIZ.email}`} className="text-brand-blue underline underline-offset-2">{BIZ.email}</a><br />
              Phone: {BIZ.phone}
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="font-black text-lg text-zinc-900 dark:text-zinc-50 mb-3">2. What Information We Collect</h2>
            <p>We may collect the following personal information when you use our services:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside pl-1">
              <li><strong className="text-zinc-700 dark:text-zinc-300">Identity information:</strong> Full name, ID number, date of birth (required for government services such as SASSA, SARS, PSIRA, NSFAS applications).</li>
              <li><strong className="text-zinc-700 dark:text-zinc-300">Contact information:</strong> Phone number, email address, physical address.</li>
              <li><strong className="text-zinc-700 dark:text-zinc-300">Documents:</strong> CVs, cover letters, affidavits, certificates, payslips, or any documents you bring or upload for us to work on.</li>
              <li><strong className="text-zinc-700 dark:text-zinc-300">Financial information:</strong> Payment method (cash, card, mobile money) — we do not store card details.</li>
              <li><strong className="text-zinc-700 dark:text-zinc-300">Device files:</strong> Files you provide on a USB drive, phone, or email for printing or design work.</li>
              <li><strong className="text-zinc-700 dark:text-zinc-300">Usage data:</strong> Anonymous site visit data collected by Vercel Analytics (no cookies, no personal identifiers).</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="font-black text-lg text-zinc-900 dark:text-zinc-50 mb-3">3. How We Use Your Information</h2>
            <p>We use your personal information only to:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside pl-1">
              <li>Provide the specific service you requested (printing, CV creation, government application, etc.).</li>
              <li>Submit applications on your behalf to government platforms (SARS, SASSA, etc.) — only with your explicit verbal consent.</li>
              <li>Contact you regarding your order status or to request missing information.</li>
              <li>Comply with legal obligations if required by law.</li>
            </ul>
            <p className="mt-3">
              We do <strong className="text-zinc-700 dark:text-zinc-300">not</strong> use your information for marketing, sell it to third parties, or share it with anyone without your consent.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="font-black text-lg text-zinc-900 dark:text-zinc-50 mb-3">4. Third-Party Services</h2>
            <p>We use the following third-party services that may process your data:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside pl-1">
              <li>
                <strong className="text-zinc-700 dark:text-zinc-300">Cloudinary (USA):</strong> Files you upload via our website (e.g. for design or document services) are stored temporarily on Cloudinary&apos;s servers. Cloudinary is GDPR-compliant. Files are used only for service delivery and are not shared.
              </li>
              <li>
                <strong className="text-zinc-700 dark:text-zinc-300">Vercel Analytics:</strong> Our website uses Vercel&apos;s privacy-first analytics. It does not use cookies and does not collect personal identifiers — only anonymous aggregate traffic data.
              </li>
              <li>
                <strong className="text-zinc-700 dark:text-zinc-300">WhatsApp (Meta):</strong> If you contact us via WhatsApp, your message and phone number are handled according to Meta&apos;s privacy policy.
              </li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="font-black text-lg text-zinc-900 dark:text-zinc-50 mb-3">5. How Long We Keep Your Information</h2>
            <ul className="mt-3 space-y-2 list-disc list-inside pl-1">
              <li><strong className="text-zinc-700 dark:text-zinc-300">Uploaded files:</strong> Deleted from Cloudinary within 30 days of service completion.</li>
              <li><strong className="text-zinc-700 dark:text-zinc-300">Physical documents:</strong> Returned to you immediately after service or destroyed on the same day.</li>
              <li><strong className="text-zinc-700 dark:text-zinc-300">Government application records:</strong> Retained only as long as needed to resolve your application (typically same day to 7 days).</li>
              <li><strong className="text-zinc-700 dark:text-zinc-300">Contact information:</strong> Not stored in any database unless you have an ongoing order.</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="font-black text-lg text-zinc-900 dark:text-zinc-50 mb-3">6. Your Rights Under POPIA</h2>
            <p>As a data subject under POPIA, you have the right to:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside pl-1">
              <li><strong className="text-zinc-700 dark:text-zinc-300">Access:</strong> Request a copy of any personal information we hold about you.</li>
              <li><strong className="text-zinc-700 dark:text-zinc-300">Correction:</strong> Ask us to correct inaccurate information.</li>
              <li><strong className="text-zinc-700 dark:text-zinc-300">Deletion:</strong> Request that we delete your personal information.</li>
              <li><strong className="text-zinc-700 dark:text-zinc-300">Objection:</strong> Object to the processing of your personal information.</li>
              <li><strong className="text-zinc-700 dark:text-zinc-300">Complaint:</strong> Lodge a complaint with the <strong>Information Regulator of South Africa</strong> at <a href="https://inforegulator.org.za" target="_blank" rel="noopener noreferrer" className="text-brand-blue underline underline-offset-2">inforegulator.org.za</a> if you believe your rights have been violated.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at <a href={`mailto:${BIZ.email}`} className="text-brand-blue underline underline-offset-2">{BIZ.email}</a> or WhatsApp us on {BIZ.phone}.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="font-black text-lg text-zinc-900 dark:text-zinc-50 mb-3">7. Security</h2>
            <p>
              We take reasonable precautions to protect your information. Our website uses HTTPS, security headers, and rate limiting. Sensitive documents handled in-store are treated with strict confidentiality and are not left unattended.
            </p>
            <p className="mt-3">
              No method of transmission over the internet is 100% secure. If you believe your data has been compromised, please contact us immediately.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="font-black text-lg text-zinc-900 dark:text-zinc-50 mb-3">8. Children&apos;s Privacy</h2>
            <p>
              We do not knowingly collect personal information from children under the age of 18 without parental consent. If a parent or guardian brings a child in for services, we process only the minimum information needed.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="font-black text-lg text-zinc-900 dark:text-zinc-50 mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the &quot;Last updated&quot; date at the top of this page. Continued use of our services after any changes means you accept the updated policy.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="font-black text-lg text-zinc-900 dark:text-zinc-50 mb-3">10. Contact Us</h2>
            <p>For any privacy-related questions or requests:</p>
            <div className="mt-3 p-4 rounded-[12px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-1">
              <p><strong className="text-zinc-700 dark:text-zinc-300">{BIZ.name}</strong></p>
              <p>{BIZ.addressFull}</p>
              <p>Email: <a href={`mailto:${BIZ.email}`} className="text-brand-blue underline underline-offset-2">{BIZ.email}</a></p>
              <p>Phone: <a href={`https://wa.me/${BIZ.phoneE164.replace("+", "")}`} className="text-brand-blue underline underline-offset-2">{BIZ.phone}</a></p>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
