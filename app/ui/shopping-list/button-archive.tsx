import clsx from 'clsx';
import { ArchiveBoxArrowDownIcon } from '@heroicons/react/24/outline';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>
{
  children?: React.ReactNode;
}

export function ButtonArchive({ children, className, ...rest }: ButtonProps)
{
  return (
    <button
      { ...rest }
      className={ clsx(
        'flex h-6 items-center rounded-md bg-blue-500 px-2 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
        className,
      ) }
    >
      <ArchiveBoxArrowDownIcon className='w-4' />
      { children }
    </button>
  );
}
