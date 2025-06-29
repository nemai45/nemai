import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    question: "How can I book a nail artist online?",
    answer:
      "You can book your preferred nail artist instantly through NéMai. Just select your service (like nail extensions or gel polish), pick a time slot, and confirm with a small token payment — all in a few clicks.",
  },
  {
    question: "Is NéMai only for nail services in Surat?",
    answer:
      "Currently, NéMai is focused on helping clients in Surat find verified nail artists for services like gel nails, overlays, bridal nail art, and more. We're expanding soon to other cities across India.",
  },
  {
    question: "What types of nail services can I book on NéMai?",
    answer:
      "NéMai lets you book a range of services, including nail extensions, gel polish, overlays, French tips, minimalist nail art, and custom designs — all from verified professionals.",
  },
  {
    question: "Can I choose my nail artist and see their work before booking?",
    answer:
      "Yes! Each nail artist on NéMai has a profile where you can view their portfolio, reviews, pricing, and available time slots — so you know exactly what you're booking.",
  },
  {
    question: "Is the payment I make on NéMai the full price?",
    answer:
      "No — the amount you pay online is a *token advance* to secure your appointment. The final price may vary at the time of service, based on the design or custom nail art you select.",
  },
  {
    question: "Is NéMai a safe and trusted platform?",
    answer:
      "Absolutely. NéMai only features verified nail artists with real work samples and client feedback. Your booking and payment process is secure and designed for a smooth beauty experience.",
  },
  {
    question: "Why is NéMai better than booking through Instagram or WhatsApp?",
    answer:
      "With NéMai, there's no DM waiting, no confusion, and no double bookings. You can instantly see artist availability, confirm your slot, and manage your bookings all in one place — DM-free and stress-free.",
  },
];

const Faq = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Everything you need to know about booking nail artists on NéMai
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <Accordion
            type="single"
            collapsible
            className="w-full"
          >
            {faqData.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`faq${index + 1}`}
                className="border-b border-gray-100 last:border-b-0"
              >
                <AccordionTrigger className="text-left text-base sm:text-lg font-semibold my-6 px-6 sm:px-8 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all duration-300 text-gray-800 group">
                  <span className="pr-4 mb-2 leading-relaxed group-hover:text-purple-700 transition-colors">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 sm:px-8 pb-6 text-gray-600 text-sm sm:text-base leading-relaxed">
                  <div className="pt-2 border-t border-gray-50">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default Faq;