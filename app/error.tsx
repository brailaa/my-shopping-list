'use client';

import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset?: () => void
})
{
  useEffect(() =>
  {
    console.error(error)
  }, [error])

  return (
    <div className='gap-3 flex-col w-full h-screen flex items-center justify-center place-items-stretch'>
      <div className='text-lg'>
        <h2>Oops! Something went wrong!</h2>
      </div>
      <p>{ error.message }</p>
      {
        reset === undefined
          ? null
          :
          <div className='border rounded py-2 px-4'>
            <button
              className='flex flex-row items-center gap-2'
              onClick={ reset ? () => reset() : undefined }
            >
              <ArrowPathIcon className="w-5" />
              <div>Try again</div>
            </button>
          </div>
      }
    </div>
  )
}