export const metadata = {
  title: "Privacy Statement | 20 to 1",
  description: "Privacy statement and data protection disclosures for 20 to 1.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold text-slate-800 mb-4">Privacy Statement</h1>
      <p className="text-sm text-slate-400 mb-8">Last updated: {new Date().getFullYear()}</p>

      <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
        <p>
          This Privacy Statement explains how 20 to 1 (&quot;we&quot;, &quot;us&quot;, or
          &quot;our&quot;) collects, uses, and protects information in connection with this
          demonstration website for agentic technology consulting services.
        </p>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">Information we collect</h2>
          <p>
            In the normal use of this site, we may collect information that you voluntarily
            provide, such as your name, email address, and any details you include when you
            contact us. We may also collect technical information automatically, such as your IP
            address, browser type, device information, and usage data (for example, which pages
            you visit and how you interact with the site).
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">How we use information</h2>
          <p>
            We use the information we collect to operate and improve this website, respond to
            inquiries, provide demonstrations of our services, maintain security, and comply with
            applicable laws. Any sample &quot;orders&quot; or cart activity on this site are for
            demonstration purposes only and do not create a binding agreement for services unless
            separately confirmed in writing.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">Legal basis and consent</h2>
          <p>
            Where required by law, we rely on your consent to process personal information you
            voluntarily provide (for example, when you submit contact details). In other cases, we
            may process limited technical data based on our legitimate interest in operating,
            securing, and improving this site.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">Cookies and analytics</h2>
          <p>
            This site may use cookies or similar technologies to remember preferences and
            understand how visitors use the site. Any analytics are used in aggregate form to
            improve performance and user experience, not to build individual profiles for
            advertising.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">Sharing of information</h2>
          <p>
            We do not sell your personal information. We may share information with trusted
            service providers who assist us in operating this site (for example, hosting or
            analytics providers), subject to appropriate confidentiality and data protection
            obligations. We may also disclose information if required by law or to protect our
            rights, users, or the security of the service.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">Data retention</h2>
          <p>
            We retain personal information only for as long as necessary to fulfill the purposes
            described in this statement or as required by applicable law. Because this is a
            demonstration environment, data may be periodically deleted or reset without notice.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">Your rights</h2>
          <p>
            Depending on your location, you may have rights regarding your personal information,
            such as the right to access, correct, or delete certain data, or to object to or
            restrict certain processing. To exercise these rights, please contact us using the
            details below. We will respond to requests in accordance with applicable law.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">Security</h2>
          <p>
            We take reasonable technical and organizational measures to protect information
            against unauthorized access, loss, or misuse. However, no system or transmission over
            the internet can be guaranteed to be 100% secure, and you use this site at your own
            risk.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">
            Demonstration-only environment
          </h2>
          <p>
            This site is provided for demonstration and evaluation purposes only and does not
            constitute a production service. Any sample data, orders, or workflows shown here are
            illustrative and may not reflect final implementations. Do not submit sensitive or
            confidential information through this site.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">Contact</h2>
          <p>
            If you have questions about this Privacy Statement or how we handle information, you
            can contact us at{" "}
            <a
              href="mailto:20to1@reqtec.com"
              className="font-medium text-sky-600 hover:text-sky-500 underline underline-offset-4"
            >
              20to1@reqtec.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}

