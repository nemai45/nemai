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
      "Currently, NéMai is focused on helping clients in Surat find verified nail artists for services like gel nails, overlays, bridal nail art, and more. We’re expanding soon to other cities across India.",
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
      "With NéMai, there’s no DM waiting, no confusion, and no double bookings. You can instantly see artist availability, confirm your slot, and manage your bookings all in one place — DM-free and stress-free.",
  },
];

const Faq = () => {
  return (
    <section className="max-w-3xl mx-auto py-16 px-6 sm:px-8">
      <h2 className="text-4xl font-extrabold mb-10 text-center text-gray-900">
        Frequently Asked Questions
      </h2>
      <Accordion
        type="single"
        collapsible
        className="w-full divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white shadow-sm"
      >
        {faqData.map((faq, index) => (
          <AccordionItem key={index} value={`faq${index + 1}`}>
            <AccordionTrigger className="text-lg font-medium py-4 px-5 hover:bg-gray-50 transition rounded-md">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5 text-gray-700 text-sm leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default Faq;
