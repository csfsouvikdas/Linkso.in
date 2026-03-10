import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Star, Zap, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const CREATORS = [
  { initials: "AR", name: "Aryan R.", handle: "@aryanr", niche: "Designer", links: 8, gradient: "from-violet-400 to-indigo-500", pro: true },
  { initials: "SK", name: "Sneha K.", handle: "@snehakim", niche: "Creator", links: 12, gradient: "from-rose-400 to-pink-500", pro: true },
  { initials: "MC", name: "Mihir C.", handle: "@mihirc", niche: "Dev", links: 6, gradient: "from-amber-400 to-orange-500", pro: false },
  { initials: "PP", name: "Priya P.", handle: "@priyap", niche: "Marketer", links: 9, gradient: "from-emerald-400 to-teal-500", pro: true },
];

const TESTIMONIALS = [
  { quote: "I replaced 8 different links in my Instagram bio with just my Linkso. Game changer.", author: "Sneha K.", role: "Fashion Creator", stars: 5 },
  { quote: "The analytics helped me see which links perform best. Invaluable.", author: "Aryan R.", role: "Tech Designer", stars: 5 },
  { quote: "Setup took 2 minutes. Now my entire portfolio is one tap away.", author: "Priya P.", role: "Freelance Marketer", stars: 5 },
];

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = target / 60;

    const timer = setInterval(() => {
      start += step;

      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target]);

  return <>{count.toLocaleString()}{suffix}</>;
}

function CreatorTicker() {
  const x = useMotionValue(0);
  const creators = [...CREATORS, ...CREATORS];
  const containerRef = useRef<HTMLDivElement>(null);

  useAnimationFrame(() => {
    const current = x.get();
    const next = current - 0.4;

    if (containerRef.current && Math.abs(next) > containerRef.current.scrollWidth / 2) {
      x.set(0);
    } else {
      x.set(next);
    }
  });

  return (
    <div className="overflow-hidden w-full py-4 relative">
      <motion.div ref={containerRef} style={{ x }} className="flex gap-4 w-max">
        {creators.map((c, i) => (
          <div
            key={i}
            className="w-56 rounded-xl border border-gray-200 bg-white p-4 space-y-3 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${c.gradient} flex items-center justify-center text-sm font-bold text-white`}>
                {c.initials}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                <p className="text-xs text-gray-500">{c.handle}</p>
              </div>

              {c.pro && <Zap className="ml-auto h-4 w-4 text-yellow-500" />}
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>{c.niche}</span>
              <span>{c.links} links</span>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function SocialProofSection() {
  return (
    <section className="py-24 bg-white border-t border-gray-100">

      <div className="container mx-auto px-4">

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full border border-green-200 bg-green-50 text-xs font-semibold text-green-600 mb-6">
            Trusted by creators
          </span>

          <div className="flex flex-wrap justify-center gap-12">

            {[
              { value: 10000, suffix: "+", label: "Creators" },
              { value: 2000000, suffix: "+", label: "Link Clicks" },
             
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-gray-900">
                  <Counter target={s.value} suffix={s.suffix} />
                </p>

                <p className="text-sm text-gray-500 mt-2">{s.label}</p>
              </div>
            ))}

          </div>
        </motion.div>

        {/* Creator ticker */}
        <div className="mb-20">
          <CreatorTicker />
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">

          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex gap-1 mb-3">
                {Array(t.stars).fill(0).map((_, j) => (
                  <Star key={j} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>

              <p className="text-sm text-gray-600 italic mb-4">"{t.quote}"</p>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">

                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-600">
                  {t.author[0]}
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-800">{t.author}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>

              </div>
            </motion.div>
          ))}

        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-xl mx-auto"
        >

          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Your audience is waiting.
          </h2>

          <p className="text-gray-600 mb-8">
            Join thousands of creators who share everything from one link.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">

            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-semibold text-white bg-green-500 hover:bg-green-600 transition"
            >
              Create your free Linkso
              <ArrowUpRight className="h-4 w-4" />
            </Link>

            <Link
              to="/upgrade"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              <Zap className="h-4 w-4 text-yellow-500" />
              Upgrade to Pro
            </Link>

          </div>

        </motion.div>

      </div>
    </section>
  );
}