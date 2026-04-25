import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Differentiators } from "@/components/Differentiators";
import { Categories } from "@/components/Categories";
import { FeaturedEvents } from "@/components/FeaturedEvents";
import { OrganiserCTA } from "@/components/OrganiserCTA";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main>
      <Hero />
      <Differentiators />
      <Categories />
      <FeaturedEvents />
      <OrganiserCTA />
    </main>
    <Footer />
  </div>
);

export default Index;
