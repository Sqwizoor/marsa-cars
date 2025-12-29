"use client";
import { Headset, MapPin, Mail } from "lucide-react";
import SocialLogo from "social-logos";
import Logo from "@/components/shared/logo";

const socialLinks = [
  { icon: "facebook" as const, label: "Facebook", url: "#" },
  { icon: "whatsapp" as const, label: "WhatsApp", url: "#" },
  { icon: "pinterest" as const, label: "Pinterest", url: "#" },
  { icon: "linkedin" as const, label: "LinkedIn", url: "#" },
  { icon: "instagram" as const, label: "Instagram", url: "#" },
  { icon: "youtube" as const, label: "YouTube", url: "#" },
  { icon: "telegram" as const, label: "Telegram", url: "#" },
] as const;

export default function Contact() {
  return (
    <div className="flex flex-col gap-y-8 text-white">
      {/* Logo */}
      <div className="mb-2">
        <Logo width="150px" height="50px" />
      </div>

      {/* Customer Support */}
      <div className="space-y-4">
        <div className="flex items-start gap-x-4 group">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <SocialLogo icon="whatsapp" size={24} fill="white" />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-300 text-sm mb-1">WhatsApp Business</span>
            <div className="flex flex-col gap-1">
              <a href="https://wa.me/27790705695" className="text-xl font-semibold hover:text-green-400 transition-colors duration-200">
                +27 79 0705 695
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Contact Info
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 group">
            <MapPin className="w-5 h-5 text-blue-400 mt-0.5 group-hover:scale-110 transition-transform" />
            <span className="text-sm text-slate-300 leading-relaxed">
              Address: [ Pay & Collect address Johannesburg South , 30 ElandClose road Unit C16 Elandspark Alberton Johannesburg ]
            </span>
          </div>
          
          <div className="flex items-center gap-3 group">
            <Mail className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
            <a href="mailto:support@joumase.cars" className="text-sm text-slate-300 hover:text-white transition-colors">
              support@joumase.cars
            </a>
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Follow Us</h3>
        <div className="flex flex-wrap gap-3">
          {socialLinks.map((social) => (
            <a
              key={social.icon}
              href={social.url}
              aria-label={social.label}
              className="group relative"
            >
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                <SocialLogo
                  icon={social.icon}
                  size={24}
                  fill="#E2E8F0"
                  className="transition-all duration-300 group-hover:fill-white"
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
