import type { Metadata } from "next";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Terms of Use — NexusWire",
  description: "NexusWire terms of use — rules for users, content, and third-party links.",
};

export default function TermsPage() {
  return (
    <main>
      <Header title="Terms of Use" subtitle="Rules & Responsibilities" />
      <section className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        <div className="rounded-3xl glass-strong p-8 fade-up">
          <h2 className="font-display text-xl font-bold text-[var(--text-primary)] mb-2">Terms of Use</h2>
          <p className="text-xs text-[var(--text-muted)] mb-4">Effective date: June 2025</p>
          <p className="text-[var(--text-muted)] leading-relaxed">
            By using NexusWire, you agree to the following terms. Please read them carefully.
          </p>
        </div>

        {[
          {
            title: "Nature of Service",
            body: "NexusWire provides news discovery, source-attributed article previews, and video aggregation. We are not a news publisher. All article content belongs to original third-party publishers. NexusWire is not responsible for the accuracy of third-party content.",
          },
          {
            title: "Third-Party Content",
            body: "Links and previews on NexusWire direct you to third-party websites and YouTube channels. NexusWire does not control and is not responsible for the content, privacy practices, or availability of those sites. Your interaction with third-party sites is governed by their own terms.",
          },
          {
            title: "User-Generated Content",
            body: "Comments posted by users are their own opinions and do not represent NexusWire's views. By posting a comment, you grant NexusWire a non-exclusive right to display that comment on the platform. You retain ownership of your content.",
          },
          {
            title: "Prohibited Conduct",
            body: "You may not post comments or content that is: illegal, abusive, defamatory, harassing, or that infringes third-party rights. You may not use NexusWire to distribute spam, misinformation, or malicious content. NexusWire reserves the right to remove violating content and suspend accounts.",
          },
          {
            title: "Intellectual Property",
            body: "The NexusWire name, logo, and platform design are owned by NexusWire. Third-party news content belongs to its respective publishers. No NexusWire content may be reproduced without permission.",
          },
          {
            title: "Disclaimer of Warranties",
            body: "NexusWire is provided 'as is'. We make no warranty that the service will be uninterrupted, error-free, or that feed content will always be available. News feeds depend on third-party sources outside our control.",
          },
          {
            title: "Limitation of Liability",
            body: "To the maximum extent permitted by law, NexusWire is not liable for any indirect, incidental, or consequential damages arising from your use of the platform or reliance on any news content displayed.",
          },
          {
            title: "Changes to Terms",
            body: "We may update these terms from time to time. Continued use of NexusWire after changes constitutes acceptance of the revised terms.",
          },
        ].map(({ title, body }) => (
          <div key={title} className="rounded-2xl glass p-6">
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-[var(--accent)] mb-3">{title}</h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">{body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
