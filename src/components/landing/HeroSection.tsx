import { getUserRole } from "@/lib/get-user-role"
import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import Image from "next/image"

const HeroSection = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const role = await getUserRole()

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
              <Link href={`${role === "customer" ? "/customer-dashboard/" : (role === "artist" ? "/artist-dashboard/" : "/login")}`} className="unicorn-button inline-flex items-center justify-center">
                Book a Nail Artist
              </Link>
            </div>
          </div>

          <div className="relative rounded-2xl bg-white p-2 shadow-xl border border-unicorn-purple/10 animate-float">
            <div className="aspect-square rounded-xl overflow-hidden relative">
              <Image
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
