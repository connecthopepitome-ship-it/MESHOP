import { repository } from '@/lib/api/googleSheetsRepository';
import HomeClient from './HomeClient';

export const revalidate = 60;

export default async function HomePage() {
  const allProducts = await repository.getProducts({});
  return <HomeClient initialProducts={allProducts} />;
}
