import Image from 'next/image';

const Logo = () => {
  return (
    <Image
      src="/zon-ecn_logo_nieuw.png"
      alt="ZON-ECN Installatietechniek Logo"
      width={117}
      height={26}
      priority
    />
  );
};

export default Logo;
