import { Button } from "@/components/ui/button"
import { getUserRole } from "@/lib/get-user-role"
import { createClient } from "@/utils/supabase/server"
import Image from "next/image"
import Link from "next/link"
import SignoutButton from "../SignoutButton"

const Header = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser();
  const role = await getUserRole()
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-4">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="h-14 w-14" />
            <span className="font-bold text-[#66402B] text-3xl ">NéMai</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Home
          </Link>
          <Link href="/#featured-artists" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Featured Artists
          </Link>
          <Link href="/#how-it-works" className="transition-colors hover:text-foreground/80 text-foreground/60">
            How It Works
          </Link>
          <Link href="/#testimonials" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Testimonials
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="mr-2 hidden sm:block">
                <span className="text-sm text-muted-foreground">Hi, {user.email || "there"}!</span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={role === "artist" ? "/artist-dashboard" : (role === "admin" ? '/admin' : '/customer-dashboard')}>Dashboard</Link>
              </Button>
              <SignoutButton />
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth">Sign in</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
