import { Metadata } from 'next';
import Link from 'next/link';
import { RectangleStackIcon } from '@heroicons/react/24/outline';
import Form from '@/app/ui/categories/create-form';

export const metadata: Metadata = {
    title: 'Create Category'
};

export default async function Page()
{
    return (
        <div>
            <h2 className="border-b flex flex-row gap-1 mb-1">
                <Link href="/categories" className='text-blue-500 flex flex-row gap-1'>
                    <RectangleStackIcon className='w-4' />
                    Categories
                </Link>
                &gt; Create Category
            </h2>
            <Form />
        </div>
    );
}