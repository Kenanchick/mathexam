import { LeftSideBlock } from "./LeftSideBlock/LeftSideBlock";
import { ContentBlock } from "../ContentBlock/ContentBlock";
import { MathBg } from "../MathBg/MathBg";

export const HeroContent = () => {
  return (
    <section className="relative min-h-[calc(100vh-64px)] overflow-hidden pt-16">
      <MathBg />

      <div className="relative z-10 mx-auto grid w-full max-w-[1480px] grid-cols-[580px_820px] items-start justify-between px-6">
        <LeftSideBlock />

        <div className="w-[820px]">
          <ContentBlock />
        </div>
      </div>
    </section>
  );
};
