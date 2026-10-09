/** Visit pages: symptoms, referrals, fees, bowel preparation, after surgery,
 *  resources, contact. */

import {
  site,
  writePage,
  inline,
  prose,
  icon,
  escapeHTML,
  pageHead,
  emergencyStrip,
  sourcesBlock,
  faqBlock,
  TEL,
  HELP_TEL,
} from "../_lib/render.mjs";

const noop = () => "";

/* ------------------------------------------------------------------ symptoms */

function symptomsPage() {
  const s = site.symptomsPage;
  const trail = [
    { label: "Home", href: "/" },
    { label: "Your visit", href: "/your-visit/" },
    { label: s.title },
  ];

  const body = `
${pageHead(s.title, s.intro, trail)}

<section class="section">
  <div class="shell">
    <div class="callout callout--urgent" style="max-width:64rem">
      ${icon("alert")}
      <div>
        <p class="callout__title">Get help now if you have any of these</p>
        <ul>${s.redFlags.map((f) => `<li>${inline(f)}</li>`).join("")}</ul>
        <p style="margin-top:0.6rem">Call <strong>${escapeHTML(site.emergency.ambulance)}</strong>
        for an ambulance, or go to the nearest emergency department —
        ${escapeHTML(site.emergency.department)}.</p>
      </div>
    </div>

    <div class="grid grid--2" style="margin-top:var(--space-xl);align-items:start">
      <div class="prose">
        <h2>See your GP about these</h2>
        <p>Most people with these symptoms do not have cancer. But symptoms like
        these should be checked, and usually the first step is a visit to your
        general practitioner.</p>
        <ul>${s.seeGp.map((f) => `<li>${inline(f)}</li>`).join("")}</ul>
        <p>If you are worried, it is reasonable to ask your GP directly whether you
        need a referral to a specialist. You are also entitled to ask for a referral
        to the specialist of your choice.</p>
      </div>
      <div class="panel">
        <h3 style="font-size:var(--step-1)">${icon("info")} A positive screening test is not a diagnosis</h3>
        <p style="margin-top:0.5rem">A positive bowel screening test means blood was
        found in your bowel motion. It does <strong>not</strong> mean you have cancer.
        There are many other reasons blood can be present. It does mean you need a
        colonoscopy to find out why.</p>
        <h3 style="font-size:var(--step-1);margin-top:var(--space-m)">${icon("clock")} Don't wait for a kit if you have symptoms</h3>
        <p style="margin-top:0.5rem">Screening tests are designed for people
        <em>without</em> symptoms. If you already have symptoms, see your GP — a
        screening test is not the right test for you.</p>
      </div>
    </div>
  </div>
</section>

<section class="section section--sunken" aria-labelledby="screen-h">
  <div class="shell">
    <div class="prose" style="max-width:64ch">
      <p class="eyebrow">Screening</p>
      <h2 id="screen-h" style="margin-top:var(--space-2xs)">The National Bowel Cancer Screening Program</h2>
      ${prose(s.screening)}
      <p class="small muted" style="margin-top:var(--space-m)">
        To request a kit, or a replacement if yours is lost or has expired, call the
        National Cancer Screening Register on <strong>1800 627 701</strong>.
      </p>
      <p style="margin-top:var(--space-m)">
        <a class="btn btn--ghost" href="https://www.health.gov.au/our-work/national-bowel-cancer-screening-program" rel="noopener noreferrer">
          National Bowel Cancer Screening Program${icon("external")}
        </a>
      </p>
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="shell">${emergencyStrip()}</div>
</section>
`;
  writePage({
    url: "/your-visit/symptoms/",
    title: s.title,
    description:
      "Colorectal symptoms explained: what to watch for, when to see your GP, when to seek urgent care, and how the Australian bowel cancer screening program works.",
    body,
  });
}

/* ---------------------------------------------------------------- referrals */

