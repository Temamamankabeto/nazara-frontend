import SimpleResourcePage from '@/components/common/simple-resource-page';
import { simpleResources } from '@/config/simple-resources';

export default function ProductsPage() {
  return <SimpleResourcePage config={simpleResources.products} />;
}
