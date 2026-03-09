import { LegalLayout } from "./LegalLayout";

const sections = [
  { 
    title: "1. Information We Collect", 
    content: "We collect information you provide directly, such as your name, email address, username, and links you add to your profile. We also collect usage data including page views, link clicks, and device information to improve our service." 
  },
  { 
    title: "2. How We Use Your Information", 
    content: "We use your information to provide and improve our services, personalize your experience, send important notifications, and analyze usage patterns to enhance our platform." 
  },
  { 
    title: "3. Information Sharing", 
    content: "We do not sell your personal information. We may share anonymized, aggregated data for analytics purposes. Your public profile information (display name, bio, links) is visible to anyone who visits your Linkso URL." 
  },
  { 
    title: "4. Data Security", 
    content: "We implement industry-standard security measures to protect your data, including encryption in transit and at rest, secure authentication, and regular security audits." 
  },
  { 
    title: "5. Your Rights", 
    content: "You have the right to access, update, or delete your personal information at any time through your account settings. You can also request a copy of your data or ask us to stop processing it." 
  },
  { 
    title: "6. Cookies", 
    content: "We use essential cookies to keep you logged in and functional cookies to remember your preferences. We do not use third-party advertising cookies." 
  },
  { 
    title: "7. Changes to This Policy", 
    content: "We may update this privacy policy from time to time. We will notify you of any significant changes via email or through our platform." 
  },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      // Using the bubbly green badge style from the screenshot
      badge="🔒 YOUR PRIVACY MATTERS"
      title="Privacy"
      titleHighlight="Policy"
      subtitle="How we collect, use, and protect your data so you can share with confidence."
      updated="March 1, 2026"
      sections={sections}
      // Matching Linkso Green #1ed760
      accentColor="#1ed760" 
      accentBg="#dcfce7" // Soft mint background for the badge/highlights
    />
  );
}