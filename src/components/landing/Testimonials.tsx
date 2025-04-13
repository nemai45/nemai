import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Regular Customer",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100",
    content:
      "I've been using Unicorn Nails for months now, and I'm consistently impressed by the quality of artists on the platform. The booking process is seamless, and I love being able to see an artist's portfolio before making a decision.",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "First-time User",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100",
    content:
      "I surprised my wife with an at-home nail service for her birthday, and she was thrilled! The artist was professional, arrived on time, and did an amazing job. Will definitely use this platform again.",
    rating: 5,
  },
  {
    id: 3,
    name: "Jessica Martinez",
    role: "Nail Artist",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100",
    content:
      "As a nail artist, this platform has helped me grow my client base significantly. The booking system is user-friendly, and I appreciate how easy it is to showcase my portfolio and manage my schedule.",
    rating: 4,
  },
]

const Testimonials = () => {
  return (
    <section className="py-16 bg-unicorn-light/50" id="testimonials">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">What Our Users Say</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Real stories from people who have experienced the Unicorn Nails magic
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="unicorn-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{testimonial.name}</h3>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex text-amber-500">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-foreground italic">"{testimonial.content}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
