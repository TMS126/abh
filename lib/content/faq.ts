import { BIZ } from "../business/info"

export const FAQS = [
  {
    question: "How do I send my files, photos, or CV information to you?",
    answer:
      "All services connect via WhatsApp where you can upload documents, notes, or images directly.",
  },
  {
    question: "Where do I collect my completed documents or prints?",
    answer: `${BIZ.name} operates from ${BIZ.location}. We notify you when items are ready for collection.`,
  },
  {
    question: "How long does it take to complete a design or document task?",
    answer:
      "Most basic tasks are same-day. Custom design work takes 24–48 hours depending on complexity.",
  },
  {
    question: "What are your payment terms?",
    answer:
      "Clear upfront pricing. Payment is required before or upon completion depending on service type.",
  },
  {
    question: "Do you use templates for design projects?",
    answer:
      "No. All design work is custom-built using professional design tools.",
  },
] as const
