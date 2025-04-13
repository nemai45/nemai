import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

const HeroSection = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-unicorn-light -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-unicorn-pink/20 blur-3xl"></div>
        <div className="absolute top-1/2 -left-24 w-96 h-96 rounded-full bg-unicorn-purple/20 blur-3xl"></div>
        <div className="absolute -bottom-24 right-1/3 w-96 h-96 rounded-full bg-unicorn-blue/20 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col space-y-8">
            <div className="animate-float">
              <span className="inline-block py-1 px-3 rounded-full text-sm font-medium bg-unicorn-purple/10 text-unicorn-purple">
                ✨ Nail Art Marketplace
              </span>
              <h1 className="mt-4 text-2xl md:text-5xl lg:text-3xl font-bold tracking-tight">
                <span className="text-transparent text-6xl bg-clip-text bg-gradient-to-r from-unicorn-purple via-unicorn-pink to-unicorn-blue">
                  NéMai
                </span>
                <br />
                Connecting You to Beauty Experts✨
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground">
                Connect with talented nail artists and book your next magical expirence in just a few clicks.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth" className="unicorn-button inline-flex items-center justify-center">
                Book a Nail Artist
              </Link>
              <Link
                href="/auth"
                className="bg-white text-primary border border-primary rounded-full px-6 py-3 font-medium hover:bg-primary/5 transition-colors flex items-center justify-center"
              >
                Join as an Artist
              </Link>
            </div>

            <div className="relative mt-6 max-w-md">
              <div className="flex items-center bg-white rounded-full p-1 pl-5 shadow-md border border-unicorn-purple/20">
                <Search className="w-5 h-5 text-muted-foreground mr-2" />
                <input
                  type="text"
                  placeholder="Search for nail artists near you..."
                  className="bg-transparent flex-1 outline-none py-2 text-foreground"
                />
                <Button className="rounded-full bg-primary hover:bg-primary/90">Search</Button>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl bg-white p-2 shadow-xl border border-unicorn-purple/10 animate-float">
            <div className="aspect-square rounded-xl overflow-hidden relative">
              <img
                src="./hero.jpg"
                alt="Beautiful nail art"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
