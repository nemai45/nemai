import HeroSection from "@/components/landing/HeroSection"
import FeaturedArtists from "@/components/landing/FeaturedArtists"
import HowItWorks from "@/components/landing/HowItWorks"
import Testimonials from "@/components/landing/Testimonials"
import CallToAction from "@/components/landing/CallToAction"
import { getFeaturedArtists } from "@/lib/user"
import Footer from "@/components/layout/Footer"

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
      {/* <Testimonials /> */}
      <CallToAction />
    </>
  )
}