function referralsPage() {
  const trail = [
    { label: "Home", href: "/" },
    { label: "Your visit", href: "/your-visit/" },
    { label: "Referrals and Medicare" },
  ];

  const body = `
${pageHead(
  "Referrals and Medicare",
  "Most people need a referral from their general practitioner before they can claim a Medicare rebate for a specialist consultation. Here is how referrals work, what to bring, and what happens at your first appointment.",
  trail,
)}

<section class="section">
  <div class="shell">
    <div class="grid grid--2" style="align-items:start">
      <div class="prose">
        <h2>Do I need a referral?</h2>
        <p>Yes, if you want to claim a Medicare rebate. A referral from your general
        practitioner is required for Medicare benefits to be payable for a specialist
        consultation. You can still be seen without one, but the consultation would
        not attract a Medicare rebate.</p>

        <h2>How to get a referral</h2>
        <p>Book an appointment with your GP and explain your symptoms. If the GP
        agrees that a specialist opinion is needed, they will write a referral letter.
        The referral must include the relevant clinical information, the date, and the
        GP's signature.</p>
        <p>A referral does <strong>not</strong> have to name a particular specialist.
        You are free to choose where your referral is sent, and you are entitled to ask
        your GP to refer you to Dr Sutherland.</p>

        <h2>How long is a referral valid?</h2>
        <ul>
          <li>A referral from a general practitioner is valid for <strong>12 months</strong>
          from the date the specialist first sees you — not from the date the GP wrote it.</li>
          <li>A referral from another specialist is valid for <strong>3 months</strong>.</li>
          <li>A referral covers one course of treatment. A new or unrelated problem
          usually needs a new referral.</li>
          <li>If a written referral is lost or destroyed, it can be used for one
          attendance only, and the account must be marked "lost referral".</li>
        </ul>
        <p>If your referral has expired, you will need to see your GP again before
        your next appointment to keep your Medicare rebate.</p>

        <h2>What to bring to your first appointment</h2>
        <ul>
          <li>Your referral letter</li>
          <li>Your Medicare card</li>
          <li>Your private health fund card, if you have one</li>
          <li>Your DVA card, if applicable</li>
          <li>Any relevant scans, X-rays and pathology results, including the discs or films where you have them</li>
          <li>A list of your current medicines, including doses</li>
          <li>Any concession or pension card</li>
          <li>Contact details of your general practitioner</li>
        </ul>

        <h2>Referrals from another specialist</h2>
        <p>If another specialist has referred you, please bring that letter as well.
        Specialist-to-specialist referrals are valid for three months.</p>

        <h2>For referring doctors</h2>
        <p>Referrals can be faxed to <strong>${escapeHTML(site.contact.fax)}</strong>, or
        posted to ${escapeHTML(site.contact.street)}, ${escapeHTML(site.contact.suburb)}
        ${escapeHTML(site.contact.state)} ${escapeHTML(site.contact.postcode)}. If you
        would like to discuss a patient before referring, please call the practice on
        <a href="tel:${TEL}">${escapeHTML(site.contact.phone)}</a>.</p>
      </div>

      <div>
        <div class="panel">
          <h3 style="font-size:var(--step-1)">${icon("phone")} Book an appointment</h3>
          <p style="margin-top:0.5rem">Call the practice and we will find a time that
          suits you. Please have your referral and Medicare card details with you.</p>
          <p style="margin-top:var(--space-s)">
            <a class="btn btn--primary" href="tel:${TEL}">Call ${escapeHTML(site.contact.phone)}</a>
          </p>
          <dl class="deflist" style="margin-top:var(--space-m)">
            <div><dt>Consulting hours</dt><dd>Monday to Friday, 9am – 5pm</dd></div>
            <div><dt>Fax for referrals</dt><dd>${escapeHTML(site.contact.fax)}</dd></div>
          </dl>
        </div>

        <div class="callout callout--info" style="margin-top:var(--space-m)">
          ${icon("info")}
          <div>
            <p class="callout__title">Cancellations</p>
            <p>If you cannot attend, please let us know as early as possible so the
            appointment can be offered to someone else.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

${sourcesBlock(
  [
    { title: "Services Australia — Referrals for specialist treatment", url: "https://www.servicesaustralia.gov.au/referrals-for-specialist-treatment" },
    { title: "MBS Online — note GN.6.16, referrals", url: "http://www9.health.gov.au/mbs/fullDisplay.cfm?type=note&q=GN.6.16&qt=noteID" },
  ],
  "October 2026",
)}

<section class="section section--tight">
  <div class="shell">${emergencyStrip()}</div>
</section>
`;
  writePage({
    url: "/your-visit/referrals/",
    title: "Referrals and Medicare",
    description:
      "How to get a referral to a colorectal surgeon, how long GP and specialist referrals last, what to bring to your first appointment, and information for referring doctors.",
    body,
  });
}

/* --------------------------------------------------------------------- fees */

