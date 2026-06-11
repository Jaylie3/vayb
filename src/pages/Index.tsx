import { Helmet } from "react-helmet-async";
import { Hero } from "@/components/Hero";
import { Differentiators } from "@/components/Differentiators";
import { FeaturedEvents } from "@/components/FeaturedEvents";
import { OrganiserCTA } from "@/components/OrganiserCTA";

const SITE_URL = "https://quick-event-go.lovable.app";

const Index = () => (
  <>
    <Helmet>
      <title>Vayb — Discover Events & Buy Tickets in South Africa</title>
      <meta
        name="description"
        content="Discover concerts, festivals & sports across South Africa. Mobile-first ticketing with WhatsApp delivery, low fees and same-day organiser payouts."
      />
      <link rel="canonical" href={`${SITE_URL}/`} />
      <meta property="og:title" content="Vayb — Discover Events & Buy Tickets in South Africa" />
      <meta
        property="og:description"
        content="Mobile-first ticketing. WhatsApp delivery. Lower fees. Same-day payouts for organisers."
      />
      <meta property="og:url" content={`${SITE_URL}/`} />
      <meta property="og:type" content="website" />
    </Helmet>
    <Hero />
    <Differentiators />
    <FeaturedEvents />
    <OrganiserCTA />
  </>
);

export default Index;
