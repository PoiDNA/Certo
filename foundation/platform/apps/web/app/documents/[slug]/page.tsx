type Props = {
  params: Promise<{ slug: string }>;
};

export default async function DocumentPage({ params }: Props) {
  const { slug } = await params;
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 2rem' }}>
      <h1>{slug}</h1>
    </div>
  );
}
