import Hero from "@/components/Hero";
import ExploreSection from "@/components/explore/ExploreSection";
import ResourceSection from "@/components/resources/ResourceSection";
import FaqSection from "@/components/faq/FaqSection";
import FooterSection from "@/components/footer/FooterSection";

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-[#111113] text-white selection:bg-[#00D688] selection:text-black">
      <Hero />
      <ExploreSection />
      <ResourceSection />
      <FaqSection />
      <FooterSection />
    </main>
  );
}
