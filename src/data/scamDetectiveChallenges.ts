import { ScamDetectiveChallenge } from '../types/cyber.ts';

export const SCAM_DETECTIVE_CHALLENGES: ScamDetectiveChallenge[] = [
  {
    id: 'det-sbi-email',
    title: 'Deceptive NetBanking Freeze Alert',
    domain: 'email',
    scenarioType: 'Banking Credential Harvest',
    senderDisplay: 'State Bank Security <alert-notice@sbi-security-verify.click>',
    timestampDisplay: 'Today, 08:42 AM',
    subject: 'URGENT: NetBanking Access Suspended — Verify KYC in 2 Hours',
    bodyContent: `Dear Valued SBI Customer,

Your State Bank NetBanking and linked Debit Card services have been temporarily suspended due to non-updation of mandatory PAN-Aadhaar linkage.

To prevent permanent account deactivation and avoid a penalty fee of ₹1,500, you are strictly required to verify your credentials immediately.

👉 Visit our Secure Verification Portal: http://sbi-netbanking-kyc-update.click/login

Please keep your NetBanking User ID, Profile Password, and registered mobile phone ready to submit the verification OTP.

Sincerely,
Security Operations Cell
State Bank of India Corporate Centre, Mumbai`,
    context: 'Received in your personal email inbox early on a Monday morning.',
    indicators: [
      {
        id: 'ind-1',
        text: 'Suspicious sender domain ending in .click (<alert-notice@sbi-security-verify.click>)',
        explanation: 'Official State Bank of India communications originate strictly from @sbi.co.in or @onlinesbi.sbi. Domains ending in .click are disposable domains used by phishing syndicates.',
        severity: 'critical',
        isRedFlag: true,
        category: 'Counterfeit Domain',
      },
      {
        id: 'ind-2',
        text: 'Artificial countdown pressure: "in 2 Hours" & "avoid ₹1,500 penalty"',
        explanation: 'Scammers manufacture strict deadlines and monetary threats to provoke panic, preventing victims from calmly verifying through authentic banking apps.',
        severity: 'high',
        isRedFlag: true,
        category: 'Psychological Panic Trigger',
      },
      {
        id: 'ind-3',
        text: 'Unencrypted HTTP link (http://sbi-netbanking-kyc-update.click/login)',
        explanation: 'Legitimate financial portals mandate HTTPS with registered commercial certificates. Also, the domain itself is a lookalike clone registered on .click.',
        severity: 'critical',
        isRedFlag: true,
        category: 'Insecure Phishing Destination',
      },
      {
        id: 'ind-4',
        text: 'Asking for Profile Password and One-Time Password (OTP) in advance',
        explanation: 'Banks repeatedly advise that customer care and security staff will NEVER ask for profile passwords or OTPs for routine KYC updates.',
        severity: 'critical',
        isRedFlag: true,
        category: 'Credential Exfiltration',
      },
      {
        id: 'ind-5',
        text: 'Generic greeting: "Dear Valued SBI Customer" without your registered name or masked account number',
        explanation: 'Mass phishing kits broadcast generic greetings because attackers do not possess your name or legitimate account records.',
        severity: 'medium',
        isRedFlag: true,
        category: 'Generic Salutation',
      },
      {
        id: 'ind-decoy-1',
        text: 'Email mentions Mumbai Corporate Centre address in the footer',
        explanation: 'Scammers regularly copy public corporate addresses from Wikipedia or official websites to create a false aura of legitimacy.',
        severity: 'medium',
        isRedFlag: false,
        category: 'Decoy Authenticity Clue',
      },
    ],
    officialVerificationMethod: 'Log into your official YONO SBI mobile app or visit https://www.onlinesbi.sbi directly to check KYC status. Never click email links.',
    safeNextSteps: [
      'Do not click the link or reply to the email.',
      'Forward the phishing email to report.phishing@sbi.co.in.',
      'Mark the email as Phishing/Spam in your email provider.',
      'Check your actual bank status inside the official YONO app or contact your home branch.',
    ],
  },
  {
    id: 'det-wa-job',
    title: 'High-Yield Remote Telegram Task Scam',
    domain: 'whatsapp',
    scenarioType: 'Prepaid Task Investment Fraud',
    senderDisplay: '+62 838 9120 4491 (HR Priya - Global Media Partners)',
    timestampDisplay: 'Yesterday, 14:15 PM',
    bodyContent: `Hello! 🌸 I am Priya from Global Media Partners India.

We reviewed your CV on job portals and selected you for our VIP Part-Time Work-From-Home project!

💼 Job Description: Simply LIKE and SUBSCRIBE to 3 YouTube videos per batch.
💰 Daily Salary: ₹2,500 – ₹7,500 (Instant UPI credit).
⏰ Flexible Time: Only 15–20 minutes daily from your phone.

We already credited ₹150 trial bonus to your phone number! To claim and start your first paid assignment, join our Telegram Manager immediately:
👉 https://t.me/GlobalTask_VIP_Manager

No experience required! Limited slots available for today!`,
    context: 'Unsolicited WhatsApp direct message received from an unfamiliar country code (+62 Indonesia).',
    indicators: [
      {
        id: 'wa-ind-1',
        text: 'Foreign country code prefix (+62 Indonesia) claiming to be an Indian recruitment agency',
        explanation: 'Fraud syndicates operate international virtual VoIP numbers (+62, +84, +234, +44) to evade local Indian telecom caller ID tracing.',
        severity: 'critical',
        isRedFlag: true,
        category: 'Geographic Spoofing',
      },
      {
        id: 'wa-ind-2',
        text: 'Unrealistic pay for trivial effort (₹2,500–₹7,500 daily for liking YouTube videos)',
        explanation: 'No legitimate corporate marketing agency pays thousands of rupees for simply liking public videos. High returns for menial tasks is the signature lure of task scams.',
        severity: 'critical',
        isRedFlag: true,
        category: 'Unrealistic Financial Incentive',
      },
      {
        id: 'wa-ind-3',
        text: 'Redirecting the conversation to anonymous Telegram coordinator handles',
        explanation: 'Scammers shift victims to Telegram because it allows anonymous channels, automated group bots, and deletes chats with zero traceability.',
        severity: 'high',
        isRedFlag: true,
        category: 'Channel Migration to Telegram',
      },
      {
        id: 'wa-ind-4',
        text: 'Claiming to have "already credited ₹150 trial bonus" to build false trust',
        explanation: 'This psychological bait gives the victim a feeling of reciprocation and lowers skepticism before demanding ₹5,000+ deposits for VIP tasks later.',
        severity: 'high',
        isRedFlag: true,
        category: 'Reciprocation Trap',
      },
      {
        id: 'wa-decoy-1',
        text: 'Message mentions "Flexible Time: Only 15–20 minutes daily"',
        explanation: 'While appealing, legitimate freelance jobs require contracts, tax forms, and genuine work rather than 15-minute video clicks.',
        severity: 'medium',
        isRedFlag: false,
        category: 'Job Description Text',
      },
    ],
    officialVerificationMethod: 'Legitimate employers never recruit unsolicited candidates via WhatsApp from overseas numbers. Verify open openings directly on company career portals.',
    safeNextSteps: [
      'Do not tap the Telegram link or join the group.',
      'Tap the contact info, select "Report and Block" on WhatsApp.',
      'Report the phone number to DoT Chakshu at sancharsaathi.gov.in.',
      'Never send bank details or accept "trial payouts" from unknown syndicates.',
    ],
  },
  {
    id: 'det-sms-elec',
    title: 'Urgent Electricity Disconnection Warning',
    domain: 'sms',
    scenarioType: 'Screen-Sharing Remote Trojan',
    senderDisplay: '+91 98321 09842 (Unregistered 10-Digit Mobile Number)',
    timestampDisplay: 'Today, 19:12 PM',
    bodyContent: `Dear Consumer,
Your Electricity Power connection will be disconnected tonight at 9:30 PM from the Bijli substation because your previous month bill was not updated in system.

To avoid power cutoff, immediately contact our State Electricity Officer Mr. RK Sharma at mobile 9832109842 or pay ₹15 server update fee at http://bit.ly/bijli-bill-update.

- Urja Vibhag / Electricity Department`,
    context: 'Arrives as an SMS text message on your phone at 7:12 PM while you are with family at home.',
    indicators: [
      {
        id: 'sms-ind-1',
        text: 'Sent from an ordinary 10-digit mobile number (+91 98321...) instead of registered utility header',
        explanation: 'State power distribution companies (BSES, Tata Power, BESCOM, Mahavitaran) send notices strictly through registered DLT alphanumeric headers (e.g. TA-TNEB, VM-BSESDL).',
        severity: 'critical',
        isRedFlag: true,
        category: 'Fake Sender ID',
      },
      {
        id: 'sms-ind-2',
        text: 'Threat of same-night disconnection within 2 hours without statutory formal notice',
        explanation: 'Electricity boards are legally required to issue written 15-day disconnection notices on physical paper bills. Sudden 2-hour threats are manufactured panic tactics.',
        severity: 'critical',
        isRedFlag: true,
        category: 'Acute Disruption Panic',
      },
      {
        id: 'sms-ind-3',
        text: 'Directing you to call a personal cell number instead of official toll-free customer care',
        explanation: 'Calling the phone number connects you directly to a cyber criminal who instructs you to install AnyDesk or TeamViewer to steal banking credentials.',
        severity: 'critical',
        isRedFlag: true,
        category: 'Rogue Helpline Impersonation',
      },
      {
        id: 'sms-ind-4',
        text: 'Cloaked URL shortener link: http://bit.ly/bijli-bill-update',
        explanation: 'Government utilities host payment portals on secure .gov.in or official licensed company domains, never unverified Bitly shorteners.',
        severity: 'high',
        isRedFlag: true,
        category: 'Masked URL Shortener',
      },
      {
        id: 'sms-decoy-1',
        text: 'Signed as "- Urja Vibhag / Electricity Department"',
        explanation: 'Generic government department titles are tagged at the end of scam SMS messages to deceive citizens.',
        severity: 'medium',
        isRedFlag: false,
        category: 'Decoy Department Tag',
      },
    ],
    officialVerificationMethod: 'Open your state electricity board consumer mobile app (e.g. BESCOM Mithra, Tata Power) or visit their official .gov.in portal to check real bill ledger status.',
    safeNextSteps: [
      'Do not call the mobile number or click the Bitly link.',
      'Check your actual bill status in your utility consumer app or bank billpay section.',
      'Report the mobile number as spam on your device.',
      'Report the fraudulent attempt to National Cyber Crime portal (1930 / cybercrime.gov.in).',
    ],
  },
  {
    id: 'det-url-courier',
    title: 'Customs Clearance Courier Smishing Link',
    domain: 'url',
    scenarioType: 'Payment Gateway Phishing & Address Harvest',
    senderDisplay: 'IndiaPost-Alert <support@indiapost-clearance.top>',
    timestampDisplay: 'Today, 11:20 AM',
    subject: 'Package #IN8892-DL Held at Delhi Customs — Incomplete Address',
    bodyContent: `India Post Consignment Notification

Tracking ID: #IN-889210-DL
Status: Package held at Central Parcel Sorting Hub due to missing street address number.

Please update your delivery coordinates and settle the nominal address re-labeling fee (₹24.00) within 24 hours:

Inspect Link: https://www.indiapost.gov.in.delivery-track-parcel.top/customs/pay

Packages with unverified addresses after 48 hours will be destroyed or returned to origin.`,
    context: 'Received via SMS and email with an embedded link claiming package detention.',
    indicators: [
      {
        id: 'url-ind-1',
        text: 'Subdomain deception: "indiapost.gov.in" placed as subdomain before ".delivery-track-parcel.top"',
        explanation: 'The actual domain controlling this website is "delivery-track-parcel.top". The brand name and .gov.in were placed into subdomains to trick users glancing at the URL.',
        severity: 'critical',
        isRedFlag: true,
        category: 'Subdomain Hijack Simulation',
      },
      {
        id: 'url-ind-2',
        text: 'Disposable top-level domain extension (.top)',
        explanation: 'India Post operates strictly on "indiapost.gov.in". Top-level domains like .top, .click, and .site are commonly associated with low-cost phishing sites.',
        severity: 'high',
        isRedFlag: true,
        category: 'High-Risk TLD',
      },
      {
        id: 'url-ind-3',
        text: 'Nominal ₹24.00 fee lure designed to harvest credit/debit card numbers and CVV',
        explanation: 'The small fee lowers the victim\'s psychological suspicion. Once on the fake payment page, the attacker captures complete card credentials and OTP.',
        severity: 'critical',
        isRedFlag: true,
        category: 'Micro-Fee Credential Harvesting',
      },
      {
        id: 'url-ind-4',
        text: 'Package destruction countdown ultimatum (48 hours)',
        explanation: 'Threatening to destroy parcels within 48 hours induces fear of personal property loss.',
        severity: 'medium',
        isRedFlag: true,
        category: 'Loss Aversion Urgency',
      },
    ],
    officialVerificationMethod: 'Track the consignment number #IN-889210-DL directly on the authentic portal: https://www.indiapost.gov.in. If the tracking number is invalid, the message is 100% fake.',
    safeNextSteps: [
      'Do not click or submit payment details on the link.',
      'Visit indiapost.gov.in directly in your web browser to test tracking numbers.',
      'Check if you were actually expecting an international shipment.',
      'Flag the link to National Cyber Crime portal.',
    ],
  },
];
