/** Biography, privacy policy, accessibility statement. */

import {
  site,
  writePage,
  inline,
  prose,
  icon,
  escapeHTML,
  pageHead,
  sourcesBlock,
  TEL,
} from "../_lib/render.mjs";

/* -------------------------------------------------------------- biography */

function bioPage() {
  const trail = [{ label: "Home", href: "/" }, { label: "Dr Andrew Sutherland" }];

  const body = `${pageHead(
    "Dr Andrew Sutherland",
    "Colorectal surgeon, consulting in Coffs Harbour since 2009.",
    trail,
  )}

<section class="section">
  <div class="shell">
    <div class="grid grid--2" style="align-items:start;gap:var(--space-xl)">
      <div>
        <figure style="margin:0">
          <img class="figure-img" src="/media/dr-andrew-sutherland.webp"
               width="440" height="440"
               alt="Dr Andrew Sutherland, colorectal surgeon."
               style="max-width:22rem">
        </figure>

        <div class="panel" style="margin-top:var(--space-m);max-width:26rem">
          <h2 style="font-size:var(--step-1)">Qualifications and accreditation</h2>
          <dl class="deflist" style="margin-top:var(--space-xs)">
            <div><dt>Fellowship</dt><dd>FRACS, Royal Australasian College of Surgeons, general surgery (2006)</dd></div>
            <div><dt>Post-fellowship training</dt><dd>Colorectal surgery, CSSANZ training program</dd></div>
            <div><dt>Medical degree</dt><dd>University of Melbourne (1998)</dd></div>
            <div><dt>Consulting since</dt><dd>Coffs Harbour, 2009</dd></div>
          </dl>
          <p class="small muted" style="margin-top:var(--space-s)">
            Registration can be verified on the
            <a href="https://www.ahpra.gov.au/Registration/Registers-of-Practitioners" rel="noopener noreferrer">Ahpra register of practitioners</a>.
          </p>
        </div>
      </div>

      <div class="prose">
        <p>Dr Andrew Sutherland is a specialist colorectal surgeon who has been
        working in Coffs Harbour since early 2009.</p>

        <p>Dr Sutherland graduated from the University of Melbourne in 1998. He
        completed his residency at St Vincent's Hospital in Melbourne and undertook
        Advanced Training in General Surgery at St Vincent's Hospital. In addition to
        the standard four-year training program, Andrew spent a year in the United
        Kingdom broadening his general surgical experience.</p>

        <p>After being awarded Fellowship of the Royal Australasian College of Surgeons
        (FRACS) in general surgery in 2006, he was accepted into the post-fellowship
        colorectal surgery training program. This highly competitive program,
        coordinated by the Colorectal Surgical Society of Australia and New Zealand
        (CSSANZ), accepts only five to ten new surgeons for training each year.</p>

        <p>Dr Sutherland spent the first of the two-year colorectal training scheme at
        Christchurch Hospital in New Zealand. This busy unit is the major New Zealand
        centre for recurrent rectal cancers and complex pelvic colorectal surgery. For
        the second year of training, Andrew returned to St Vincent's Hospital in
        Melbourne. That colorectal unit has major interests in laparoscopic surgery,
        surgery for inflammatory bowel disease, and the treatment of functional pelvic
        floor disorders.</p>

        <p>Andrew has also published papers on several general surgical and colorectal
        topics and presented research findings at international conferences. He is
        dedicated to maintaining his specialist skills and knowledge as a colorectal
        surgeon, and aims to provide the best of care for all of his patients.</p>

        <h2>Scope of practice</h2>
        <p>Dr Sutherland has a well-established practice in the full range of colorectal
        surgery. His interests include:</p>
        <ul>
          <li>Colonoscopy, including screening and surveillance</li>
          <li>Surgery for colon cancer and rectal cancer, including laparoscopic surgery</li>
          <li>Surgery for inflammatory bowel disease: Crohn disease and ulcerative colitis</li>
          <li>Surgery for diverticular disease</li>
          <li>Benign anorectal conditions: haemorrhoids, anal fissure, anal fistula and pilonidal sinus</li>
          <li>Surgery for rectal prolapse</li>
        </ul>

        <h2>Appointments and admitting rights</h2>
        <p>Dr Sutherland consults at Suite 4, 29 Orlando Street, Coffs Harbour, and
        operates at Baringa Private Hospital and Coffs Harbour Health Campus. He also
        participates in the CSSANZ Binational Colorectal Cancer Audit.</p>

        <h2>About this website</h2>
        <p>The clinical information on this website has been prepared by Dr Sutherland.
        It is general in nature and does not take into account an individual's particular
        circumstances. It is not a substitute for a consultation. Where an outside
        organisation has been used as a source, it is listed at the foot of the page.</p>
      </div>
    </div>
  </div>
</section>

${sourcesBlock(
  [
    { title: "Colorectal Surgical Society of Australia and New Zealand", url: "https://www.cssanz.org/" },
    { title: "Royal Australasian College of Surgeons", url: "https://www.surgeons.org/" },
    { title: "Ahpra — Registers of practitioners", url: "https://www.ahpra.gov.au/Registration/Registers-of-Practitioners" },
  ],
  null,
)}
`;
  writePage({
    url: "/dr-andrew-sutherland/",
    title: "Dr Andrew Sutherland",
    description:
      "Dr Andrew Sutherland, colorectal surgeon in Coffs Harbour since 2009. FRACS, with post-fellowship colorectal training accredited by CSSANZ.",
    body,
  });
}

