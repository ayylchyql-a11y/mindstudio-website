import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ProductSection from "@/components/ProductSection";
import Footer from "@/components/Footer";
import Effects from "@/components/Effects";
import JsonLd from "@/components/JsonLd";
import { apps } from "@/data/apps";
import { isLocale } from "@/lib/i18n";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Mind Studio",
    url: "https://mindstudioapps.com",
    logo: "https://mindstudioapps.com/logo.svg",
    description:
      "A one-person app workshop making small, honest apps for iPhone.",
    email: "ayylchyql@gmail.com",
  };
  const appsLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: apps.map((app, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://mindstudioapps.com/${lang}/apps/${app.id}`,
      name: app.name,
    })),
  };

  return (
    <>
      <JsonLd data={orgLd} />
      <JsonLd data={appsLd} />
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
