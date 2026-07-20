import {
  Printer, FileText, Palette, Globe, Cpu, Info, CurrencyDollar,
} from "@phosphor-icons/react"
import { BRAND, BIZ } from "@/lib/brand"

export const TERMS_SECTIONS = [
  {
    icon: "Printer",
    colorLight: BRAND.blue,
    colorDark: BRAND.lightBlue,
    title: "Print Hub – Everything Paper",
    points: [
      { label: "Printing Services", text: "B&W, Colour, and Bulk printing. For bulk discounts, submit your entire order together." },
      { label: "Paper Types", text: "A4 paper in various gsm. Add lamination, paper-clipping or stapling." },
      { label: "Files & Proofing", text: "Submit files in PDF, DOCX, JPG, or PNG and proofread before sending — we're not responsible for errors in your original file." },
      { label: "Payment & Collection", text: "Large orders require full payment before collection. Laminated and bound items cannot be returned once completed." },
      { label: "Turnaround", text: "Same-day, no exceptions." },
    ],
  },
  {
    icon: "FileText",
    colorLight: BRAND.green,
    colorDark: BRAND.lightGreen,
    title: "Document Hub – All Document Work",
    points: [
      { label: "Document Assistance", text: "Full CV creation, typing, editing, and formatting. You are responsible for the accuracy of all content you provide." },
      { label: "Official Papers", text: "Affidavits, letters, and application documents typed to standard." },
      { label: "Confidentiality", text: "Sensitive personal information is handled with strict confidentiality at all times." },
      { label: "Submission", text: "Provide raw content and instructions in an editable format (DOCX, PDF, TXT) before work begins." },
      { label: "Turnaround", text: "Same-day, no exceptions." },
    ],
  },
  {
    icon: "Palette",
    colorLight: BRAND.orangeDark,
    colorDark: BRAND.lightOrange,
    title: "Design Hub – Creative Work",
    points: [
      { label: "Branding Design", text: "Logos and business cards built in Adobe Illustrator. No generic templates." },
      { label: "Marketing Designs", text: "Flyers, posters, banners, and social media templates custom-created from your brief." },
      { label: "Business Profile", text: "Full company profile documents, professionally branded and formatted for pitching, tenders, or registration." },
      { label: "Revisions & Ownership", text: "Revisions are limited to what's included in your package; extra rounds may cost more. Designs remain the property of ApexbytesHub until paid in full." },
      { label: "Approval", text: "Prompt approval of drafts is needed to keep your deadline on track. Final work is for legal, ethical use only." },
      { label: "Turnaround", text: "2–3 business days, no exceptions." },
    ],
  },
  {
    icon: "Globe",
    colorLight: BRAND.blueDark,
    colorDark: BRAND.lightBlue,
    title: "E-Service Hub – External Systems",
    points: [
      { label: "Government Services", text: `Admin help across SARS, SASSA, CSD, PSIRA, UIF, etc. ${BIZ.name} is not responsible for government processing delays.` },
      { label: "Document Completeness", text: "Applications only begin once all required documents are received, complete, and legible. Incomplete submissions are placed on hold." },
      { label: "OTP & Reachability", text: "You must be reachable during processing — OTPs expire within minutes and must be forwarded immediately." },
      { label: "Disclaimer", text: "We guide and submit on your behalf, but all personal information and consent is your responsibility. Final approval sits with the relevant government platform." },
      { label: "Payment", text: "Full payment is required before final confirmations, reference numbers, or results are released." },
      { label: "Turnaround", text: "Your application is submitted same-day to next-day. Government processing time after that varies and is outside our control." },
    ],
  },
  {
    icon: "Cpu",
    colorLight: BRAND.dark100,
    colorDark: BRAND.techGreyDark,
    title: "Tech Hub – Hardware & Software",
    points: [
      { label: "System Maintenance", text: "Software installations, cleaning, virus removal, and performance optimisation." },
      { label: "Data Backup", text: "Back up your important data before requesting service — ApexbytesHub is not responsible for data loss." },
      { label: "Access & Consent", text: "Devices must be available at the agreed time, charged and accessible. Remote sessions only proceed with your consent." },
      { label: "Turnaround", text: "Most services same-day. Virus/Malware Removal and OS Updates may take several hours. Windows Install & PC Setup: same-day to next-day. Troubleshooting: same-day, hours vary." },
    ],
  },
  {
    icon: "CurrencyDollar",
    colorLight: BRAND.dark100,
    colorDark: "#D4D4D8",
    title: "Payment Terms",
    points: [
      { label: "Standard Services", text: "Payable on execution. Clear, upfront pricing with no hidden fees." },
      { label: "Custom & Complex Work", text: "50% deposit to confirm order, balance on completion." },
      { label: "Walk-ins", text: "Cash preferred. Card and mobile money accepted." },
    ],
  },
  {
    icon: "Info",
    colorLight: BRAND.dark100,
    colorDark: "#D4D4D8",
    title: "General Terms",
    points: [
      { label: "Appointments", text: "Confirmed in advance; late arrival may mean rescheduling. Cancellations need 24-hour notice where possible." },
      { label: "Policy Changes", text: "ApexbytesHub may update services, pricing, or policy — clients will be notified." },
      { label: "Confidentiality", text: "Client data is kept confidential at all times and never shared without consent." },
      { label: "Disputes", text: "Handled respectfully; repeated non-compliance may result in service refusal." },
    ],
  },
]

export const ICON_COMPONENTS: Record<string, React.ElementType> = {
  Printer: Printer,
  FileText: FileText,
  Palette: Palette,
  Globe: Globe,
  Cpu: Cpu,
  CurrencyDollar: CurrencyDollar,
  Info: Info,
}