function feesPage() {
  const trail = [
    { label: "Home", href: "/" },
    { label: "Your visit", href: "/your-visit/" },
    { label: "Fees" },
  ];

  const body = `
${pageHead(
  "Fees and informed financial consent",
  "You are entitled to know what a consultation or an operation is likely to cost you before you decide to go ahead. This page explains how fees, Medicare rebates and private health insurance fit together.",
  trail,
)}

<section class="section">
  <div class="shell">
    <div class="callout callout--info" style="max-width:64rem;margin-bottom:var(--space-l)">
      ${icon("info")}
      <div>
        <p class="callout__title">Get a written quote before your procedure</p>
        <p>Fees depend on the complexity of your individual case, so a general figure
        cannot be accurate for everyone. Please ask reception for a written estimate of
        your out-of-pocket costs, and check it against your health fund. You should
        never feel pressured to proceed without understanding the cost.</p>
      </div>
    </div>

    <div class="prose" style="max-width:64ch">
      <h2>What informed financial consent means</h2>
      <p>Informed financial consent means you are given clear information about the
      likely costs — including any gap between the fee charged and the amount you get
      back — <em>before</em> you agree to treatment. It also means you are told about
      the costs that are not part of the surgeon's fee.</p>

      <h2>The bills you may receive</h2>
      <p>For an operation there are usually several separate accounts. This is normal
      and is worth understanding in advance:</p>
      <ul>
        <li><strong>The surgeon's fee</strong> — for Dr Sutherland's services.</li>
        <li><strong>The assistant's fee</strong> — if a surgical assistant is required.</li>
        <li><strong>The anaesthetist's fee</strong> — a separate specialist who bills independently.</li>
        <li><strong>The hospital fee</strong> — charged by the hospital, usually covered by private health insurance.</li>
        <li><strong>Pathology and radiology</strong> — for tests on any tissue removed and for any scans.</li>
      </ul>

      <h2>Medicare and the Medicare Safety Net</h2>
      <p>Medicare pays a rebate towards many consultations and procedures. The rebate
      is usually less than the fee charged, and the difference is your out-of-pocket
      cost or "gap".</p>
      <p>Once your cumulative out-of-pocket costs for medical services in a calendar
      year reach the Medicare Safety Net threshold, the Medicare rebate increases for
      the rest of that year. Registering your family with Medicare for the Safety Net
      means your costs are counted together. Ask reception if you would like help with
      this.</p>

      <h2>Private health insurance</h2>
      <p>If you hold private hospital cover, the hospital component of an admission is
      usually covered. Some funds have known-gap or no-gap arrangements for particular
      procedures; it is worth checking with your fund before your surgery date. Your
      excess, any waiting periods, and any exclusions still apply.</p>
      <p>If you do not hold private health insurance, you may still choose to be treated
      as a private patient, or you may be treated in the public system. Waiting times
      differ, and Dr Sutherland can explain the options that apply to you.</p>

      <h2>Other funding arrangements</h2>
      <ul>
        <li><strong>Department of Veterans' Affairs (DVA)</strong> — accepted for eligible veterans.</li>
        <li><strong>Workers compensation and CTP</strong> — accounts are usually sent to the insurer once the claim is approved.</li>
        <li><strong>Medicare cards, pension and concession cards</strong> — please bring them so that rebates can be claimed correctly.</li>
      </ul>

      <h2>Consultation fees</h2>
      <p>Consultation fees and the current Medicare rebate are confirmed at the time of
      booking. Because a first consultation is longer than a review, and because some
      consultations are more complex than others, the fee varies. Please call the
      practice on <a href="tel:${TEL}">${escapeHTML(site.contact.phone)}</a> and we will
      tell you the current fee before you book.</p>

      <h2>If you are struggling with costs</h2>
      <p>Please tell us. Payment plans and hardship arrangements can sometimes be
      discussed, and it is much better to raise it early than to delay necessary care.
      Your GP may also be able to advise on public options.</p>
    </div>
  </div>
</section>

${sourcesBlock(
  [
    { title: "Australian Medical Association — Informed financial consent (2024)", url: "https://www.ama.com.au/articles/informed-financial-consent-2024" },
    { title: "Australian Medical Association — Setting medical fees and billing practices (2024)", url: "https://www.ama.com.au/articles/setting-medical-fees-and-billing-practices-2024" },
    { title: "Services Australia — Medicare Safety Net", url: "https://www.servicesaustralia.gov.au/medicare-safety-net" },
    { title: "Medical Costs Finder", url: "https://medicalcostsfinder.health.gov.au/" },
  ],
  "October 2026",
)}

<section class="section section--tight">
  <div class="shell">${emergencyStrip()}</div>
</section>
`;
  writePage({
    url: "/your-visit/fees/",
    title: "Fees and informed financial consent",
    description:
      "How fees, Medicare rebates, the Medicare Safety Net and private health insurance work for colorectal surgery, and how to get a written quote for your procedure.",
    body,
  });
}

/* --------------------------------------------------------- bowel preparation */

