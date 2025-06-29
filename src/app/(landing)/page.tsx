import CallToAction from "@/components/landing/CallToAction"
import Faq from "@/components/landing/Faq"
import FeaturedArtists from "@/components/landing/FeaturedArtists"
import HeroSection from "@/components/landing/HeroSection"
import HowItWorks from "@/components/landing/HowItWorks"
import { getFeaturedArtists } from "@/lib/user"

export default async function Home() {
  const result = await getFeaturedArtists();
  if ('error' in result) {
    return <div>{result.error}</div>
  }
  const artists = result.data;
  return (
    <>
      <HeroSection />
      <FeaturedArtists artists={artists} />
      <HowItWorks />
      <Faq />
      <CallToAction />
    </>
  )
}
