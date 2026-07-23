import { Link } from 'react-router-dom';
import { Logo } from '@shared/ui';
import { ROUTES } from '@app/routes';

const COLUMNS = [
  {
    title: 'Producto',
    links: [
      { label: 'Diferenciación', href: '#beneficios' },
      { label: 'Tokens', href: '#tokens' },
      { label: 'Servicios', href: '#servicios' },
      { label: 'Preguntas frecuentes', href: '#faq' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre nosotros', href: '#beneficios' },
      { label: 'Afiliados', href: '#faq' },
      { label: 'Blog', href: '#' },
      { label: 'Contacto', href: '#contacto' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacidad', href: '#' },
      { label: 'Términos', href: '#' },
      { label: 'Cookies', href: '#' },
      { label: 'Habeas Data', href: '#' },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-graphite-200/70 bg-graphite-50">
      <div className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-graphite-500">
              Derecho, innovación y confianza para tu empresa. Plataforma de afiliación jurídica
              para pymes con tokens flexibles y atención remota.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-navy-900">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-graphite-500 transition-colors hover:text-accent-600"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-graphite-200/70 pt-8 sm:flex-row">
          <p className="text-sm text-graphite-400">
            © {new Date().getFullYear()} JurisTech. Todos los derechos reservados.
          </p>
          <Link
            to={ROUTES.dashboard}
            className="text-sm font-medium text-accent-600 hover:text-accent-700"
          >
            Acceder a la plataforma →
          </Link>
        </div>
      </div>
    </footer>
  );
}