/* ------------------------------------------------------------------ privacy */

function privacyPage() {
  const trail = [{ label: "Home", href: "/" }, { label: "Privacy policy" }];

  const body = `${pageHead(
    "Privacy policy",
    "How Coffs Colorectal Surgery collects, uses, stores and discloses personal and health information.",
    trail,
  )}

<section class="section">
  <div class="shell">
    <div class="prose" style="max-width:68ch">
      <p class="small muted">This policy was last reviewed in October 2026. It will be
      reviewed at least every three years, or sooner if our practices change.</p>

      <h2>Who we are</h2>
      <p>Coffs Colorectal Surgery is a private medical practice operated by Dr Andrew
      Sutherland. In this policy, "we", "us" and "the practice" mean Coffs Colorectal
      Surgery. You can contact us at ${escapeHTML(site.contact.street)},
      ${escapeHTML(site.contact.suburb)} ${escapeHTML(site.contact.state)}
      ${escapeHTML(site.contact.postcode)}, by telephone on
      <a href="tel:${TEL}">${escapeHTML(site.contact.phone)}</a>, or by email at
      <a href="mailto:${escapeHTML(site.contact.email)}">${escapeHTML(site.contact.email)}</a>.</p>

      <h2>The law that applies to us</h2>
      <p>We handle personal information in accordance with the <em>Privacy Act 1988</em>
      (Cth) and the Australian Privacy Principles (APPs). Because we are a health service
      provider in New South Wales, we also handle health information in accordance with
      the <em>Health Records and Information Privacy Act 2002</em> (NSW) and the NSW
      Health Privacy Principles (HPPs).</p>

      <h2>What information we collect</h2>
      <p>To provide you with care, we collect information including:</p>
      <ul>
        <li>Your name, date of birth, address, telephone numbers and email address</li>
        <li>Your Medicare number, private health fund details, DVA details and pension or concession status, where relevant</li>
        <li>Your medical history, symptoms, diagnoses, test results, imaging and pathology</li>
        <li>Records of treatment, operations and follow-up</li>
        <li>Correspondence with your general practitioner, other specialists and hospitals</li>
        <li>Billing and payment information</li>
      </ul>

      <h2>How we collect it</h2>
      <p>We collect information directly from you, in person, on the telephone, in
      writing, or through forms you complete. We also receive information from your
      general practitioner and other treating clinicians when they refer you, and from
      pathology and radiology services.</p>

      <h2>Why we collect it, and what we use it for</h2>
      <ul>
        <li>To assess your condition and provide safe medical care</li>
        <li>To communicate with your general practitioner and other clinicians involved in your care</li>
        <li>To arrange tests, admissions and operations at hospitals where you are treated</li>
        <li>To manage accounts, Medicare claims and health fund claims</li>
        <li>To meet our legal and professional record-keeping obligations</li>
        <li>To contact you about appointments, results, and your ongoing care</li>
      </ul>
      <p>We do not use your information for marketing, and we do not sell it.</p>

      <h2>Who we may disclose it to</h2>
      <p>We disclose your information only as far as is necessary, and generally only
      to:</p>
      <ul>
        <li>Your general practitioner and other clinicians involved in your care</li>
        <li>Hospitals where you are admitted or treated</li>
        <li>Pathology, radiology and other diagnostic services</li>
        <li>Your private health fund, Medicare, and the Department of Veterans' Affairs, for claiming and billing</li>
        <li>Insurers where a claim relates to a compensable injury, such as workers compensation or a motor accident</li>
        <li>Government bodies where we are required by law to report</li>
      </ul>
      <p>We do not disclose your health information to anyone else without your consent,
      unless the law permits or requires it, or where disclosure is necessary to prevent
      a serious and imminent threat to someone's life or health.</p>

      <h2>Email, text messages and the online enquiry form</h2>
      <p><strong>Please do not send clinical information through the enquiry form on this
      website, or by ordinary email.</strong> The enquiry form is not monitored outside
      consulting hours and is not secure for clinical content. It is intended only for
      administrative enquiries, such as confirming our address or asking about fees.</p>
      <p>Where you provide an email address or mobile number, we may use it to confirm
      appointments or send reminders. Our reminders contain no clinical detail. Ordinary
      email is not encrypted, so we avoid including clinical information in it; if a
      clinical matter arises, we will telephone you or ask you to contact the practice.</p>

      <h2>How we store and protect your information</h2>
      <p>Your health record is held in a secure electronic medical records system, with
      access restricted to authorised staff. Paper records are kept in locked storage.
      We take reasonable steps to protect the information we hold from misuse,
      interference, loss, and unauthorised access, modification or disclosure. All staff
      and contractors are bound by confidentiality obligations.</p>

      <h2>How long we keep it</h2>
      <p>We keep medical records for at least seven years from the last time you attended,
      and for longer in some circumstances, for example records relating to a person
      under 18, and records where a claim is ongoing. When records are no longer required,
      they are destroyed securely.</p>

      <h2>Accessing and correcting your information</h2>
      <p>You can ask to see the information we hold about you, and ask us to correct it
      if it is inaccurate, incomplete, out of date or misleading. Please contact the
      practice in writing. In most cases we will respond within 45 days. There are a
      small number of situations where access may be declined, or where we will discuss
      the record with you rather than release it directly, for example where it could
      cause harm. If we decline, we will explain why and tell you how to complain.</p>
      <p>We may recover a reasonable administrative fee for preparing records. We will
      tell you the cost before proceeding.</p>

      <h2>Overseas disclosure</h2>
      <p>We do not routinely send personal information overseas. If that ever becomes
      necessary (for example, through a secure cloud service with servers outside
      Australia) we will make sure it is permitted by the APPs and will update this
      policy.</p>

      <h2>Cookies and this website</h2>
      <p>This website does not use advertising cookies or tracking pixels, and does not
      build a profile of you for marketing. It loads a map from OpenStreetMap, which may
      set its own cookies when the map is displayed. If we add website analytics in
      future, this policy will be updated to describe it.</p>

      <h2>Notifiable data breaches</h2>
      <p>If we become aware of a data breach that is likely to result in serious harm to
      anyone whose information we hold, we will investigate promptly and notify the
      affected individuals and the Office of the Australian Information Commissioner as
      required by the <em>Privacy Act 1988</em>.</p>

      <h2>Complaints</h2>
      <p>If you are concerned about how we have handled your information, please talk to
      us first, as many matters can be resolved quickly. You may also complain to:</p>
      <ul>
        <li>The <strong>Office of the Australian Information Commissioner</strong>, at <a href="https://www.oaic.gov.au/" rel="noopener noreferrer">oaic.gov.au</a> or on 1300 363 992, about privacy and the APPs</li>
        <li>The <strong>NSW Privacy Commissioner</strong> at the Information and Privacy Commission, about the NSW Health Privacy Principles</li>
        <li>The <strong>Health Care Complaints Commission</strong> of NSW, at <a href="https://www.hccc.nsw.gov.au/" rel="noopener noreferrer">hccc.nsw.gov.au</a> or on 1800 043 159, about the care we provide</li>
      </ul>

      <h2>Health records and My Health Record</h2>
      <p>If your practice participates in My Health Record, a current My Health Record
      security and access policy applies. Please ask us if you would like more
      information about how your My Health Record is used.</p>
    </div>
  </div>
</section>

${sourcesBlock(
  [
    { title: "OAIC: Guide to health privacy", url: "https://www.oaic.gov.au/privacy/privacy-guidance-for-organisations-and-government-agencies/health-service-providers/guide-to-health-privacy" },
    { title: "OAIC: Australian Privacy Principles", url: "https://www.oaic.gov.au/privacy/australian-privacy-principles" },
    { title: "NSW Information and Privacy Commission — Health Privacy Principles fact sheet", url: "https://www.ipc.nsw.gov.au/resources/fact-sheet-health-privacy-principles-hpps" },
    { title: "Health Records and Information Privacy Act 2002 (NSW)", url: "https://legislation.nsw.gov.au/view/html/inforce/current/act-2002-071" },
  ],
  "October 2026",
)}
`;
  writePage({
    url: "/privacy/",
    title: "Privacy policy",
    description:
      "How Coffs Colorectal Surgery collects, uses, stores and discloses personal and health information, in accordance with the Privacy Act 1988 and the NSW Health Records and Information Privacy Act 2002.",
    body,
  });
}

