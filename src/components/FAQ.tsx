import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What is Float and who is it for?',
      answer: 'Float is an AI-powered workstream manager designed for freelancers and small teams. It replaces the need for hiring a manager, assistant, and accountant by helping you organize tasks, automate client follow-ups, and manage invoices—all in one affordable platform.'
    },
    {
      question: 'How secure is my data?',
      answer: 'Your data security is our top priority. Float uses enterprise-grade encryption, secure cloud infrastructure, and follows industry best practices for data protection. We never share your data with third parties and comply with GDPR and other privacy regulations.'
    },
    {
      question: 'Can I integrate Float with other tools?',
      answer: 'Yes! Float integrates with popular tools including Google Calendar, Slack, QuickBooks, Stripe, and many more. Our API also allows for custom integrations to fit your specific workflow needs.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Absolutely! We offer a 14-day free trial with full access to all Float features. No credit card required to get started. You can upgrade to a paid plan anytime during or after your trial period.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Everything you need to know about Float
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between focus:outline-none"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                  {faq.question}
                </h3>
                {openIndex === index ? (
                  <Minus className="text-blue-500 flex-shrink-0" size={24} />
                ) : (
                  <Plus className="text-gray-400 flex-shrink-0" size={24} />
                )}
              </button>
              {openIndex === index && (
                <div className="px-8 pb-6">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Still have questions?
          </p>
          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold">
            Contact our support team
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;