function bowelPrepPage() {
  const trail = [
    { label: "Home", href: "/" },
    { label: "Your visit", href: "/your-visit/" },
    { label: "Bowel preparation" },
  ];

  const body = `
${pageHead(
  "Bowel preparation",
  "A colonoscopy is only as good as the preparation before it. If the bowel is not clean, polyps and small cancers can be missed, and the test may need to be repeated. Most people find the preparation is the hardest part — and that the test itself is easy.",
  trail,
)}

<section class="section">
  <div class="shell">
    <div class="callout callout--info" style="max-width:64rem">
      ${icon("doc")}
      <div>
        <p class="callout__title">Follow the written instructions you are given</p>
        <p>The instructions below describe the usual Australian approach. Your exact
        timing, and the particular preparation prescribed for you, will be confirmed in
        the written instructions from the practice or the hospital. Always follow those
        written instructions if they differ from this page, and call us if anything is
        unclear.</p>
      </div>
    </div>

    <div class="grid grid--2" style="margin-top:var(--space-xl);align-items:start">
      <div class="prose">
        <h2>A few days before</h2>
        <p>You will be asked to eat a low-fibre diet for the day or two before your
        preparation starts. The aim is to leave as little residue in the bowel as
        possible.</p>
        <p><strong>Avoid:</strong></p>
        <ul>
          <li>Wholegrain bread, cereals, bran and oats</li>
          <li>Nuts, seeds, and dried fruit</li>
          <li>Raw fruit and raw vegetables, and salad</li>
          <li>Beans, lentils and other pulses</li>
          <li>Corn, popcorn and mushrooms</li>
        </ul>
        <p><strong>You can eat:</strong> white bread, white rice and refined cereals,
        eggs, plain meat and fish, chicken, dairy foods, and well-cooked peeled
        vegetables without seeds.</p>
        <p><strong>Avoid anything red or purple</strong> — including red jelly, red
        cordial and dark grape juice. These can be mistaken for blood during the
        procedure and may lead to unnecessary tests.</p>

        <h2>The day before: clear fluids only</h2>
        <p>From the time instructed — usually in the morning of the day before — you
        will need to stop solid food and drink only clear fluids.</p>
        <p>Clear fluids include water, clear fruit juice without pulp, clear broth or
        soup, black tea or coffee without milk, clear soft drink, and clear sports
        drinks. <strong>Do not drink anything red or purple.</strong></p>
        <p>Drink plenty. Aim for about a glass of clear fluid every hour while you
        are awake. This is the single most important thing you can do to make the
        preparation work and to keep yourself comfortable. Take nothing at all by mouth
        for the two hours before your procedure, unless you have been told otherwise.</p>

        <h2>The bowel preparation itself</h2>
        <p>The preparation is a solution prescribed for you that clears the bowel out
        completely. Australian practice is usually to split the dose: roughly half the
        night before the procedure, and the other half about six hours before. Split
        dosing gives a cleaner bowel than a single dose.</p>
        <p>Expect to spend several hours near a toilet once it starts working. A
        barrier cream, soft toilet paper, and a warm shower can help. Staying warm
        reduces cramping.</p>
        <p>It is not necessary to name the particular preparation here. Use the one
        prescribed for you and follow its instructions for mixing and refrigeration.</p>

        <h2>Your medicines</h2>
        <p>Some medicines need to be adjusted or temporarily stopped before a
        colonoscopy, and some must be continued. This is a decision for the doctor who
        prescribes them, not something to decide yourself.</p>
        <ul>
          <li><strong>Blood thinners and anticoagulants</strong> — including warfarin, direct oral anticoagulants, and antiplatelet medicines such as clopidogrel. Ask the prescriber well in advance.</li>
          <li><strong>Diabetes medicines and insulin</strong> — doses usually need adjusting during the fasting period.</li>
          <li><strong>Iron tablets</strong> — usually stopped about a week before, as they make the bowel look black.</li>
          <li><strong>Anti-diarrhoeal medicines</strong> — usually stopped.</li>
          <li><strong>Blood pressure medicines</strong> — usually continued, including on the morning of the procedure.</li>
        </ul>
        <p>If you are unsure about any medicine, ring the practice — do not guess.</p>
      </div>

      <div>
        <div class="panel">
          <h3 style="font-size:var(--step-1)">${icon("clock")} The procedure itself</h3>
          <ul style="margin-top:0.6rem;padding-left:1.2rem;display:grid;gap:0.45rem">
            <li>The examination itself usually takes 20 to 30 minutes, though you should expect to be at the hospital or day surgery unit for three to four hours in total.</li>
            <li>Performed under sedation or a light general anaesthetic — most people remember nothing of it.</li>
            <li>Generally not painful. Air used to inflate the bowel can cause bloating or wind afterwards.</li>
            <li>Usually day surgery: you will be able to go home the same day.</li>
            <li>Small growths called polyps are commonly removed at the same time.</li>
          </ul>
        </div>

        <div class="callout callout--urgent" style="margin-top:var(--space-m)">
          ${icon("alert")}
          <div>
            <p class="callout__title">After sedation, for 24 hours</p>
            <ul>
              <li>You <strong>must not drive</strong> or operate machinery.</li>
              <li>Arrange for someone to take you home and stay with you overnight.</li>
              <li>Do not travel home alone on public transport.</li>
              <li>Do not drink alcohol or sign legal documents.</li>
            </ul>
          </div>
        </div>

        <div class="callout callout--info" style="margin-top:var(--space-m)">
          ${icon("info")}
          <div>
            <p class="callout__title">Contact us if</p>
            <ul>
              <li>You have a fever, or feel very unwell</li>
              <li>There is more than about a tablespoon of bleeding from the back passage</li>
              <li>You have severe abdominal pain or a very swollen abdomen</li>
              <li>You are vomiting repeatedly</li>
              <li>You feel faint, dizzy or extremely thirsty</li>
            </ul>
          </div>
        </div>

        <div class="panel" style="margin-top:var(--space-m)">
          <h3 style="font-size:var(--step-1)">${icon("print")} Printing this page</h3>
          <p style="margin-top:0.5rem">This page prints cleanly. Use your browser's
          print function to keep a copy, and bring it with you if it helps.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section section--sunken">
  <div class="shell">
    <div class="prose" style="max-width:64ch">
      <h2>Why the preparation matters so much</h2>
      <p>In Australia, inadequate bowel preparation is observed in around 7% of all
      colonoscopies (Bowel Cancer Australia) — roughly 63,000 procedures a year. When
      the bowel is not clean, the endoscopist cannot see the lining properly, polyps
      can be missed, and the procedure may need to be repeated sooner, which means the
      whole preparation again. Following the diet, the fluid intake and the timing gives
      you the best chance of a complete, accurate examination in a single visit.</p>
    </div>
  </div>
</section>

${sourcesBlock(
  [
    { title: "Australian Commission on Safety and Quality in Health Care — Colonoscopy Clinical Care Standard", url: "https://www.safetyandquality.gov.au/clinical-care-standards/colonoscopy" },
    { title: "Bowel Cancer Australia — Bowel preparation for a colonoscopy", url: "https://www.bowelcanceraustralia.org/colonoscopy/bowel-prep/" },
    { title: "Bowel Cancer Australia — Low fibre diet", url: "https://www.bowelcanceraustralia.org/support-care/diet-eating-well/low-fibre/" },
    { title: "healthdirect — Colonoscopy", url: "https://www.healthdirect.gov.au/colonoscopy" },
    { title: "Cancer Council Australia — Colonoscopy", url: "https://www.cancer.org.au/cancer-information/screening-tests-and-treatments/tests-and-scans/colonoscopy" },
    { title: "HealthyWA (WA Department of Health) — Colonoscopy", url: "https://www.healthywa.wa.gov.au/Articles/A_E/Colonoscopy" },
  ],
  "October 2026",
)}

<section class="section section--tight">
  <div class="shell">${emergencyStrip()}</div>
</section>
`;
  writePage({
    url: "/your-visit/bowel-preparation/",
    title: "Bowel preparation",
    description:
      "Bowel preparation instructions for a colonoscopy: the low-fibre diet, clear fluids, split dosing, medicines to check, and what happens on the day.",
    body,
  });
}

/* ------------------------------------------------------------ after surgery */

