import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ProductSection from "@/components/ProductSection";
import Footer from "@/components/Footer";
import Effects from "@/components/Effects";
import { apps } from "@/data/apps";

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      {apps.map((app) => (
        <ProductSection key={app.id} app={app} />
      ))}
      <Footer />
      <Effects />
    </>
  );
}
