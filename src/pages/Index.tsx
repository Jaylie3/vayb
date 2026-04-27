import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Differentiators } from "@/components/Differentiators";
import { FeaturedEvents } from "@/components/FeaturedEvents";
import { OrganiserCTA } from "@/components/OrganiserCTA";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Header overlay />
    <main>
      <Hero />
      <Differentiators />
      <FeaturedEvents />
      <OrganiserCTA />
    </main>
    <Footer />
  </div>
);

export default Index;
