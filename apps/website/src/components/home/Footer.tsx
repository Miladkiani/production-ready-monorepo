// import { Github, Linkedin, Mail } from "lucide-react";

export default function FooterSection() {
  return (
    <footer className="border-t border-border bg-background text-text-secondary text-sm py-8 px-4">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-4 text-center">
        {/* Social Icons */}
        <div className="flex gap-5">
          <a
            href="mailto:hello@your-serverfard.com"
            aria-label="Email"
            className="hover:text-primary transition"
          >
            {/* <Mail size={20} /> */}
          </a>
          <a
            href="https://github.com/your-serverfard"
            aria-label="GitHub"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition"
          >
            {/* <Github size={20} /> */}
          </a>
          <a
            href="https://linkedin.com/in/your-serverfard"
            aria-label="LinkedIn"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition"
          >
            {/* <Linkedin size={20} /> */}
          </a>
        </div>

        {/* Divider */}
        <div className="h-px w-20 bg-border mt-2 mb-3"></div>

        {/* Copyright */}
        <p className="text-text-muted text-sm">
          © {new Date().getFullYear()} Your Name. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