function afterSurgeryPage() {
  const a = site.afterSurgeryPage;
  const trail = [
    { label: "Home", href: "/" },
    { label: "Your visit", href: "/your-visit/" },
    { label: a.title },
  ];

  const body = `
${pageHead(a.title, a.intro, trail)}

<section class="section">
  <div class="shell">
    <div class="callout callout--urgent" style="max-width:64rem">
      ${icon("alert")}
      <div>
        <p class="callout__title">Contact the practice, or seek urgent care, if you have</p>
        <ul>${a.contactIf.map((f) => `<li>${inline(f)}</li>`).join("")}</ul>
        <p style="margin-top:0.6rem">If you cannot reach the practice and you are
        worried, call healthdirect on
        <a href="tel:${HELP_TEL}">${escapeHTML(site.emergency.healthdirect)}</a>, or go to
        ${escapeHTML(site.emergency.department)}. In an emergency call
        <strong>${escapeHTML(site.emergency.ambulance)}</strong>.</p>
      </div>
    </div>

    <div class="grid grid--2" style="margin-top:var(--space-xl);align-items:start">
      <div class="prose">
        <h2>Hospital stay and going home</h2>
        <p>How long you stay depends on the operation, whether it was done
        laparoscopically, and how quickly your own bowel recovers. After laparoscopic
        (keyhole) colorectal surgery, many people go home after about three to four
        days. After open surgery the stay is often longer, averaging roughly a week to
        ten days. Your own recovery may differ.</p>
        <p>Before you go home you will be given written instructions covering your
        medicines, your diet, wound care and follow-up appointments. Please make sure
        you have them, and that you know who to call if something goes wrong.</p>

        <h2>Pain</h2>
        <p>Some pain is expected, and it is easier to control if you stay ahead of it.
        You will go home with a plan agreed before your surgery — usually regular
        paracetamol and an anti-inflammatory where these are safe for you, with a
        stronger medicine for the first few days if needed.</p>
        <p>Strong opioid medicines such as oxycodone cause constipation and can make
        you drowsy, so they are used as little as possible. If your pain is not
        controlled by the medicines you have, contact the practice rather than
        struggling.</p>

        <h2>Eating and drinking</h2>
        <p>Most people can drink fluids on the day of surgery and eat within a day or
        so, depending on the operation. Start with light, low-fibre foods and build up
        as your appetite returns and as your surgeon advises. If you have had a stoma
        formed, a dietitian will talk with you about the foods that suit you best.</p>

        <h2>Bowel function</h2>
        <p>It is normal for the bowels to be sluggish for a few days after surgery, and
        then to be looser than usual for a while. Constipation is common — plenty of
        fluid, gentle movement and the laxatives you are given all help. Avoid
        straining.</p>
        <p>After rectal surgery in particular, bowel habit can take many months to
        settle. Frequency, urgency and clustering of bowel actions are common and often
        improve gradually over a year or more. If these symptoms are troubling you,
        please raise it at follow-up — there is usually something that can help.</p>

        <h2>Activity and lifting</h2>
        <p>Walking is good from the first day and helps prevent clots and chest
        problems. Avoid heavy lifting — commonly nothing more than about five kilograms
        for the first six weeks — and avoid straining. Ask before returning to driving,
        heavy work, or strenuous exercise, and expect fatigue for some weeks. Build up
        gradually.</p>

        <h2>Wounds</h2>
        <p>Keep wounds clean and dry as instructed. Small amounts of redness around the
        edges are common. Contact us if a wound becomes increasingly painful, swollen,
        hot, or starts discharging.</p>

        <h2>Follow-up</h2>
        <p>After surgery for bowel cancer you will be seen regularly, with blood tests
        and scans, for five years. Further colonoscopies will be arranged periodically
        depending on what was found. This surveillance matters: a recurrence found early
        may still be curable.</p>
      </div>

      <div>
        <div class="panel">
          <h3 style="font-size:var(--step-1)">${icon("clock")} A rough guide to recovery</h3>
          <dl class="deflist" style="margin-top:0.6rem">
            <div><dt>Laparoscopic surgery</dt><dd>Home in about 3–4 days</dd></div>
            <div><dt>Open surgery</dt><dd>Average 8–10 days in hospital</dd></div>
            <div><dt>Back to light activity</dt><dd>Within a few weeks</dd></div>
            <div><dt>Full recovery</dt><dd>Often 3–4 weeks; longer after major surgery</dd></div>
            <div><dt>Follow-up</dt><dd>Regular reviews for 5 years</dd></div>
          </dl>
          <p class="small muted" style="margin-top:var(--space-s)">These are general
          guides only. Your own recovery depends on the operation and on you.</p>
        </div>

        <div class="callout callout--info" style="margin-top:var(--space-m)">
          ${icon("shield")}
          <div>
            <p class="callout__title">Enhanced recovery</p>
            <p>Dr Sutherland follows an enhanced recovery after surgery (ERAS) pathway,
            which is designed to reduce complications and shorten your hospital stay.
            <a href="/procedures/enhanced-recovery-after-colorectal-surgery/">Read about enhanced recovery</a>.</p>
          </div>
        </div>

        <div class="callout callout--note" style="margin-top:var(--space-m)">
          ${icon("info")}
          <div>
            <p class="callout__title">If you have a stoma</p>
            <p>A stoma care nurse will support you before and after your surgery. Most
            stomas made during bowel surgery are temporary and are reversed later. Ask
            your stoma nurse about the appliance that suits you, and about the support
            groups listed in our resources.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

${sourcesBlock(
  [
    { title: "Bowel Cancer Australia — Bowel cancer treatment", url: "https://www.bowelcanceraustralia.org/diagnosis-treatment/surgery-treatment/bowel-cancer-treatment/" },
    { title: "Bowel Cancer Australia — Ileostomy and colostomy", url: "https://www.bowelcanceraustralia.org/diagnosis-treatment/surgery-treatment/ileostomy-colostomy/" },
    { title: "healthdirect — Recovery after surgery", url: "https://www.healthdirect.gov.au/" },
  ],
  "October 2026",
)}

<section class="section section--tight">
  <div class="shell">${emergencyStrip()}</div>
</section>
`;
  writePage({
    url: "/your-visit/after-surgery/",
    title: a.title,
    description:
      "What to expect after colorectal surgery: pain relief, eating, bowel function, activity, wound care, follow-up, and the symptoms that need urgent attention.",
    body,
  });
}

