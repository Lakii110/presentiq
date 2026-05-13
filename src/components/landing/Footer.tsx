import Link from "next/link";
import BotLogo from "@/components/BotLogo";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <BotLogo size={32} />
              <span className="text-lg font-bold text-foreground">PresentIQ</span>
            </Link>
            <p className="mb-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Empowering professionals to speak with confidence through AI-driven speech analysis and feedback. Free forever.
            </p>
          </div>
          {[
            { title: "Product", links: ["Features", "Use Cases", "Integrations", "Changelog"] },
            { title: "Company", links: ["About Us", "Careers", "Blog", "Contact"] },
            { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Security"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-semibold text-foreground">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-border pt-8 text-center text-xs text-muted-foreground">
          © 2026. PresentIQ Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
