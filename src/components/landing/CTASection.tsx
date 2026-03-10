import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 bg-[#F9FAFB]"> {/* Matching the clean off-white bg */}
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-[48px] bg-white border border-gray-100 shadow-sm p-12 md:p-20 text-center overflow-hidden"
        >
          {/* Subtle background glow to match the image's soft lighting */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#D1FAE5]/30 via-transparent to-transparent -z-10" />
          
          <div className="relative z-10 space-y-8">
            <div className="inline-block px-4 py-1.5 mb-2 rounded-full bg-[#D1FAE5] text-[#065F46] text-sm font-medium">
              Free to use - Till 3 links
            </div>

            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-[#111827] max-w-2xl mx-auto leading-[1.1]">
              One link. <br />
              <span className="text-[#1ed760]">Everything</span> you are.
            </h2>

            <p className="text-lg md:text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
              Share all your socials, content, and links from a single beautiful page. 
              Trusted by creators and professionals worldwide.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button 
                size="lg" 
                asChild
                className="bg-[#1ed760] hover:bg-[#1abf54] text-[#111827] font-bold rounded-full px-8 py-7 text-lg transition-transform hover:scale-105"
              >
                <Link to="/signup">
                  Get Your Free Link
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                asChild
                className="rounded-full border-gray-200 px-8 py-7 text-lg font-semibold hover:bg-gray-50"
              >
                <Link to="/examples">
                  See Example
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}