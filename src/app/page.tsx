import HeroSection from "@/components/landing/HeroSection"
import FeaturedArtists from "@/components/landing/FeaturedArtists"
import HowItWorks from "@/components/landing/HowItWorks"
import Testimonials from "@/components/landing/Testimonials"
import CallToAction from "@/components/landing/CallToAction"

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedArtists />
      <HowItWorks />
      <Testimonials />
      <CallToAction />
    </>
  )
}
