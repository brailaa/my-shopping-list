import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>
{
  children?: React.ReactNode;
}

export function CancelButton({ children, className, ...rest }: ButtonProps)
{
  return (
    <button
      { ...rest }
      type='reset'
      className={ clsx(
        'flex h-10 items-center rounded-lg text-white bg-gray-500 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
        className,
      ) }
    >
      Cancel
    </button>
  );
}
