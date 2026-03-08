import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";

const posts = [
  { title: "How to Grow Your Audience with a Link in Bio", date: "Mar 5, 2026", excerpt: "Discover proven strategies to drive more traffic through your Linktree page and convert visitors into followers.", category: "Growth" },
  { title: "5 Tips for a Stunning Profile Page", date: "Feb 28, 2026", excerpt: "Make your Linktree page stand out with these design tips that top creators swear by.", category: "Design" },
  { title: "The Rise of the Creator Economy", date: "Feb 20, 2026", excerpt: "How independent creators are building businesses around their personal brands — and how Linktree fits in.", category: "Trends" },
  { title: "New Feature: Link Click Analytics", date: "Feb 12, 2026", excerpt: "Track which links your audience clicks the most with our new built-in analytics dashboard.", category: "Product" },
  { title: "Why Every Professional Needs a Link in Bio", date: "Feb 5, 2026", excerpt: "It's not just for influencers — here's why professionals across every industry are using Linktree.", category: "Insights" },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-heading font-extrabold">
                The <span className="text-gradient">Blog</span>
              </h1>
              <p className="text-lg text-muted-foreground">Tips, insights, and updates from the Linktree team.</p>
            </div>

            <div className="space-y-4">
              {posts.map((post, i) => (
                <motion.article
                  key={post.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-2xl p-6 hover-lift cursor-pointer space-y-3"
                >
                  <div className="flex items-center gap-3 text-sm">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium text-xs">{post.category}</span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" /> {post.date}
                    </span>
                  </div>
                  <h2 className="text-lg font-heading font-bold">{post.title}</h2>
                  <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
