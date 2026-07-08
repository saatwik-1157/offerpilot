/* ============================================================
   OfferPilot — Resource Hub content
   Original educational guides for F-1 / OPT job seekers.
   Rendered by resources.html (cards) and guide.html (full read).
   General information only — not legal or immigration advice.
   ============================================================ */
window.GUIDES = [
  {
    id: "timeline",
    tag: "OPT · Deadlines",
    emoji: "🗓️",
    thumb: "",
    readMins: 6,
    title: "The F-1 → OPT → H-1B timeline, decoded",
    dek: "Every date that matters — from your EAD start to the H-1B lottery — laid out so you can plan your search backward from your clock.",
    sections: [
      { h: "Start from the deadline, not the start line",
        p: "Most students plan their job search forward from graduation. On a visa, you should plan it backward from the dates that can end your work authorization. Once you can see the whole timeline on one page, the urgency stops being vague anxiety and becomes a schedule you can actually work against." },
      { h: "The core milestones",
        list: [
          "OPT is post-completion work authorization: eligible F-1 students get up to 12 months per degree level.",
          "You cannot legally work until the start date printed on your EAD (Employment Authorization Document) card — apply early, because processing can take weeks to months.",
          "On standard 12-month OPT you are allowed a maximum of 90 days of unemployment. Go past it and you fall out of status.",
          "If your degree is on the STEM list and your employer is enrolled in E-Verify, you may qualify for a 24-month STEM OPT extension (36 months total), which raises the total unemployment allowance to 150 days across the whole period.",
          "H-1B is the main long-term work visa. It's capped and awarded by lottery: 65,000 regular slots plus 20,000 reserved for U.S. master's-or-higher graduates."
        ] },
      { h: "The H-1B calendar you're racing",
        p: "Employers submit electronic H-1B registrations in a window that typically opens in March. Selections are announced shortly after, petitions are filed for those selected, and the work start date is October 1 (the start of the government's fiscal year). Practically, that means your employer usually needs to be committed to you months before that October date." },
      { h: "Cap-gap: the bridge that saves the summer",
        p: "If a timely H-1B petition is filed for you while your OPT is still valid and you're selected, 'cap-gap' relief can extend your F-1 status and work authorization up to the October 1 start — closing the gap between when OPT ends and when H-1B begins. It's automatic in eligible cases, but it only works if the petition was filed in time, which is why starting the job search early matters so much." },
      { h: "Work the schedule backward",
        list: [
          "Fix your two hard dates first: your EAD end date and your 90-day (or 150-day) unemployment limit.",
          "Count back three to four months from the March H-1B registration window — that's roughly when you want offers in hand so an employer can register you.",
          "Count back another two to three months for interviewing and screening.",
          "Everything before that is application volume. That's the phase most students under-invest in, and it's the phase OfferPilot removes from your plate."
        ] },
      { note: "Rules and dates change, and your situation may differ. Always confirm specifics with your school's DSO and, for anything consequential, a licensed immigration attorney. This guide is general information, not legal advice." }
    ]
  },
  {
    id: "sponsorship",
    tag: "Sponsorship",
    emoji: "🏢",
    thumb: "g2",
    readMins: 5,
    title: "How to spot employers that actually sponsor",
    dek: "The signals in a job post, the companies with a track record, and the cap-exempt paths most students miss.",
    sections: [
      { h: "Why targeting beats blasting",
        p: "Roughly half of a visa candidate's applications die over a single dropdown: 'Will you now or in the future require sponsorship?' Applying to companies that never sponsor isn't just wasted effort — it's the fastest way to burn your limited unemployment clock. The fix is to spend your volume where it can convert." },
      { h: "Reading a job description like a filter",
        list: [
          "'Must be authorized to work in the U.S. without sponsorship now or in the future' is a hard no — skip it.",
          "'Must be authorized to work in the U.S.' (no mention of future sponsorship) is often OK on OPT, because you already are authorized.",
          "'We are unable to sponsor for this role' — believe them, even at big-name companies; policy varies by team and role.",
          "Silence on sponsorship isn't a yes, but it's worth an application, especially at companies with a sponsorship history."
        ] },
      { h: "Use the public paper trail",
        p: "Every H-1B petition creates public records. Employers must file a Labor Condition Application (LCA) with the Department of Labor, and USCIS publishes H-1B employer data. Several free sites aggregate this into searchable databases of who has sponsored, for what roles, and at what salaries. A company that filed dozens of H-1Bs for software engineers last year is a far better bet than one with zero history." },
      { h: "The cap-exempt path most students miss",
        p: "Universities and their affiliated nonprofits, nonprofit research organizations, and government research organizations are cap-exempt: they can file H-1B petitions any time of year and don't go through the lottery. Research roles, university labs, teaching hospitals, and some nonprofits are genuinely easier H-1B paths — and most job seekers overlook them entirely because they're chasing the brand-name tech companies." },
      { h: "Build a target list, then go wide inside it",
        p: "The goal isn't to apply to fewer jobs — it's to apply to many jobs that can actually say yes. Start from companies with a sponsorship track record and cap-exempt employers in your field, then maximize volume within that list. That's exactly the shape of targeting OfferPilot uses on your behalf." },
      { note: "Sponsorship policies change and are role- and team-specific. Public H-1B data shows history, not a guarantee. Confirm anything important directly with the employer and your DSO." }
    ]
  },
  {
    id: "ats",
    tag: "Resumes",
    emoji: "📄",
    thumb: "g3",
    readMins: 5,
    title: "Why your resume dies at the ATS (and the fix)",
    dek: "What applicant-tracking systems actually reward, the keyword-match myth vs. reality, and why one tailored resume per role beats one polished master resume.",
    sections: [
      { h: "What an ATS actually does",
        p: "An Applicant Tracking System is mostly a database and a search tool. It parses your resume into fields, stores it, and lets recruiters search and filter. The myth is that a robot 'auto-rejects' most resumes on a hidden score. The reality is subtler and more fixable: if the system parses your resume badly, or if a recruiter's keyword search doesn't surface you, a human never sees you — no rejection needed." },
      { h: "The two ways you disappear",
        list: [
          "Parsing failure: fancy templates with columns, tables, text boxes, headers/footers, and graphics often parse into garbage, so your experience never lands in the right fields.",
          "Search miss: recruiters search by the exact terms in the job (e.g. 'React', 'Kubernetes', 'A/B testing'). If your resume describes the same work in different words, you don't come up."
        ] },
      { h: "The keyword-match myth vs. reality",
        p: "You don't beat the ATS by stuffing keywords or hiding white text — modern systems and recruiters catch that, and it reads as spam. You beat it by describing your real experience using the same vocabulary the role screens for. If the job says 'REST APIs' and you built them, write 'REST APIs', not 'web services'. It's honest and it's what search rewards." },
      { h: "Why one resume per role beats one master resume",
        p: "A single polished master resume is optimized for the average of every job — which means it's optimal for none. Each role screens for a different subset of skills. A version tailored to that role, leading with the four or five things it actually cares about, surfaces in more searches and reads as a stronger fit. Doing that by hand for hundreds of applications is impossible, which is the whole reason resume tailoring has to be automated at volume." },
      { h: "A format that always parses",
        list: [
          "Single column, standard section headings ('Experience', 'Education', 'Skills').",
          "Real text, not images; no tables, text boxes, or content in the header/footer.",
          "Common fonts, standard bullet points, a .docx or text-based .pdf.",
          "Mirror the role's exact terminology for the tools and skills you genuinely have."
        ] },
      { note: "RezForge™, OfferPilot's engine, rebuilds a clean, role-tailored resume for every single application — the manual version of this at scale is what eats your evenings." }
    ]
  },
  {
    id: "volume",
    tag: "Strategy",
    emoji: "🎯",
    thumb: "",
    readMins: 4,
    title: "The volume math no one tells you",
    dek: "Why visa candidates need several times the application volume for the same interview count — and how to hit that without losing your mind or your GPA.",
    sections: [
      { h: "The funnel is a series of fractions",
        p: "Every job search is a funnel: applications become responses, responses become screens, screens become interviews, interviews become offers. Each step keeps only a fraction. When your top-of-funnel is smaller, everything downstream shrinks with it — which is exactly the trap visa candidates fall into." },
      { h: "Why your funnel starts narrower",
        list: [
          "The sponsorship filter removes a large share of postings before you even apply.",
          "Generic, untailored resumes convert at a lower rate per application.",
          "Time pressure pushes people toward a handful of 'dream' applications instead of coverage."
        ] },
      { h: "Do the arithmetic once",
        p: "Suppose a strong tailored application gets a response one time in ten, and one in five responses becomes a real interview. That's roughly one interview per fifty applications. To sit in front of ten companies, you're looking at hundreds of applications — and that's before the sponsorship filter cuts your eligible pool. This is why 'I applied to forty places and heard nothing' isn't bad luck; it's just too small a numerator." },
      { h: "The two levers you control",
        list: [
          "Rate: tailor every resume so a higher fraction of applications convert. Quality per application.",
          "Volume: apply to far more eligible roles so even a modest rate produces real interviews. Quantity of applications."
        ] },
      { h: "Why you can't do both by hand",
        p: "Raising rate (tailoring) makes each application slower; raising volume needs each application faster. By hand, those two goals fight each other, and something has to give — usually your sleep, your coursework, or your standards. The only way to win both at once is to automate the tailoring so volume no longer costs you quality. That's the entire premise of a done-for-you service." },
      { note: "The numbers here are illustrative, not promises — real conversion rates vary by field, season, and profile." }
    ]
  },
  {
    id: "interview",
    tag: "Interviews",
    emoji: "💬",
    thumb: "g2",
    readMins: 5,
    title: "Answering “do you need sponsorship?” without losing the room",
    dek: "The phrasing that keeps you in the process, when to disclose, and how to reframe your status as low-risk to a hiring manager.",
    sections: [
      { h: "What the question is really asking",
        p: "When a recruiter asks about sponsorship, they're not trying to trip you up — they're managing risk and process. They want to know: can you start working now, and will hiring you create cost or uncertainty later? Answer those underlying worries, not just the literal question, and you keep the conversation moving." },
      { h: "Lead with what's already true",
        p: "The strongest thing you can say is that you're authorized to work right now. On OPT you are — so say it plainly and first. Something like: 'I'm authorized to work in the U.S. on OPT, so I can start immediately. Down the line I would need the company to support an H-1B, and I'm happy to walk through what that involves.' You've answered the immediate concern before raising the future one." },
      { h: "Reframe the future as manageable, not scary",
        list: [
          "If your degree is STEM, mention the 24-month extension — it buys the company years before any H-1B is even needed.",
          "Note that H-1B sponsorship is a well-trodden, largely administrative process for employers who do it, usually handled by outside counsel.",
          "Be matter-of-fact. Confidence that this is normal and solvable is contagious; visible anxiety makes the manager anxious too."
        ] },
      { h: "When to disclose",
        p: "Don't hide it, and don't lead every conversation with it either. If an application asks directly, answer honestly. If it doesn't come up, a natural moment is once there's mutual interest — often the recruiter screen. Volunteering it far too early can make it the headline; hiding it until an offer can feel like a surprise. Aim for honest and unremarkable." },
      { h: "Practice the sentence out loud",
        p: "The difference between a candidate who loses the room and one who doesn't is usually just fluency. Write your two or three sentences, say them until they're boring, and they'll land as a non-event in the interview — which is exactly what you want." },
      { note: "Phrasing is personal and situational; adapt this to your own status and comfort. It is not legal advice." }
    ]
  },
  {
    id: "roles",
    tag: "Careers",
    emoji: "🧭",
    thumb: "g3",
    readMins: 4,
    title: "Which roles convert best for new grads on OPT",
    dek: "A grounded look at the titles, industries, and locations where sponsorship-friendly offers actually happen for early-career candidates.",
    sections: [
      { h: "Follow the sponsorship history",
        p: "The best-converting roles aren't a secret list — they're wherever employers have a habit of sponsoring. Historically that skews toward technical and quantitative roles, because those are where U.S. talent demand outruns supply and companies have already built the sponsorship muscle." },
      { h: "Titles that tend to convert",
        list: [
          "Software Engineer / SDE and adjacent (backend, full-stack, platform, DevOps).",
          "Data Analyst, Data Scientist, Data / ML Engineer.",
          "Quantitative and financial-engineering roles.",
          "Hardware, electrical, and semiconductor engineering.",
          "Specialized product and technical-program roles at companies that already sponsor."
        ] },
      { h: "Industries worth over-indexing on",
        list: [
          "Large tech and cloud companies with established immigration programs.",
          "Financial services and fintech, which sponsor heavily for engineering and quant roles.",
          "Consulting and IT services firms that sponsor at scale.",
          "Cap-exempt employers — universities, research institutes, teaching hospitals — for research-leaning roles."
        ] },
      { h: "Geography still matters",
        p: "Sponsorship clusters where the roles and the immigration infrastructure already exist: major tech and finance hubs, and increasingly strong secondary markets. Casting a nationwide net (including remote-friendly roles) widens your pool of sponsoring employers rather than competing for the handful in one city." },
      { h: "Match the net to the math",
        p: "None of this means ignore your dream role — it means weight your volume toward roles and employers that can realistically say yes, then let the wider net do its work. Targeting the convertible roles and applying broadly within them is the combination that turns effort into interviews." },
      { note: "Patterns shift year to year and vary by field. Treat this as a starting map, not a guarantee, and verify current employer policies directly." }
    ]
  }
];
