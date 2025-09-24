"use client";

import { motion } from "framer-motion";
import { TrendingUp, Twitter, Github, MessageCircle, Mail } from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-primary/20 glass-morphism mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="col-span-1 md:col-span-2"
          >
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <Image 
                  src="/BULLPUMP_FIX.png" 
                  alt="BullPump Logo" 
                  width={32} 
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-gradient-primary">
                BullPump
              </h3>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              The most advanced decentralized platform for launching and trading meme coins. 
              Join the future of DeFi with cutting-edge technology and vibrant community.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="#" icon={<Twitter className="w-5 h-5" />} />
              <SocialLink href="#" icon={<Github className="w-5 h-5" />} />
              <SocialLink href="#" icon={<MessageCircle className="w-5 h-5" />} />
              <SocialLink href="#" icon={<Mail className="w-5 h-5" />} />
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="font-bold mb-4">Platform</h4>
            <ul className="space-y-3">
              <FooterLink href="#">Launch Token</FooterLink>
              <FooterLink href="#">Trade</FooterLink>
              <FooterLink href="#">Analytics</FooterLink>
              <FooterLink href="#">Portfolio</FooterLink>
              <FooterLink href="#">Leaderboard</FooterLink>
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h4 className="font-bold mb-4">Resources</h4>
            <ul className="space-y-3">
              <FooterLink href="#">Documentation</FooterLink>
              <FooterLink href="#">API</FooterLink>
              <FooterLink href="#">Help Center</FooterLink>
              <FooterLink href="#">Community</FooterLink>
              <FooterLink href="#">Blog</FooterLink>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="border-t border-primary/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-muted-foreground text-sm">
            © 2024 BullPump. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <FooterLink href="#" className="text-sm">Privacy Policy</FooterLink>
            <FooterLink href="#" className="text-sm">Terms of Service</FooterLink>
            <FooterLink href="#" className="text-sm">Cookie Policy</FooterLink>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.9 }}
      className="w-10 h-10 rounded-full glass-morphism border border-primary/30 flex items-center justify-center hover:border-primary/60 hover:neon-glow-cyan transition-all duration-300"
    >
      {icon}
    </motion.a>
  );
}

function FooterLink({ href, children, className = "" }: { 
  href: string; 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <li>
      <motion.a
        href={href}
        whileHover={{ x: 5 }}
        className={`text-muted-foreground hover:text-foreground transition-colors duration-300 ${className}`}
      >
        {children}
      </motion.a>
    </li>
  );
}