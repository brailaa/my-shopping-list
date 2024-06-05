import { Metadata } from 'next';
import { fetchCategories, fetchProducts } from '../lib/data';
import { Category, Product } from '../lib/definitions';
import Error from '@/app/error';
import ProductsManager from '../ui/products/client';

export const metadata: Metadata = {
  title: 'Products'
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

  return <ProductsManager products={ products } categories={ categories } />
}
