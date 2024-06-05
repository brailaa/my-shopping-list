'use client';

import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NotFound()
{
  return (
    <div className='gap-3 flex-col w-full h-screen flex items-center justify-center place-items-stretch'>
      <div className='text-lg'>
        <h2>Not found</h2>
      </div>
      <p>The requested page was not found</p>
      <div className='border rounded py-2 px-4'>
        <button
          className='flex flex-row items-center gap-2'
          onClick={ () =>
          {
            window.history.back();
          }
          }>
          <ArrowLeftIcon className="w-5" />
          <div>Back</div>
        </button>
      </div>
    </div>
  )
}
