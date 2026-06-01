import type { Metadata } from "next";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Privacy Policy — NexusWire",
  description: "NexusWire's privacy policy — how we handle user data, authentication, and analytics.",
};

export default function PrivacyPage() {
  return (
    <main>
      <Header title="Privacy Policy" subtitle="Your Data & Rights" />
      <section className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        <div className="rounded-3xl glass-strong p-8 fade-up">
          <h2 className="font-display text-xl font-bold text-[var(--text-primary)] mb-2">Privacy Policy</h2>
          <p className="text-xs text-[var(--text-muted)] mb-4">Effective date: June 2025</p>
          <p className="text-[var(--text-muted)] leading-relaxed">
            NexusWire respects your privacy. This policy explains what data we collect, how we use it, and your rights.
          </p>
        </div>

        {[
          {
            title: "Account Data",
            body: "When you create an account, we collect your email address and display name via Firebase Authentication. Passwords are managed securely by Firebase and are never stored in plain text by NexusWire. Google Sign-In is available; in this case, Google provides us with your email and profile name.",
          },
          {
            title: "Comments & Likes",
            body: "Comments and likes you create are stored in Firestore and associated with your user account. Your display name is visible on comments you post. You may contact us to request deletion of your comments.",
          },
          {
            title: "Local Storage",
            body: "NexusWire uses your browser's localStorage to store saved articles and user preferences. This data never leaves your device and is not transmitted to our servers.",
          },
          {
            title: "Firebase & Firestore",
            body: "NexusWire uses Google Firebase for authentication and data storage. Firebase may collect standard usage telemetry. Please review Google's privacy policy for details on Firebase data handling.",
          },
          {
            title: "Analytics",
            body: "We may add privacy-respecting analytics in the future (such as aggregated page views). Any analytics implementation will be disclosed here and will not include personal identifiers.",
          },
          {
            title: "Third-Party Links",
            body: "NexusWire links to third-party publisher websites. We are not responsible for the privacy practices of external sites. When you click 'Read full story', you are leaving NexusWire and entering the publisher's domain.",
          },
          {
            title: "Your Rights",
            body: "You may request access to, correction of, or deletion of your personal data at any time by contacting hello@nexuswire.app. Account deletion removes your authentication record and display name from stored comments.",
          },
        ].map(({ title, body }) => (
          <div key={title} className="rounded-2xl glass p-6">
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-[var(--accent)] mb-3">{title}</h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">{body}</p>
          </div>
        ))}

        <p className="text-xs text-[var(--text-muted)] px-2">
          Questions: <a href="mailto:hello@nexuswire.app" className="text-[var(--accent)] hover:underline">hello@nexuswire.app</a>
        </p>
      </section>
    </main>
  );
}
