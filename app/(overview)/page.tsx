import { Metadata } from 'next';
import ShoppingListClient from '@/app/ui/shopping-list/client';
import { fetchCategories, fetchProducts, fetchShoppingList } from '../lib/data';
import Error from '@/app/error';
import { Category, Product, ShoppingList, ShoppingListRow } from '../lib/definitions';

export const metadata: Metadata = {
  title: 'Shopping List'
};

export default async function Page()
{
  const dataCat = await fetchCategories();
  if (dataCat === null || dataCat.success === false || dataCat.values === undefined) {
    //we got an error
    const error = {
      name: 'Error',
      message: (dataCat && dataCat.errors?.general ? dataCat.errors.general : 'Error')
    };
    return <Error error={ error } />
  }
  const categories = dataCat.values as Category[];
  const dataProd = await fetchProducts(categories);
  if (dataProd === null || dataProd.success === false || dataProd.values === undefined) {
    //we got an error
    const error = {
      name: 'Error',
      message: (dataProd && dataProd.errors?.general ? dataProd.errors.general : 'Error')
    };
    return <Error error={ error } />
  }
  const products = dataProd.values as Product[];
  const dataList = await fetchShoppingList(products);
  if (dataList === null || dataList.success === false || dataList.values === undefined) {
    //we got an error
    const error = {
      name: 'Error',
      message: (dataProd && dataProd.errors?.general ? dataProd.errors.general : 'Error')
    };
    return <Error error={ error } />
  }
  const [shoppingList, rows] = dataList.values as [ShoppingList, ShoppingListRow[]];

  return (
    <div>
      <ShoppingListClient
        initialList={ shoppingList }
        initialRows={ rows }
        products={ products }
        categories={ categories }
      />
    </div>
  );
}
