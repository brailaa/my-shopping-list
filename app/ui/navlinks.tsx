'use client';

import
{
  CircleStackIcon,
  Bars3Icon,
  RectangleStackIcon,
  ArchiveBoxIcon,
  ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: 'List', href: '/', icon: Bars3Icon },
  { name: 'Categories', href: '/categories', icon: RectangleStackIcon },
  { name: 'Products', href: '/products', icon: CircleStackIcon },
  { name: 'Archive', href: '/archive', icon: ArchiveBoxIcon },
  { name: 'Toaster', href: '/toaster', icon: ChatBubbleLeftEllipsisIcon }
];

export default function NavLinks()
{
  const pathname = usePathname();
  return (
    <>
      { links.map((link) =>
      {
        const LinkIcon = link.icon;
        return (
          <Link
            key={ link.name }
            href={ link.href }
            className={
              "flex h-6 sm:h-12 grow items-center justify-center gap-1 md:gap-2 rounded-md p-1 md:p-2 text-sm font-medium md:justify-start " +
              (pathname === link.href
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 bg-gray-50 hover:bg-blue-400 hover:text-white'
              )
            }
          >
            <LinkIcon className="w-4 md:w-6" />
            <p>{ link.name }</p>
          </Link>
        );
      }) }
    </>
  );
}
