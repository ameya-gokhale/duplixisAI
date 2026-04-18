import { Cpu, Github, Linkedin, Twitter } from "lucide-react";

const SOCIAL_LINKS = [
  {
    icon: Github,
    label: "GitHub",
    href: "https://github.com",
    ocid: "footer.github.link",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    href: "https://linkedin.com",
    ocid: "footer.linkedin.link",
  },
  {
    icon: Twitter,
    label: "Twitter / X",
    href: "https://x.com",
    ocid: "footer.twitter.link",
  },
];

export function Footer() {
  return (
    <footer
      className="bg-card border-t border-border"
      data-ocid="footer.section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-10 mb-10">
          {/* Brand column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl gradient-ai flex items-center justify-center shadow-glass">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-accent-ai">
                duplixisAI
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              AI-powered multilingual duplicate record detection. Find
              near-duplicates across languages instantly with semantic NLP.
            </p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href, ocid }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  data-ocid={ocid}
                  className="w-9 h-9 rounded-lg glass-card flex items-center justify-center text-muted-foreground hover:text-primary hover:scale-110 transition-smooth"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border" />
      </div>
    </footer>
  );
}
