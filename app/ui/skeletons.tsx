import { ButtonEdit } from "./button-edit";
import { ButtonArchive } from "./shopping-list/button-archive";

/** Skeleton for Shooping List page */
export function ShoppingListSkeleton()
{
  return (
    <div>
      <h2 className="border-b">Loading Shopping List...</h2>
      <div className="flex flex-col 2xs:flex-row items-start gap-1 my-1 border-b pb-1">
        <ButtonArchive>Archive</ButtonArchive>
        <ButtonEdit>Edit</ButtonEdit>
        <h4 className="text-sm">
          2024-01-01 | loading...
        </h4>
      </div>
    </div>
  )
}

/** Skeleton for Archive page */
export function ArchiveSkeleton()
{
  return (
    <div>
      <h2 className="border-b">Loading Archive...</h2>
      <table>
        <thead className="text-left text-sm font-normal bg-gray-600 text-white">
          <tr
            className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
          >
            <th>Date</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>...</td>
            <td>...</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

/** Skeleton for Archive Details */
export function ArchiveDetailsSkeleton()
{
  return (
    <div>
      <h2 className="border-b">Loading Archive Details...</h2>
      <div className="border-b">
        <p>...</p>
        <p>...</p>
      </div>
      <div className="border rounded-md overflow-hidden mt-1">
        <table className="w-full text-gray-900 bg-gray-100">
          <thead className="text-left text-sm font-normal bg-gray-600 text-white">
            <tr>
              <th className='px-2'>Product</th>
              <th>Quantity</th>
              <th className='pl-2'></th>
            </tr>
          </thead>
          <tbody>
            <tr
              className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
            >
              <td className='px-2'>...</td>
              <td className='text-right'>...</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Skeleton for Categories page */
export function CategoriesSkeleton()
{
  return (
    <div>
      <h2 className="border-b">Loading Categories...</h2>
      <table>
        <thead className="text-left text-sm font-normal bg-gray-600 text-white">
          <tr
            className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
          >
            <th>Name</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>...</td>
            <td>...</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

/** Skeleton for Category Details page */
export function CategoryDetaisSkeleton()
{
  return (
    <div>
      <h2 className="border-b">Loading Category Details...</h2>
      <table>
        <thead className="text-left text-sm font-normal bg-gray-600 text-white">
          <tr
            className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
          >
            <th>Products</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>...</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

/** Skeleton for Categories page */
export function ProductsSkeleton()
{
  return (
    <div>
      <h2 className="border-b">Loading Products...</h2>
      <table>
        <thead className="text-left text-sm font-normal bg-gray-600 text-white">
          <tr
            className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
          >
            <th>Name</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>...</td>
            <td>...</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}