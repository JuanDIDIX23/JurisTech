import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Logo, Button } from '@shared/ui';
import { cn } from '@shared/lib/cn';
import { ROUTES } from '@app/routes';

const NAV_LINKS = [
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Tokens', href: '#tokens' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'FAQ', href: '#faq' },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-sand-200 bg-white/80 backdrop-blur-xl'
          : 'border-b border-transparent',
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        <Link to={ROUTES.home} className="shrink-0">
          <Logo />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link to={ROUTES.dashboard}>
            <Button variant="ghost" size="sm">
              Iniciar sesión
            </Button>
          </Link>
          <Link to={ROUTES.dashboard}>
            <Button size="sm" rightIcon={<ArrowRight size={16} />}>
              Empezar
            </Button>
          </Link>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-stone-700 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menú"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-sand-200 bg-white md:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-sand-100"
              >
                {link.label}
              </a>
            ))}
            <Link to={ROUTES.dashboard} className="mt-2">
              <Button className="w-full" rightIcon={<ArrowRight size={16} />}>
                Empezar ahora
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
