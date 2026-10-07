import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ScaleSection from "@/components/ScaleSection";
import ClaimStrip from "@/components/ClaimStrip";
import Industries from "@/components/Industries";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Facility from "@/components/Facility";
import Quality from "@/components/Quality";
import CaseStudies from "@/components/CaseStudies";
import QuoteExperience from "@/components/QuoteExperience";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <ScaleSection />
        <ClaimStrip />
        <Industries />
        <Services />
        <Process />
        <Facility />
        <Quality />
        <CaseStudies />
        <QuoteExperience />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
