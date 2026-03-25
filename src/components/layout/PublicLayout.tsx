import { Outlet, Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Store Directory', path: '/directory' },
  { label: 'Apply', path: '/apply' },
];

export default function PublicLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top navigation */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 no-underline"
            >
              <img src="/Logo.jpg" alt="ZAPP Donuts" className="h-9 w-9 rounded-lg object-cover" />
              <span className="text-xl font-bold text-zapp-brown tracking-tight">
                ZAPP Donuts
              </span>
            </Link>

            {/* Nav links */}
            <nav className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium no-underline transition-colors',
                    location.pathname === link.path
                      ? 'bg-zapp-cream text-zapp-brown'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {/* Login button */}
              <Link
                to="/login"
                className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-zapp-orange text-white no-underline hover:bg-zapp-orange-light transition-colors"
              >
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/Logo.jpg" alt="ZAPP Donuts" className="h-7 w-7 rounded-lg object-cover" />
              <span className="text-sm font-semibold text-zapp-brown">
                ZAPP Donuts
              </span>
            </div>
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} ZAPP Donuts Inc. All rights
              reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <Link
                to="/privacy"
                className="hover:text-gray-600 no-underline text-gray-400"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="hover:text-gray-600 no-underline text-gray-400"
              >
                Terms
              </Link>
              <Link
                to="/contact"
                className="hover:text-gray-600 no-underline text-gray-400"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
