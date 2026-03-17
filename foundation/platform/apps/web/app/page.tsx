export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 md:py-24">
      {/* Decorative separator */}
      <div className="flex items-center justify-center mb-8 w-full max-w-xs gap-4">
        <div className="h-[1px] w-full bg-certo-gold"></div>
        <div className="h-2 w-2 rounded-full bg-certo-gold-light"></div>
        <div className="h-[1px] w-full bg-certo-gold"></div>
      </div>

      <h1 className="text-4xl md:text-6xl font-serif font-bold text-certo-navy mb-6 tracking-tight">
        Certo Governance Institute
      </h1>
      
      <p className="text-lg md:text-xl text-certo-navy/80 mb-12 max-w-2xl leading-relaxed">
        Certo jest pierwszą na świecie agencją ratingową, której ratingi są kryptograficznymi artefaktami procesu — nie opiniami. Każda decyzja ratingowa jest zakotwiczona poza własną infrastrukturą, weryfikowalna offline i publicznie audytowalna.
      </p>

      {/* Another decorative separator below */}
      <div className="flex items-center justify-center mt-20 w-full max-w-lg gap-4 opacity-50">
        <div className="h-[1px] w-full bg-certo-navy/20"></div>
        <div className="w-4 h-4 border border-certo-gold rotate-45"></div>
        <div className="h-[1px] w-full bg-certo-navy/20"></div>
      </div>
    </div>
  );
}
