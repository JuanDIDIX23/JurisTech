import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Logo, Button } from '@shared/ui';
import { cn } from '@shared/lib/cn';
import { ROUTES } from '@app/routes';
import { useAuthStore } from '@shared/store/authStore';

const NAV_LINKS = [
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Tokens', href: '#tokens' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contacto', href: '#contacto' },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Destino del CTA según la sesión activa. El valor se recalcula solo
  // cuando el perfil termina de cargarse, así que un visitante con sesión
  // recién restaurada acaba en el panel que le corresponde.
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);

  const destinoCta = !user
    ? ROUTES.login
    : profile?.rol === 'admin'
      ? ROUTES.admin
      : ROUTES.dashboard;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fondo sólido (blanco) cuando hay scroll o el menú móvil está abierto;
  // de lo contrario es transparente sobre el hero oscuro y usa texto claro.
  const solid = scrolled || open;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        solid ? 'border-b border-sand-200 bg-white/80 backdrop-blur-xl' : 'border-b border-transparent',
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        <Link to={ROUTES.home} className="shrink-0">
          <Logo tone={solid ? 'dark' : 'light'} />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors',
                solid
                  ? 'text-stone-600 hover:text-stone-900'
                  : 'text-white/85 hover:text-white',
              )}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link to={ROUTES.dashboard}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(!solid && '!text-white hover:!bg-white/10')}
            >
              Iniciar sesión
            </Button>
          </Link>
          <Link to={destinoCta}>
            <Button size="sm" rightIcon={<ArrowRight size={16} />}>
              Empezar
            </Button>
          </Link>
        </div>

        <button
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors md:hidden',
            solid ? 'text-stone-700' : 'text-white',
          )}
          onClick={() => setOpen((v) => !v)}
          aria-label="Menú"
          aria-expanded={open}
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
            <Link to={destinoCta} className="mt-2" onClick={() => setOpen(false)}>
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
