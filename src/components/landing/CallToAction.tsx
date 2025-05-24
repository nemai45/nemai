import Link from "next/link"

const CallToAction = () => {
  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-unicorn-gradient -z-10 opacity-90"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-unicorn-pink/20 blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-unicorn-purple/20 blur-3xl"></div>

      <div className="container mx-auto px-4 max-w-5xl relative">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-xl border border-white/30">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready for Your Nail Transformation?</h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers and talented nail artists on our platform. Sign up today and
              experience the magic!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="unicorn-button inline-flex items-center justify-center">
                Book Your First Appointment
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CallToAction
