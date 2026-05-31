'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "Is my chat data private?",
    answer: "Absolutely. Everything is processed 100% locally in your browser. Your chat file is never uploaded to any server. No one else will ever see your messages or stats unless you choose to share them yourself."
  },
  {
    question: "How do I export my WhatsApp chat?",
    answer: "Open WhatsApp, go to the chat you want to analyze, tap the three dots (⋮) or the name at the top, select 'More' > 'Export Chat' > 'Without Media'. Save the .txt file to your device and upload it here."
  },
  {
    question: "Does it work with group chats?",
    answer: "Yes! It works perfectly for both one-on-one personal chats and large group chats with many participants. For group chats, it will identify the most active members and provide stats for everyone."
  },
  {
    question: "What stats are sent to the AI for roasting?",
    answer: "Only anonymous numbers are sent to the AI: message counts, average message lengths, most active hours, response times, and top words (without context). Your actual message content and real names are never sent to any external service."
  },
  {
    question: "Why do I need to complete a captcha for roasts?",
    answer: "Generating AI roasts requires computational power. We use a simple captcha to prevent bot abuse and ensure the service remains free and fast for everyone."
  },
  {
    question: "Is this app free to use?",
    answer: "Yes, Burn Read is completely free and open-source. You can use it as many times as you want to analyze and roast your chats."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold inline-flex items-center gap-2">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="grid gap-3">
        {FAQS.map((faq, index) => (
          <div 
            key={index}
            className="group rounded-xl border border-border bg-card transition-all hover:border-muted overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 text-left gap-4"
            >
              <span className="font-semibold text-sm">{faq.question}</span>
              <ChevronDown 
                className={`w-4 h-4 text-muted transition-transform duration-300 ${
                  openIndex === index ? 'rotate-180 text-accent' : ''
                }`} 
              />
            </button>
            <div 
              className={`transition-all duration-300 ease-in-out ${
                openIndex === index 
                  ? 'max-h-40 opacity-100' 
                  : 'max-h-0 opacity-0'
              }`}
            >
              <p className="px-4 pb-4 text-xs sm:text-sm text-muted leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
