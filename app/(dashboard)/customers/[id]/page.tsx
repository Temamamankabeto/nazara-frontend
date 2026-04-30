import CustomerDetailPage from '@/components/dwms/customer-detail-page';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return <CustomerDetailPage customerId={id} />;
}
