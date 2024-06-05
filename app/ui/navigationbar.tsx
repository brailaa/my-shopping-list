import Link from 'next/link';
import NavLinks from '@/app/ui/navlinks';

export default function NavigationBar()
{
  return (
    <div className="grid grid-cols-2 xs:flex grow xs:flex-row justify-between gap-1">
      <NavLinks />
    </div>
  );
}