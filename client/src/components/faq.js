import React, { useState } from "react";
import "../styles/faq.css";
import faq from "../Images/faq.png";

const data = [
  {
    question: "Can I filter jobs based on my skills or interests?",
    answer:
      "Yes! Use the advanced filter options to search based on skills, location, or specific technologies/roles."
  },
  {
    question: "How does the job application tracking work?",
    answer:
      "Once you apply to a job (via the external job portal), if you grant us permission to access your email (read-only, secure, and limited to job-related emails), we can automatically detect application updates, interview invites, and next round dates from your inbox, and update your job tracker accordingly.Alternatively, you can manually update the application status on our platform—such as Applied, Interview Scheduled, Offer Received, etc. You can also add notes like interview dates or round details."
  },
  {
    question: "What kind of suggestions will I get for my resume?",
    answer:
      "You'll get actionable tips like skills to highlight, formatting improvements, keyword suggestions, and how to tailor your experience to the job description."
  },
  {
    question: "Is my uploaded resume and job description data safe?",
    answer:
      "Yes, we prioritize your privacy. Your documents are securely processed and not shared with any third parties."
  },
  {
    question: "I found a bug or need help. How can I contact support?",
    answer:
      "You can reach us through the “Contact Us” page or by emailing support@[yourdomain].com."
  }
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="page-wrapper" id="faqs">
      {/* FAQ Section */}
      
      <div className="faq-section">
        {/* Heading aligned to the left and above */}
        <h1 className="faq-heading">FAQs</h1>

        {/* Content layout (Image + Questions) */}
        <div className="faq-layout">
          
        <div className="faq-image">
          <img src={faq} alt="faq" className="faq-image" />
          </div>
          <div className="faq-content">
            {data.map((item, idx) => (
              <div key={idx}>
                <div
                  className="faq-item"
                  onClick={() => setOpenIndex(idx === openIndex ? null : idx)}
                >
                  <span className="faq-question">{item.question}</span>
                  <span className="faq-icon">{openIndex === idx ? "-" : "+"}</span>
                </div>
                {openIndex === idx && (
                  <div className="faq-answer">{item.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
          
    </div>
  );
}

export default FAQ;