/* -------------------------------------------------------------- accessibility */

function accessibilityPage() {
  const trail = [{ label: "Home", href: "/" }, { label: "Accessibility" }];

  const body = `${pageHead(
    "Accessibility",
    "What we have done to make this website usable by everyone, and how to tell us if something does not work for you.",
    trail,
  )}

<section class="section">
  <div class="shell">
    <div class="prose" style="max-width:68ch">
      <h2>Our aim</h2>
      <p>We want this website to be usable by all patients and their families,
      including people using screen readers, keyboard-only navigation, magnification,
      or a mobile phone. We have aimed to meet the Web Content Accessibility Guidelines
      (WCAG) version 2.2 at Level AA, which is the standard recommended for Australian
      organisations by the Australian Human Rights Commission.</p>

      <h2>What we have done</h2>
      <ul>
        <li>Text can be enlarged to at least 200 per cent, and the layout still works, without horizontal scrolling</li>
        <li>Text and interface colours meet the minimum contrast requirements, in both the light and dark appearances</li>
        <li>Every interactive element has a visible keyboard focus indicator</li>
        <li>All functionality is reachable with a keyboard alone</li>
        <li>The site works at a viewport width of 320 pixels without loss of content, and pinch-to-zoom is not disabled</li>
        <li>Buttons and links in the main navigation and footer are at least 44 by 44 pixels</li>
        <li>Images that carry meaning have alternative text; purely decorative images are hidden from screen readers</li>
        <li>Headings follow a logical order, and each page has one main heading</li>
        <li>Every page has proper landmark regions, so screen readers can jump straight to the navigation, the main content or the footer</li>
        <li>The page respects your operating system's reduced motion setting, described below</li>
        <li>A dark appearance is applied automatically if your device is set to dark mode, and can be switched manually</li>
        <li>Text remains readable if you override line height, paragraph spacing, letter spacing or word spacing</li>
        <li>Content is provided as accessible HTML rather than only as PDF documents</li>
      </ul>

      <h2>Motion and animation</h2>
      <p>Some parts of the site fade or move gently as you scroll. If your device or
      browser is set to reduce motion, these effects are turned off, and page
      transitions become simple cross-fades. There are no carousels, no autoplaying
      video, and no automatically moving banners anywhere on this site.</p>

      <h2>Readability for older eyes</h2>
      <p>Body text is set at a comfortable size with generous line spacing, and the
      measure, meaning the length of a line, is kept short so it is easy to track from the
      end of one line to the beginning of the next. We use the system font, so it is
      the same typeface you already read everywhere else on your device.</p>

      <h2>Known limitations</h2>
      <ul>
        <li>The embedded map cannot be fully navigated by keyboard, as is common with map services. The same location is given as a written address and a text link to an external map, so nothing depends on the embedded map.</li>
        <li>Some external websites we link to are outside our control and may not meet the same standard.</li>
      </ul>

      <h2>Other ways to reach us</h2>
      <p>If any part of this website is difficult for you to use, please tell us and we
      will give you the information another way: over the phone, in large print, or in
      person. We are happy to read anything on this site to you over the phone.</p>
      <ul>
        <li><strong>Telephone:</strong> <a href="tel:${TEL}">${escapeHTML(site.contact.phone)}</a></li>
        <li><strong>National Relay Service:</strong> ${escapeHTML(site.emergency.relay)}, for people who are deaf, hard of hearing, or have a speech impairment</li>
        <li><strong>Translating and Interpreting Service (TIS National):</strong> ${escapeHTML(site.emergency.interpreter)}</li>
      </ul>

      <h2>Feedback</h2>
      <p>If you find a barrier on this website, please contact the practice and tell us
      what you were trying to do. We will fix what we can, and record what cannot be
      fixed so it is addressed at the next review.</p>
    </div>
  </div>
</section>
`;
  writePage({
    url: "/accessibility/",
    title: "Accessibility",
    description:
      "Accessibility statement for the Coffs Colorectal Surgery website: the WCAG 2.2 AA measures taken, known limitations, and how to ask for information another way.",
    body,
  });
}

export function render() {
  bioPage();
  privacyPage();
  accessibilityPage();
}
