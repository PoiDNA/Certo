type Props = {
  params: Promise<{ slug: string }>;
};

export default async function DocumentPage({ params }: Props) {
  const { slug } = await params;
  return (
    <div className="py-8">
      <div className="mb-12 border-b-[3px] border-certo-gold pb-6">
        <h1 className="text-4xl font-serif font-bold text-certo-navy tracking-tight">{slug}</h1>
      </div>
    </div>
  );
}
