import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is PresentIQ really free?",
    a: "Yes, PresentIQ is completely free to use. There are no hidden fees, no subscriptions, and no credit card required. Just open the app and start practicing.",
  },
  {
    q: "How accurate is the AI analysis?",
    a: "Our AI is trained on millions of hours of professional speeches and achieves over 95% accuracy in detecting filler words, pacing, and tone. It's constantly learning and improving.",
  },
  {
    q: "Do I need a special microphone or camera?",
    a: "No! Any standard laptop microphone or webcam works perfectly. For the best results, we recommend recording in a quiet environment.",
  },
  {
    q: "Is my speech data private?",
    a: "Absolutely. All recordings are encrypted end-to-end and stored securely. We never share your data with third parties, and you can delete your recordings at any time.",
  },
  {
    q: "Can I use PresentIQ for languages other than English?",
    a: "Currently, PresentIQ fully supports English with plans to expand to Spanish, French, Mandarin, and more languages in 2026.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="bg-card py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-foreground md:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mb-10 text-center text-muted-foreground">Got questions? We've got answers.</p>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="rounded-lg border border-border bg-background px-5 transition-all duration-200">
                <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
