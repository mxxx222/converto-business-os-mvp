import Link from 'next/link';

const navigation = [
  { href: '/fi', label: 'Etusivu' },
  { href: '/fi/pricing', label: 'Hinnasto' },
  { href: '/fi/contact', label: 'Yhteys' },
  { href: '/fi/security', label: 'Tietoturva' },
  { href: '/fi/privacy', label: 'Tietosuoja' },
];

export default function Nav() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/fi" className="text-xl font-semibold text-slate-900">
          DocFlow
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/fi/contact"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          Pyydä demo
        </Link>
      </div>
    </header>
  );
}

