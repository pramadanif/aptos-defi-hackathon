"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Twitter, Github, MessageCircle, Mail } from "lucide-react";
import Image from "next/image";

interface SocialLinkProps {
  href: string;
  icon: React.ReactNode;
  title: string;
}

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function Footer() {
  return (
    <footer className="border-t border-primary/20 bg-slate-900/50 backdrop-blur-sm mt-20">
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
                  src="/ARGOPUMP.png"  
                  alt="ArgoPump Logo" 
                  width={32} 
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                ArgoPump
              </h3>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              The most advanced decentralized platform for launching and trading meme coins. 
              Join the future of DeFi with cutting-edge technology and vibrant community.
            </p>
            <div className="flex space-x-4">
              <SocialLink 
                href="https://twitter.com/argopumpdex" 
                icon={<Twitter className="w-5 h-5" />} 
                title="Follow us on Twitter"
              />
              <SocialLink 
                href="https://github.com/pramadanif/aptos-defi-hackathon" 
                icon={<Github className="w-5 h-5" />} 
                title="View on GitHub"
              />
              <SocialLink 
                href="https://t.me/argopumpdex" 
                icon={<MessageCircle className="w-5 h-5" />} 
                title="Join our Telegram"
              />
              <SocialLink 
                href="mailto:contact@argopump.xyz" 
                icon={<Mail className="w-5 h-5" />} 
                title="Contact us"
              />
            </div>
          </motion.div>

          {/* Platform Links */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="col-span-1"
          >
            <h4 className="font-bold mb-4 text-white">Platform</h4>
            <ul className="space-y-3">
              <FooterLink href="/launch">Launch Token</FooterLink>
              <FooterLink href="/bonding-curve">Trade</FooterLink>
              <FooterLink href="/portfolio">Portfolio</FooterLink>
              <FooterLink href="/#trending">Trending</FooterLink>
              <FooterLink href="/#how-it-works">How It Works</FooterLink>
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="col-span-1"
          >
            <h4 className="font-bold mb-4 text-white">Resources</h4>
            <ul className="space-y-3">
              <FooterLink href="/docs">Documentation</FooterLink>
              <FooterLink href="https://github.com/pramadanif/aptos-defi-hackathon">GitHub</FooterLink>
              <FooterLink href="/faq">FAQ</FooterLink>
              <FooterLink href="/blog">Blog</FooterLink>
              <FooterLink href="/roadmap">Roadmap</FooterLink>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} ArgoPump. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-4 md:mt-0">
            <FooterLink 
              href="/privacy" 
              className="text-sm hover:text-cyan-400 transition-colors"
            >
              Privacy Policy
            </FooterLink>
            <FooterLink 
              href="/terms" 
              className="text-sm hover:text-cyan-400 transition-colors"
            >
              Terms of Service
            </FooterLink>
            <FooterLink 
              href="/disclaimer" 
              className="text-sm hover:text-cyan-400 transition-colors"
            >
              Disclaimer
            </FooterLink>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon, title }: SocialLinkProps) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.9 }}
      title={title}
      className="w-10 h-10 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center hover:bg-slate-700/50 hover:border-cyan-400/50 transition-all duration-300 text-slate-300 hover:text-white"
    >
      {icon}
    </motion.a>
  );
}

function FooterLink({ href, children, className = "" }: FooterLinkProps) {
  return (
    <li>
      <Link 
        href={href}
        className={`text-slate-400 hover:text-cyan-400 transition-colors duration-300 ${className} flex items-center`}
      >
        <motion.span
          whileHover={{ x: 5 }}
          className="flex items-center"
        >
          {children}
          {href.startsWith('http') && (
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          )}
        </motion.span>
      </Link>
    </li>
  );
}