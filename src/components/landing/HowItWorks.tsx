import { Search, Calendar, Star } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Discover Artists",
    description:
      "Browse through hundreds of talented nail artists and find the perfect match for your style and budget.",
    color: "bg-unicorn-purple",
  },
  {
    icon: Calendar,
    title: "Book Appointment",
    description:
      "Choose your preferred date, time, and location. Get your nails done at a salon or in the comfort of your home.",
    color: "bg-unicorn-pink",
  },
  {
    icon: Star,
    title: "Enjoy & Rate",
    description: "Experience your magical nail transformation and share your feedback to help our community.",
    color: "bg-unicorn-blue",
  },
]

const HowItWorks = () => {
  return (
    <section className="py-16 bg-white" id="how-it-works">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">How Unicorn Nails Works</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Find and book your perfect nail artist in just three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center">
              {/* Connected line between steps */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-unicorn-purple/30 to-unicorn-pink/30"></div>
              )}

              <div
                className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center text-white mb-6 relative z-10`}
              >
                <step.icon className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-center text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
