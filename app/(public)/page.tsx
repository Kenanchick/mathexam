import { HeroContent } from "@/components/HeroContent/HeroContent";
import { PlatformBenefits } from "@/components/PlatformBenefits/PlatformBenefits";
import { AudienceSection } from "@/components/AudienceSection/AudienceSection";
import { StartPreparing } from "@/components/StartPreparing/StartPreparing";
import { Footer } from "@/components/Footer/Footer";

export default function Home() {
  return (
    <div className="">
      <HeroContent />
      <PlatformBenefits />
      <AudienceSection />
      <StartPreparing />
      <Footer />
    </div>
  );
}
