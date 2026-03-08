import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

const sections = [
  { title: "1. Acceptance of Terms", content: "By creating an account or using Linktree, you agree to these Terms of Service. If you do not agree, please do not use our platform." },
  { title: "2. Account Responsibilities", content: "You are responsible for maintaining the security of your account credentials. You must provide accurate information during registration. You must be at least 13 years old to use Linktree." },
  { title: "3. Acceptable Use", content: "You may not use Linktree to share illegal content, spam, malware, phishing links, or content that violates the rights of others. We reserve the right to remove content or suspend accounts that violate these terms." },
  { title: "4. Your Content", content: "You retain ownership of the content you add to your Linktree profile. By using our service, you grant us a license to display your content as part of the service. You are responsible for ensuring you have the right to share any content you add." },
  { title: "5. Service Availability", content: "We strive to keep Linktree available 24/7, but we do not guarantee uninterrupted access. We may perform maintenance or updates that temporarily affect availability." },
  { title: "6. Termination", content: "You may delete your account at any time through your settings. We may also terminate or suspend your account if you violate these terms, with or without notice." },
  { title: "7. Limitation of Liability", content: "Linktree is provided 'as is' without warranties of any kind. We are not liable for any damages arising from your use of the platform, including lost data, lost profits, or service interruptions." },
  { title: "8. Changes to Terms", content: "We may modify these terms at any time. Continued use of Linktree after changes constitutes acceptance of the updated terms." },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-heading font-extrabold">
                Terms of <span className="text-gradient">Service</span>
              </h1>
              <p className="text-sm text-muted-foreground">Last updated: March 1, 2026</p>
            </div>
            <div className="glass rounded-2xl p-8 space-y-8">
              {sections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <h2 className="text-lg font-heading font-bold">{section.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
