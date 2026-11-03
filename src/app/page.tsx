import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-1 flex-col justify-center gap-4 px-4 py-24">
      <h1 className="text-4xl font-semibold">{siteConfig.name}</h1>
      <p className="text-lg">{siteConfig.baseline}</p>
    </main>
  );
}
