import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ProductSection from "@/components/ProductSection";
import Footer from "@/components/Footer";
import Effects from "@/components/Effects";
import { apps } from "@/data/apps";
import { isLocale } from "@/lib/i18n";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <>
      <Nav lang={lang} />
      <Hero lang={lang} />
      {apps.map((app) => (
        <ProductSection key={app.id} app={app} lang={lang} />
      ))}
      <Footer lang={lang} />
      <Effects />
    </>
  );
}
