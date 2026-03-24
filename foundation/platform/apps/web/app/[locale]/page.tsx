import { locales } from '@certo/i18n/config';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import HeroSection from '../../components/home/HeroSection';
import WhySection from '../../components/home/WhySection';
import PhotoDivider from '../../components/home/PhotoDivider';
import PillarsPreview from '../../components/home/PillarsPreview';
import FactDeNoiserSection from '../../components/home/FactDeNoiserSection';
import BenefitsSection from '../../components/home/BenefitsSection';
import PilotCTA from '../../components/home/PilotCTA';
import { images } from '../../lib/images';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Home' });

  return (
    <div className="w-full">
      <HeroSection />
      <WhySection />
      <PhotoDivider
        imageUrl={images.dividerParliament}
        alt="Panorama europejskiego budynku instytucjonalnego"
      />
      <PillarsPreview />
      <FactDeNoiserSection />
      <BenefitsSection />
      <PhotoDivider
        imageUrl={images.dividerCollaboration}
        alt="Profesjonaliści przy stole roboczym w atmosferze współpracy"
        height="h-48 md:h-80"
      />
      <PilotCTA />
    </div>
  );
}
