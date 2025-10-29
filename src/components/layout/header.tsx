'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Logo from '../logo';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '../ui/input';

const Header = () => {
  const pathname = usePathname();

  const consumentLinks = [
    { href: "/consument", label: "Onze diensten" },
    { href: "/warmtepomp-keuzehulp", label: "Warmtepomp keuzehulp" },
    { href: "/storingen", label: "Storingen" },
    { href: "/service", label: "Service & Onderhoud" },
    { href: "/tarieven", label: "Tarieven" },
  ];

  const zakelijkLinks = [
    { href: "/zakelijk", label: "Overzicht" },
    { href: "/zakelijk#werkwijze", label: "Onze Werkwijze" },
    { href: "/projecten", label: "Projecten" },
  ];

  const overOnsLinks = [
      { href: "/over-ons", label: "Over ZON-ECN Installatietechniek" },
      { href: "/nieuws", label: "Nieuws" },
      { href: "/duurzaamheid", label: "Duurzaamheid" },
  ];

  const allLinksForMobile = [
    { label: "Home", href: "/" },
    { label: "Consument", href: "/consument", isTitle: true },
    ...consumentLinks.map(l => ({ ...l, isChild: true })),
    { label: "Zakelijk", href: "/zakelijk", isTitle: true },
    ...zakelijkLinks.map(l => ({ ...l, isChild: true })),
    { label: "Over Ons", href: "/over-ons", isTitle: true },
    ...overOnsLinks.map(l => ({ ...l, isChild: true })),
  ];


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-20 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Logo />
        </Link>
        
        <div className="flex-1 flex justify-end items-center">
          <nav className="hidden md:flex md:items-center md:gap-6 text-sm font-medium">
            <Link href="/" className={cn('transition-colors hover:text-primary', pathname === '/' ? 'text-primary' : 'text-foreground/80')}>Home</Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={cn(
                  "flex items-center gap-1 transition-colors hover:text-primary outline-none cursor-pointer p-0", 
                  pathname.startsWith('/consument') || pathname.startsWith('/storingen') || pathname.startsWith('/service') || pathname.startsWith('/tarieven') || pathname.startsWith('/warmtepomp-keuzehulp') ? 'text-primary' : 'text-foreground/80'
                )}>
                  Consument <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {consumentLinks.map(link => (
                   <DropdownMenuItem key={link.href} asChild>
                     <Link href={link.href}>{link.label}</Link>
                   </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={cn(
                  "flex items-center gap-1 transition-colors hover:text-primary outline-none cursor-pointer p-0", 
                  pathname.startsWith('/zakelijk') || pathname.startsWith('/projecten') ? 'text-primary' : 'text-foreground/80'
                )}>
                  Zakelijk <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {zakelijkLinks.map(link => (
                   <DropdownMenuItem key={link.href} asChild>
                     <Link href={link.href}>{link.label}</Link>
                   </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={cn(
                  "flex items-center gap-1 transition-colors hover:text-primary outline-none cursor-pointer p-0",
                  overOnsLinks.some(l => pathname.startsWith(l.href)) ? 'text-primary' : 'text-foreground/80'
                )}>
                  Over Ons <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {overOnsLinks.map(link => (
                   <DropdownMenuItem key={link.href} asChild>
                     <Link href={link.href}>{link.label}</Link>
                   </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        <div className="flex items-center gap-2 ml-6">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Zoeken" className="pl-10 w-48" />
          </div>
          <Button asChild>
            <Link href="/contact">Contact</Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
               <div className="p-4">
                 <Link href="/" className="mb-8 flex items-center">
                   <Logo />
                 </Link>
                 <nav className="grid gap-4 text-lg font-medium">
                   {allLinksForMobile.map((link, index) => (
                      <Link 
                        key={`${link.href}-${index}`} 
                        href={link.href} 
                        className={cn('transition-colors hover:text-primary', {
                          'font-bold text-foreground text-xl': link.isTitle,
                          'pb-0': link.isTitle,
                          'pt-0 pl-4': link.isChild,
                          'text-primary': pathname === link.href,
                          'text-muted-foreground': pathname !== link.href && !link.isTitle,
                        })}
                      >
                        {link.label}
                      </Link>
                   ))}
                 </nav>
                  <Button asChild className="mt-8 w-full">
                     <Link href="/contact">Contact</Link>
                   </Button>
               </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
