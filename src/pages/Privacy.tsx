import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

const sections = [
  { title: "1. Information We Collect", content: "We collect information you provide directly, such as your name, email address, username, and links you add to your profile. We also collect usage data including page views, link clicks, and device information to improve our service." },
  { title: "2. How We Use Your Information", content: "We use your information to provide and improve our services, personalize your experience, send important notifications, and analyze usage patterns to enhance our platform." },
  { title: "3. Information Sharing", content: "We do not sell your personal information. We may share anonymized, aggregated data for analytics purposes. Your public profile information (display name, bio, links) is visible to anyone who visits your Linktree URL." },
  { title: "4. Data Security", content: "We implement industry-standard security measures to protect your data, including encryption in transit and at rest, secure authentication, and regular security audits." },
  { title: "5. Your Rights", content: "You have the right to access, update, or delete your personal information at any time through your account settings. You can also request a copy of your data or ask us to stop processing it." },
  { title: "6. Cookies", content: "We use essential cookies to keep you logged in and functional cookies to remember your preferences. We do not use third-party advertising cookies." },
  { title: "7. Changes to This Policy", content: "We may update this privacy policy from time to time. We will notify you of any significant changes via email or through our platform." },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-heading font-extrabold">
                Privacy <span className="text-gradient">Policy</span>
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
