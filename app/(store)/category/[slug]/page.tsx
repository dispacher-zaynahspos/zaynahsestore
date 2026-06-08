import { redirect } from 'next/navigation';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryRedirectPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  
  // Redirect to the shop page with the category filter applied
  redirect(`/shop?category=${resolvedParams.slug}`);
}
