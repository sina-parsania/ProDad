import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-background/80">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold">ProDad</h2>
            <p className="mt-2 text-foreground/70 max-w-md">
              A place for dads to share experiences, advice, and support each other in the journey
              of fatherhood.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-3">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-foreground/70 hover:text-foreground transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-foreground/70 hover:text-foreground transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-foreground/70 hover:text-foreground transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-foreground/70 hover:text-foreground transition"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-3">Connect</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-foreground/70 hover:text-foreground transition">
                  Twitter
                </Link>
              </li>
              <li>
                <Link href="#" className="text-foreground/70 hover:text-foreground transition">
                  Instagram
                </Link>
              </li>
              <li>
                <Link href="#" className="text-foreground/70 hover:text-foreground transition">
                  Facebook
                </Link>
              </li>
              <li>
                <Link href="#" className="text-foreground/70 hover:text-foreground transition">
                  Discord
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 flex flex-col md:flex-row md:items-center justify-between">
          <p className="text-sm text-foreground/60">
            © {new Date().getFullYear()} ProDad. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex gap-4 text-sm text-foreground/60">
            <Link href="/privacy" className="hover:text-foreground transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
