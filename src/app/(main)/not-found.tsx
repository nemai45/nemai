import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UnicornIcon } from "@/components/CustomIcons"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-unicorn-light">
      <div className="text-center p-8 max-w-md">
        <UnicornIcon className="w-24 h-24 mx-auto mb-6" />
        <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-unicorn-purple via-unicorn-pink to-unicorn-blue">
          404
        </h1>
        <p className="text-xl text-foreground mb-6">Oops! This page seems to have vanished like magic</p>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved to another nail dimension.
        </p>
        <Link href="/">
          <Button className="unicorn-button">Return to Home</Button>
        </Link>
      </div>
    </div>
  )
}
