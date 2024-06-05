import clsx from 'clsx';
import { TrashIcon } from '@heroicons/react/24/outline';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>
{
  children?: React.ReactNode;
}

export function ButtonDelete({ children, className, ...rest }: ButtonProps)
{
  return (
    <button
      { ...rest }
      className={ clsx(
        'border-red-500 disabled:border-gray-300 border flex h-6 items-center rounded-md bg-gray-100 disabled:bg-gray-300 px-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 active:bg-red-600 active:text-white text-red-600 disabled:text-white transition-colors hover:text-white hover:bg-red-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
        className,
      ) }
    >
      <TrashIcon className='w-4' />
      { children }
    </button>
  );
}