/* ---------------------------------------------------------------- resources */

function resourcesPage() {
  const trail = [{ label: "Home", href: "/" }, { label: "Resources" }];
  const groups = [
    {
      title: "Professional bodies",
      blurb: "The organisations that set the standards for colorectal surgery and train its surgeons.",
      links: [
        ["Colorectal Surgical Society of Australia and New Zealand (CSSANZ)", "https://www.cssanz.org/", "Established by colorectal surgeons in Australia and New Zealand to maintain the highest standards of care. It is the recognised training body for colorectal surgeons in Australia, and all members have completed advanced training in colorectal surgery. The site includes a Find a Colorectal Surgeon directory."],
        ["Royal Australasian College of Surgeons (RACS)", "https://www.surgeons.org/", "The college responsible for the training and continuing professional development of surgeons in Australia and New Zealand."],
        ["American Society of Colon and Rectal Surgeons (ASCRS)", "https://fascrs.org/", "The United States equivalent of the CSSANZ. The ASCRS publishes Diseases of the Colon and Rectum, the leading international journal in the specialty and the journal of the CSSANZ as well."],
        ["Association of Coloproctology of Great Britain and Ireland (ACPGBI)", "https://www.acpgbi.org.uk/", "The United Kingdom equivalent of the CSSANZ, with extensive shared training and collaboration between the two organisations."],
      ],
    },
    {
      title: "Cancer organisations",
      blurb: "Reliable information on bowel cancer, screening and treatment.",
      links: [
        ["Bowel Cancer Australia", "https://www.bowelcanceraustralia.org/", "An Australian charity providing information and support for people affected by bowel cancer, including bowel preparation, low-fibre diets, and stoma information."],
        ["Cancer Council Australia", "https://www.cancer.org.au/", "Information about bowel cancer screening, diagnosis and treatment, and practical support services."],
        ["National Bowel Cancer Screening Program", "https://www.health.gov.au/our-work/national-bowel-cancer-screening-program", "The Australian Government program that sends a free bowel screening test to eligible people every two years."],
        ["National Cancer Screening Register", "https://www.ncsr.gov.au/", "Manages the bowel and cervical screening registers. Request a replacement kit here."],
      ],
    },
    {
      title: "Inflammatory bowel disease",
      blurb: "Support and information for Crohn disease and ulcerative colitis.",
      links: [
        ["Crohn's & Colitis Australia", "https://crohnsandcolitis.com.au/", "The national peak body for people living with Crohn disease and ulcerative colitis, providing information, support and advocacy."],
        ["Gastroenterological Society of Australia (GESA)", "https://www.gesa.org.au/", "The professional body for gastroenterologists in Australia, with patient information resources."],
      ],
    },
    {
      title: "Stoma support",
      blurb: "Practical support for people who have, or may need, a stoma.",
      links: [
        ["Australian Council of Stoma Associations", "https://www.australianstoma.com.au/", "The national body representing stoma associations around Australia."],
        ["Ostomy NSW", "https://www.ostomynsw.org.au/", "A New South Wales self-help organisation for people who have had stoma surgery."],
      ],
    },
    {
      title: "Government and health services",
      blurb: "Guidelines, local health services and health advice.",
      links: [
        ["National Health and Medical Research Council (NHMRC)", "https://www.nhmrc.gov.au/", "Publishes Australian clinical practice guidelines, including the guidelines for the prevention, early detection and management of colorectal cancer."],
        ["healthdirect", "https://www.healthdirect.gov.au/", "Free Australian health advice from registered nurses, 24 hours a day, on 1800 022 222."],
        ["Baringa Private Hospital", "https://www.baringaprivate.com.au/", "A private hospital in Coffs Harbour and part of Ramsay Health Care, where Dr Sutherland operates."],
        ["Mid North Coast Local Health District", "https://mnclhd.health.nsw.gov.au/", "Includes Coffs Harbour Health Campus, the regional public hospital."],
      ],
    },
  ];

  const body = `${pageHead("Resources", site.resourcesIntro, trail)}

<section class="section">
  <div class="shell">
    <div class="callout callout--note" style="max-width:64rem;margin-bottom:var(--space-l)">
      ${icon("info")}
      <div>
        <p class="callout__title">A note about external websites</p>
        <p>These links lead to organisations outside this practice. Their content is
        not under our control. For many colorectal problems the best available evidence
        is specialist opinion rather than settled fact, and more than one approach may be
        reasonable.</p>
      </div>
    </div>

    ${groups
      .map(
        (g) => `<div style="margin-top:var(--space-xl)">
      <h2 style="font-size:var(--step-2)">${escapeHTML(g.title)}</h2>
      <p class="muted" style="margin-top:0.35rem;max-width:60ch">${escapeHTML(g.blurb)}</p>
      <div class="grid grid--2" style="margin-top:var(--space-m)">
        ${g.links
          .map(
            (l) => `<a class="link-card" href="${l[1]}" rel="noopener noreferrer">
          <span class="link-card__title">${escapeHTML(l[0])}${icon("external")}</span>
          <span class="link-card__text">${escapeHTML(l[2])}</span>
        </a>`,
          )
          .join("\n        ")}
      </div>
    </div>`,
      )
      .join("\n    ")}

    <div style="margin-top:var(--space-xl)">
      <h2 style="font-size:var(--step-2)">Local support group</h2>
      <div class="panel" style="margin-top:var(--space-s);max-width:64ch">
        <p>A bowel cancer support group meets in Coffs Harbour on the first Monday of
        each month at Baringa Private Hospital. For details, call
        <strong>(02) 6656 5749</strong>.</p>
      </div>
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="shell">${emergencyStrip()}</div>
</section>
`;
  writePage({
    url: "/resources/",
    title: "Resources",
    description:
      "Trusted organisations for further information about colorectal surgery, bowel cancer, inflammatory bowel disease and stoma support.",
    body,
  });
}

