import { LegalLayout } from "./LegalLayout";

const sections = [
  { 
    title: "1. Acceptance of Terms", 
    content: "By creating an account or using Linkso, you agree to these Terms of Service. If you do not agree, please do not use our platform." 
  },
  { 
    title: "2. Account Responsibilities", 
    content: "You are responsible for maintaining the security of your account credentials. You must provide accurate information during registration. You must be at least 13 years old to use Linkso." 
  },
  { 
    title: "3. Acceptable Use", 
    content: "You may not use Linkso to share illegal content, spam, malware, phishing links, or content that violates the rights of others. We reserve the right to remove content or suspend accounts that violate these terms." 
  },
  { 
    title: "4. Your Content", 
    content: "You retain ownership of the content you add to your Linkso profile. By using our service, you grant us a license to display your content as part of the service. You are responsible for ensuring you have the right to share any content you add." 
  },
  { 
    title: "5. Service Availability", 
    content: "We strive to keep Linkso available 24/7, but we do not guarantee uninterrupted access. We may perform maintenance or updates that temporarily affect availability." 
  },
  { 
    title: "6. Termination", 
    content: "You may delete your account at any time through your settings. We may also terminate or suspend your account if you violate these terms, with or without notice." 
  },
  { 
    title: "7. Limitation of Liability", 
    content: "Linkso is provided 'as is' without warranties of any kind. We are not liable for any damages arising from your use of the platform, including lost data, lost profits, or service interruptions." 
  },
  { 
    title: "8. Changes to Terms", 
    content: "We may modify these terms at any time. Continued use of Linkso after changes constitutes acceptance of the updated terms." 
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans">
      <LegalLayout
        // Matching the "Free to use" pill style from your hero image
        badge="• LEGAL FRAMEWORK"
        title="Terms of"
        titleHighlight="Service"
        subtitle="The clear rules and guidelines for using Linkso to grow your digital presence."
        updated="March 1, 2026"
        sections={sections}
        
        // Brand-specific theme colors from the screenshot
        accentColor="#1ed760" // The main Linkso Green
        accentBg="#dcfce7"    // The soft green background used in pills/badges
        
        // Custom props to pass down for the "Paper" look
        containerClass="bg-white rounded-[48px] border border-gray-100 shadow-sm"
        textClass="text-gray-500 font-medium"
        headingClass="text-[#111827] font-bold tracking-tight"
      />
    </div>
  );
}