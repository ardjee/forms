import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import { Separator } from '../ui/separator';

const Footer = () => {
  const pathname = usePathname();

  // Check if we're on a landing page
  const landingPageRoutes = ['/tarieven', '/zon-ecn', '/warmte', '/airco'];
  const isLandingPage = landingPageRoutes.includes(pathname);

  if (!isLandingPage) {
    // For non-landing pages, render the original footer logic
    return (
      <footer className="bg-[#2c3e50] text-gray-200">
        <div className="container mx-auto max-w-screen-2xl px-4 pt-12 pb-8 sm:px-6 lg:px-8">
          <Separator className="my-4 bg-white/20" />
          <div className="text-center text-sm">
            <p>&copy; {new Date().getFullYear()} ZON-ECN Installatietechniek. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-[#2c3e50] text-gray-200">
      <div className="container mx-auto max-w-screen-2xl px-4 pt-12 pb-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12 mb-6">
          <div>
            <p className="font-headline font-medium text-white mb-2">Email</p>
            <a href="mailto:onderhoud@zon-ecn.nl" className="flex items-center gap-2 transition hover:text-primary text-sm">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span>onderhoud@zon-ecn.nl</span>
            </a>
          </div>
          <div>
            <p className="font-headline font-medium text-white mb-2">Website</p>
            <a href="https://www.zon-ecn.nl" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition hover:text-primary text-sm">
              <Globe className="h-4 w-4 flex-shrink-0" />
              <span>www.zon-ecn.nl</span>
            </a>
          </div>
          <div>
            <p className="font-headline font-medium text-white mb-2">Phone</p>
            <a href="tel:+31318230010" className="flex items-center gap-2 transition hover:text-primary text-sm">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span>0318 - 230 010</span>
            </a>
          </div>
          <div>
            <p className="font-headline font-medium text-white mb-2">Address</p>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p>Faradaystraat 12</p>
                <p>6718 XT Ede</p>
              </div>
            </div>
          </div>
        </div>
        <Separator className="my-4 bg-white/20" />
        <div className="text-center text-sm">
          <p>&copy; {new Date().getFullYear()} ZON-ECN Installatietechniek. Alle rechten voorbehouden.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