/* ------------------------------------------------------------------ contact */

function contactPage() {
  const trail = [{ label: "Home", href: "/" }, { label: "Contact us" }];

  const body = `${pageHead(
    "Contact us",
    "The practice is in the Orlando Street medical precinct in Coffs Harbour, opposite NBN and Cooper's Surf Shop.",
    trail,
  )}

<section class="section">
  <div class="shell">
    <div class="grid grid--2" style="align-items:start;gap:var(--space-xl)">
      <div>
        <h2 style="font-size:var(--step-2)">Practice details</h2>
        <dl class="deflist" style="margin-top:var(--space-s)">
          <div><dt>Address</dt><dd>${escapeHTML(site.contact.street)}<br>${escapeHTML(site.contact.suburb)} ${escapeHTML(site.contact.state)} ${escapeHTML(site.contact.postcode)}</dd></div>
          <div><dt>Telephone</dt><dd><a href="tel:${TEL}">${escapeHTML(site.contact.phone)}</a></dd></div>
          <div><dt>Fax</dt><dd>${escapeHTML(site.contact.fax)}</dd></div>
          <div><dt>Email</dt><dd><a href="mailto:${escapeHTML(site.contact.email)}">${escapeHTML(site.contact.email)}</a></dd></div>
          <div><dt>Consulting hours</dt><dd>${site.contact.hours.map((h) => `${escapeHTML(h.days)}: ${escapeHTML(h.time)}`).join("<br>")}</dd></div>
        </dl>

        <h2 style="font-size:var(--step-2);margin-top:var(--space-xl)">Getting here</h2>
        <div class="prose" style="margin-top:var(--space-xs)">
          <p>${escapeHTML(site.contact.landmark)} Suite 4 is on the first floor. There is
          a lift and a staircase from the ground-floor entry.</p>
          <p><strong>Parking:</strong> there is limited angle parking on Orlando Street
          in front of the building, and further parking in the surrounding streets. Please
          allow extra time on busy mornings, as the precinct is shared with several other
          practices.</p>
          <p><strong>Public transport:</strong> bus stops are within a short walk on
          Orlando Street and the Pacific Highway. Taxis and rideshare services can drop
          you at the door.</p>
          <p><strong>Accessibility:</strong> the building has lift access to the first
          floor and an accessible toilet. If you have particular access needs, please
          call ahead so we can make sure your visit is straightforward.</p>
          <p><strong>Hospitals:</strong> Dr Sutherland operates at Baringa Private
          Hospital and Coffs Harbour Health Campus, both a short drive from the rooms.</p>
        </div>

        <div class="map-frame" style="margin-top:var(--space-m)">
          <iframe
            title="Map showing the location of Coffs Colorectal Surgery at 29 Orlando Street, Coffs Harbour"
            src="https://www.openstreetmap.org/export/embed.html?bbox=153.1065%2C-30.3020%2C153.1265%2C-30.2900&amp;layer=mapnik&amp;marker=-30.2960%2C153.1165"
            loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
        <p class="small muted" style="margin-top:0.5rem">
          The map is for orientation only. If you cannot see it,
          <a href="https://www.openstreetmap.org/?mlat=-30.2960&amp;mlon=153.1165#map=16/-30.2960/153.1165" rel="noopener noreferrer">open the location in a new page</a>
          — or simply ask us for directions on the phone and we will talk you through it.
        </p>
      </div>

      <div>
        <div class="callout callout--urgent">
          ${icon("alert")}
          <div>
            <p class="callout__title">Not for urgent or clinical matters</p>
            <p>This form is <strong>not monitored outside business hours</strong>. Please
            <strong>do not include personal health or medical details</strong> in it. For
            clinical questions, results, or to change an appointment, please phone the
            practice on <a href="tel:${TEL}">${escapeHTML(site.contact.phone)}</a>. In an
            emergency call <strong>${escapeHTML(site.emergency.ambulance)}</strong>.</p>
          </div>
        </div>

        <form class="card" style="margin-top:var(--space-m)" action="mailto:${escapeHTML(site.contact.email)}" method="post" enctype="text/plain">
          <h2 style="font-size:var(--step-1)">Send a non-clinical enquiry</h2>
          <p class="small muted" style="margin-top:0.35rem">Use this form only for
          administrative enquiries — for example, confirming our address, asking about
          opening hours, or requesting a copy of our fee schedule.</p>

          <div style="margin-top:var(--space-s);display:grid;gap:var(--space-s)">
            <div>
              <label for="name" style="display:block;font-weight:600;margin-bottom:0.3rem">Your name</label>
              <input id="name" name="name" type="text" autocomplete="name" required
                     style="width:100%;min-height:2.75rem;padding:0.6rem 0.7rem;border:1px solid var(--border-strong);border-radius:var(--radius-s);background:var(--surface)">
            </div>
            <div>
              <label for="phone" style="display:block;font-weight:600;margin-bottom:0.3rem">Phone number</label>
              <input id="phone" name="phone" type="tel" autocomplete="tel" required
                     style="width:100%;min-height:2.75rem;padding:0.6rem 0.7rem;border:1px solid var(--border-strong);border-radius:var(--radius-s);background:var(--surface)">
            </div>
            <div>
              <label for="email" style="display:block;font-weight:600;margin-bottom:0.3rem">Email address</label>
              <input id="email" name="email" type="email" autocomplete="email"
                     style="width:100%;min-height:2.75rem;padding:0.6rem 0.7rem;border:1px solid var(--border-strong);border-radius:var(--radius-s);background:var(--surface)">
            </div>
            <div>
              <label for="reason" style="display:block;font-weight:600;margin-bottom:0.3rem">Reason for enquiry</label>
              <select id="reason" name="reason"
                      style="width:100%;min-height:2.75rem;padding:0.6rem 0.7rem;border:1px solid var(--border-strong);border-radius:var(--radius-s);background:var(--surface)">
                <option>General administrative question</option>
                <option>Opening hours or location</option>
                <option>Fees and billing</option>
                <option>I have a referral and would like an appointment</option>
                <option>I am an existing patient — administrative matter</option>
                <option>Referring doctor's rooms</option>
              </select>
            </div>
            <div>
              <label for="message" style="display:block;font-weight:600;margin-bottom:0.3rem">Message</label>
              <textarea id="message" name="message" rows="4"
                        aria-describedby="message-hint"
                        style="width:100%;padding:0.6rem 0.7rem;border:1px solid var(--border-strong);border-radius:var(--radius-s);background:var(--surface)"></textarea>
              <p id="message-hint" class="small muted" style="margin-top:0.3rem">
                Please do not describe symptoms, diagnoses or test results here.
              </p>
            </div>
          </div>

          <p style="margin-top:var(--space-s)">
            <button class="btn btn--primary" type="submit">${icon("mail")}Send enquiry</button>
          </p>

          <p class="small muted" style="margin-top:var(--space-s)">
            <strong>How we handle your information.</strong> Coffs Colorectal Surgery
            collects the name, phone number, email address and message you provide here
            for the purpose of responding to your enquiry. We will not add you to a
            mailing list. Providing these details is optional, but we cannot respond
            without a way to contact you. Your information is handled in accordance with
            our <a href="/privacy/">privacy policy</a> and the Australian Privacy
            Principles. You can ask to see or correct the information we hold about you
            by contacting the practice. Please do not send clinical information through
            this form.
          </p>
        </form>
      </div>
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="shell">${emergencyStrip()}</div>
</section>
`;
  writePage({
    url: "/contact-us/",
    title: "Contact us",
    description:
      "Contact Coffs Colorectal Surgery: address, phone, fax, consulting hours, directions, parking, accessibility, and a non-clinical enquiry form.",
    body,
  });
}

/* --------------------------------------------------------------- visit index */

function visitIndex() {
  const trail = [{ label: "Home", href: "/" }, { label: "Your visit" }];
  const body = `${pageHead(
    "Your visit",
    "Practical information for before and after your appointment — how referrals work, what it costs, how to prepare for a colonoscopy, and what to expect after surgery.",
    trail,
  )}

<section class="section">
  <div class="shell">
    <div class="grid grid--2">
      ${[
        ["/your-visit/symptoms/", "Symptoms and screening", "What to watch for, when to see your GP, when to seek urgent care, and how the national screening program works."],
        ["/your-visit/referrals/", "Referrals and Medicare", "How to get a referral, how long it lasts, what to bring, and information for referring doctors."],
        ["/your-visit/fees/", "Fees and informed financial consent", "Consultation fees, Medicare rebates, the safety net, and the separate bills to expect for surgery."],
        ["/your-visit/bowel-preparation/", "Bowel preparation", "How to prepare for a colonoscopy — the diet, the fluids, your medicines, and what happens on the day."],
        ["/your-visit/after-surgery/", "After your procedure", "Recovery, pain relief, eating, bowel function, wound care, follow-up, and warning signs."],
        ["/resources/", "Resources and support", "Trusted organisations for bowel cancer, inflammatory bowel disease and stoma support."],
      ]
        .map(
          (c) => `<a class="link-card" href="${c[0]}">
        <span class="link-card__title">${escapeHTML(c[1])}${icon("arrow")}</span>
        <span class="link-card__text">${escapeHTML(c[2])}</span>
      </a>`,
        )
        .join("\n      ")}
    </div>
  </div>
</section>

<section class="section section--tight">
  <div class="shell">${emergencyStrip()}</div>
</section>
`;
  writePage({
    url: "/your-visit/",
    title: "Your visit",
    description:
      "Practical information for patients: referrals and Medicare, fees and informed financial consent, bowel preparation for colonoscopy, and recovery after surgery.",
    body,
  });
}

/* -------------------------------------------------------------------- export */

export function render() {
  visitIndex();
  symptomsPage();
  referralsPage();
  feesPage();
  bowelPrepPage();
  afterSurgeryPage();
  resourcesPage();
  contactPage();
}
