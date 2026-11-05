// Legal texts in English (translation of the Spanish version, which prevails in case of doubt)
import { OWNER } from './owner'
import type { LegalDoc, LegalSlug } from './types'

const O = OWNER
const UPDATED = '5 November 2026'

export const en: Record<LegalSlug, LegalDoc> = {
  'aviso-legal': {
    title: 'Legal notice',
    intro: `Last updated: ${UPDATED}. Information required by Spanish Law 34/2002 on information society services and e-commerce (LSSI-CE). The Spanish version prevails.`,
    sections: [
      { h: '1. Owner', table: { head: ['Item', 'Value'], rows: [['Owner', O.name], ['Tax ID (NIF)', O.nif], ['Address', O.address], ['Contact email', O.email], ['Website', O.site]] } },
      {
        h: '2. What Lumi is',
        p: [
          'Lumi is an educational app for learning to invest through lessons, quizzes and a market simulator with virtual money.',
          'Lumi is not a financial institution or an investment firm: it does not receive money from users, does not execute real trades, does not connect to any broker and does not provide investment advice. It is therefore not authorised or supervised by the Spanish securities regulator (CNMV).',
        ],
      },
      {
        h: '3. Market information',
        p: [
          'Prices come from third-party sources (Yahoo Finance and, as a backup for currencies, the European Central Bank) and may be delayed or contain errors. They are shown for educational purposes only and must not be used for real investment decisions.',
          'Nothing in the app — including Lumi’s messages, risk warnings or lessons — is a personalised recommendation to buy, sell or hold any financial instrument.',
        ],
      },
      { h: '4. Terms of use of the site', p: ['Using the app means accepting this legal notice, the Terms of use, the Privacy policy and the Cookie policy.'] },
      {
        h: '5. Intellectual property',
        p: [
          'The texts, exercises, design, logos, the Lumi mascot and the code of Lumi belong to their owner or are used under licence. They may not be copied or distributed without permission, except for personal, non-commercial use.',
          'Brands and company names shown in the simulator belong to their owners and are mentioned only to identify the assets.',
        ],
      },
      {
        h: '6. Liability',
        p: [
          'The owner strives to keep information accurate and the service available, but does not guarantee the absence of errors or interruptions, and is not liable for decisions made outside the app based on its content.',
          'Links to third-party sites are provided for reference only; the owner does not control their content.',
        ],
      },
      { h: '7. Governing law', p: ['This legal notice is governed by Spanish law. For disputes with consumers, the courts of the consumer’s place of residence have jurisdiction.'] },
    ],
  },

  privacidad: {
    title: 'Privacy policy',
    intro: `Last updated: ${UPDATED}. We explain which data we process, why, and your rights under the General Data Protection Regulation (GDPR) and Spanish Organic Law 3/2018 (LOPDGDD). The Spanish version prevails.`,
    sections: [
      { h: '1. Controller', p: [`${O.name} (NIF ${O.nif}), address: ${O.address}. You can write to ${O.email} about any privacy matter.`] },
      {
        h: '2. Data we process',
        list: [
          'Account: email, the name you choose and your password (stored with one-way hashing; we never see it). If you sign in with Google, we receive your Google email and name.',
          'Profile: form of address (feminine, masculine or neutral), date of birth, goals, daily goal, language, currency and theme.',
          'Learning activity: lessons, quiz answers, XP, streak, lives, gems, achievements and league position.',
          'Simulator: orders, trades, virtual portfolio and price alerts. It is all virtual money: we process no bank or payment data.',
          'Technical data: IP address and browser, for security, usage limits and sign-in.',
          'App usage: which screens you visit (at most once a day per screen), how far you get in each lesson and where you first came from (for example, a creator’s link). Only we use it, with our own tools, to improve the course and the app.',
          'Questions to Lumi (the tutor): the text of your questions, the answers and the mode you chose, to show your history and count your daily limit. Lumi runs on our own servers: your questions are not sent to any third-party AI service. You can delete the history at any time.',
          'Communications: what you send through the contact form and, if you sign up, your email on the news list.',
        ],
        p: ['We use no third-party analytics or advertising tools, and we do not sell your data.'],
      },
      {
        h: '3. Purposes and legal bases',
        table: {
          head: ['Purpose', 'Legal basis (GDPR art. 6)'],
          rows: [
            ['Creating your account and providing the service (lessons, simulator, progress, league)', 'Performance of the contract you accept when signing up (6.1.b)'],
            ['Showing your name (first name and initial) in the weekly league', 'Legitimate interest in running the game (6.1.f). You can appear as «Anonymous player» in Settings'],
            ['Security, abuse prevention and usage limits', 'Legitimate interest in protecting the service and its users (6.1.f)'],
            ['Our own statistics to improve the course and the app (which lessons are hardest, which screens are used, where users come from) and to look at your account if you need help', 'Legitimate interest in improving the service and supporting you (6.1.f). No third-party tools'],
            ['In-app notifications (streak, orders, achievements)', 'Performance of the contract (6.1.b); you can turn them off in Settings'],
            ['Answering your questions to Lumi with the course manual and your progress', 'Performance of the contract (6.1.b)'],
            ['Answering your contact messages', 'Your request and our legitimate interest in handling it (6.1.b and 6.1.f)'],
            ['Sending you news if you join the list', 'Your consent (6.1.a), which you can withdraw at any time'],
            ['Complying with legal obligations', 'Legal obligation (6.1.c)'],
          ],
        },
      },
      {
        h: '4. Minors',
        p: [
          'You must be at least 14 to sign up — the age from which people can consent to data processing in Spain (LOPDGDD art. 7). If you are 14 to 17 you can use the free plan; a paid plan (Plus or Max) requires confirmation from a parent or guardian.',
          'If we learn that an account belongs to someone under 14, we will delete it.',
        ],
      },
      {
        h: '5. How long we keep data',
        list: [
          'Account, progress and simulator: while you keep your account. Deleting it in Settings removes them immediately; technical backups are overwritten within 7 days.',
          'Security logs (e.g. sign-in attempts): up to 12 months.',
          'Conversations with Lumi: while you keep your account or until you delete the history.',
          'Guest accounts («Try it without signing up») that never save their progress: deleted with all their data after 30 days without signing in.',
          'Contact messages: 12 months after the last reply.',
          'News list: until you unsubscribe.',
        ],
      },
      {
        h: '6. Processors acting on our behalf',
        p: ['We use providers acting as processors under a contract compliant with GDPR art. 28:'],
        table: {
          head: ['Provider', 'Service', 'Location and safeguards'],
          rows: [
            ['Vercel Inc.', 'App hosting', 'USA · EU-US Data Privacy Framework and standard contractual clauses'],
            ['Neon Inc. (on Amazon Web Services)', 'Database', 'USA (us-east-1) · processor agreement and standard contractual clauses'],
            ['Google LLC', 'Sign in with Google (only if you use it)', 'USA · EU-US Data Privacy Framework'],
            ['Resend Inc.', 'Account emails (confirming your email, changing your password)', 'USA · processor agreement and standard contractual clauses'],
          ],
        },
      },
      { h: '7. International transfers', p: ['Some of these providers are in the United States. Transfers rely on the adequacy decision for the EU-US Data Privacy Framework and, where applicable, on the standard contractual clauses approved by the European Commission.'] },
      { h: '8. Price sources', p: ['Our server requests market prices from Yahoo Finance and, as a backup for currencies, the European Central Bank. These sources receive none of your data.'] },
      {
        h: '9. Your rights',
        p: [
          'You can access, rectify and erase your data, object to its processing, ask for restriction and portability, and withdraw your consent at any time.',
          `In Settings → Account you can download all your data (portability) and delete your account. For anything else, write to ${O.email}. We will reply within one month.`,
          'If you think we have not handled your request properly, you can complain to the Spanish Data Protection Agency (www.aepd.es).',
        ],
      },
      { h: '10. Automated decisions', p: ['We make no decisions with legal effects based solely on automated processing. Lumi’s messages and risk warnings come from simple educational rules and do not restrict what you can do.'] },
      { h: '11. Security', p: ['All traffic is encrypted (HTTPS). Passwords are hashed, the session uses a protected cookie (HttpOnly, Secure, SameSite) and we apply usage limits and controls to prevent abuse.'] },
      { h: '12. Changes', p: ['If we change this policy significantly we will tell you in the app. The last-updated date is shown above.'] },
    ],
  },

  cookies: {
    title: 'Cookie policy',
    intro: `Last updated: ${UPDATED}. Under art. 22.2 of the Spanish LSSI-CE and the AEPD Guide on the use of cookies. The Spanish version prevails.`,
    sections: [
      { h: '1. What they are', p: ['Cookies and similar technologies (such as the browser’s local storage) are small files a website stores on your device to remember information.'] },
      {
        h: '2. What we use',
        p: ['Lumi only uses technical cookies and storage, or preferences you choose. We use no analytics, advertising or third-party cookies.'],
        table: {
          head: ['Name', 'Owner', 'Purpose', 'Duration', 'Type'],
          rows: [
            ['__Secure-better-auth.session_token', 'Lumi', 'Keep you securely signed in', '30 days', 'Technical, necessary'],
            ['better-auth.state', 'Lumi', 'Protect sign-in with Google (only if you use it)', '10 minutes', 'Technical, necessary'],
            ['NEXT_LOCALE', 'Lumi', 'Remember the language you choose in Settings', '1 year', 'Preference you chose'],
            ['et-theme (local storage)', 'Lumi', 'Remember the light or dark theme', 'Until you delete it', 'Preference you chose'],
            ['et-cookies (local storage)', 'Lumi', 'Remember that you have seen the cookie notice', 'Until you delete it', 'Technical'],
          ],
        },
      },
      {
        h: '3. Consent',
        p: [
          'Technical cookies and preferences you request are exempt from consent (LSSI-CE art. 22.2). That is why we do not ask you to accept anything: we only inform you.',
          'If we ever add cookies that need your permission (for example, analytics), we will ask before using them, with «Accept» and «Reject» given equal prominence, and you will be able to change your mind at any time.',
        ],
      },
      { h: '4. How to delete or block them', p: ['You can delete or block cookies in your browser settings. If you block the session cookie you will not be able to sign in.'] },
    ],
  },

  terminos: {
    title: 'Terms of use',
    intro: `Last updated: ${UPDATED}. These terms govern the use of Lumi. You accept them when you create an account. The Spanish version prevails.`,
    sections: [
      { h: '1. The service', p: [`Lumi, by ${O.name}, offers lessons, quizzes, a market simulator with virtual money and game elements (XP, streak, lives, gems, achievements and league) for learning to invest.`] },
      {
        h: '2. It is an educational simulation',
        list: [
          'No real money is traded and you cannot deposit or withdraw money. The portfolio balance is virtual and has no monetary value.',
          'It is not financial advice or an investment recommendation. Simulator results do not guarantee real results.',
          'Prices come from third-party sources, may be delayed or wrong, and the simulator simplifies reality (for example, there are no dividends or bid-ask spreads).',
        ],
      },
      {
        h: '3. Your account',
        list: [
          'You must be at least 14. From 14 to 17, a paid plan (Plus or Max) requires the consent of a parent or guardian.',
          'One account per person. Look after your password: you are responsible for what is done with your account.',
          'You can delete your account at any time in Settings.',
        ],
      },
      {
        h: '4. Acceptable use',
        p: ['You may not:'],
        list: [
          'Use bots, scripts or any automation to answer, trade or earn XP, gems or league positions.',
          'Exploit bugs in the service for an advantage, or fail to report them when you find them.',
          'Create several accounts to manipulate the league or rewards.',
          'Try to access other people’s data, overload the service or bypass its security limits.',
          'Use offensive names, impersonate others or infringe third-party rights.',
        ],
      },
      { h: '5. Consequences', p: ['If these terms are breached we may correct progress or rewards obtained improperly, reset the virtual portfolio, or suspend or close the account. We will explain why and you will be able to respond.'] },
      { h: '6. XP, gems, lives and achievements', p: ['They are game elements with no monetary value. They cannot be bought with money, sold, transferred or exchanged for money or prizes. We may adjust how they work to improve learning.'] },
      {
        h: '7. Paid plans (Plus and Max)',
        list: [
          'Plus and Max extend lessons, lives, virtual balance, order types and questions to Lumi. The price and what each plan includes are shown before you subscribe.',
          'There is a 7-day free trial, one per person. In the current version payments are not active yet: the trial ends by itself and you go back to Free at no cost.',
          'Once payments are active, purchases are governed by the Terms of purchase: price, renewal, cancellation in Settings, a reminder before the first charge after the trial and 14 calendar days to withdraw.',
        ],
      },
      {
        h: '8. Invitations',
        list: [
          'Everyone has an invitation link. If someone creates their account with it, saves it with an email and password and finishes their first lesson, you both get 30 days of Max for free.',
          'You can earn up to 12 months in total. The gift has no monetary value, cannot be exchanged for money or transferred, and is added to any Max you already have.',
          'Inviting yourself, creating fake accounts or buying or selling invitations is not allowed. If it happens, we may withdraw the gifted months and apply section 5.',
          'We may change or end the programme with prior notice in the app; months already earned are kept.',
        ],
      },
      { h: '9. Intellectual property', p: ['Lumi content belongs to its owner or is used under licence. You may use it for your personal learning, but not copy or distribute it without permission.'] },
      { h: '10. Liability', p: ['We take great care with the service, but it may have errors or interruptions. We are not liable for real investment decisions made based on the app. Nothing here limits your statutory rights as a consumer.'] },
      { h: '11. Changes to the service and the terms', p: ['We may improve or change features. If we change these terms significantly we will give you advance notice in the app.'] },
      { h: '12. Law and disputes', p: [`Spanish law applies. If you have a problem, write to us first at ${O.email} and we will try to solve it. As a consumer you may also contact the consumer bodies of your region and the courts of your place of residence.`] },
    ],
  },
  contratacion: {
    title: 'Terms of purchase',
    intro: `Last updated: ${UPDATED}. They apply when you take out a paid plan (Plus or Max) and complement the Terms of use. They comply with Spanish Royal Legislative Decree 1/2007 (General Law for the Protection of Consumers and Users) and the LSSI-CE. While payments are not active, plans can only be tried for free and nothing is charged. The Spanish version prevails.`,
    sections: [
      {
        h: '1. Who sells to you',
        table: {
          head: ['Item', 'Value'],
          rows: [
            ['Owner', O.name],
            ['Tax ID (NIF)', O.nif],
            ['Address', O.address],
            ['Email', O.email],
          ],
        },
      },
      {
        h: '2. What you buy and what it costs',
        p: ['Final prices in euros, all taxes included. There are no other charges.'],
        table: {
          head: ['Plan', 'What it includes', 'Monthly', 'Yearly'],
          rows: [
            ['Plus', 'Units 1 to 5 in full and the first 5 lessons of every unit, unlimited lives, €50,000 in virtual money and 30 questions a day to Lumi with the «My portfolio» mode.', '€3.99/month', '€29.99/year'],
            ['Max', 'The whole course, unlimited lives, €50,000 in virtual money, advanced orders from day one, 100 questions a day to Lumi with every mode and a streak freeze every week.', '€7.99/month', '€59.99/year'],
          ],
        },
      },
      {
        h: '3. How to buy',
        list: [
          'Choose the plan and period on the plans screen, check the price and confirm with the purchase button. Before paying you can correct anything by going back.',
          'The contract is concluded when you confirm. We send you the confirmation by email and you can check your plan at any time in Settings, Subscription.',
          'The contract is concluded in Spanish, Catalan or English, depending on the app language. We keep a record of the purchase and send it to you on request.',
        ],
      },
      {
        h: '4. Free trial',
        list: [
          'The first time you take out a paid plan you get a 7-day free trial (once per person).',
          'If you cancel before it ends, you pay nothing. Otherwise, when it ends the first period of the chosen plan is charged.',
          'We will remind you in the app and by email before the trial ends.',
        ],
      },
      {
        h: '5. Payment',
        list: [
          'You pay by card through Stripe, which processes the payment securely. We never see or store your full card details.',
          'Each period is charged in advance, on the day it starts. You will receive a receipt for each charge by email.',
          'If a charge fails, we will tell you and retry for a few days; if it still cannot be charged, your plan goes back to Free and you keep your progress.',
        ],
      },
      {
        h: '6. Renewal, changes and cancellation',
        list: [
          'The subscription renews automatically for the same period and price until you cancel it.',
          'You can cancel whenever you like in Settings, Subscription, with no explanation needed. You keep the plan until the end of the paid period and are not charged again.',
          'If we change the price, we will tell you at least 30 days in advance and before your next renewal; if you disagree, you can cancel before it applies.',
        ],
      },
      {
        h: '7. Right of withdrawal and refunds',
        list: [
          'As a consumer, you have 14 calendar days from the purchase to withdraw from the contract without giving any reason.',
          'On top of that, as our own commercial guarantee: if you ask within 14 calendar days of your first charge, we refund the full amount, even if you have already used the plan.',
          `To do so, write to ${O.email} with your account email, or use the form in section 11. We will refund you within 14 days using the same payment method, at no cost to you.`,
        ],
      },
      {
        h: '8. Minors',
        p: ['If you are 14 to 17, a parent or guardian has to confirm before you take out a paid plan. Without that confirmation the purchase cannot be completed.'],
      },
      {
        h: '9. If something does not work',
        p: [
          'The service must work as described. If it does not, you are entitled to have it fixed and, if we cannot do so within a reasonable time, to a price reduction or to end the contract with the corresponding refund (conformity guarantee for digital content and services).',
          'Lumi is an educational service with virtual money: it does not guarantee any real financial result.',
        ],
      },
      {
        h: '10. Questions and complaints',
        p: [
          `Write to ${O.email}: we reply within 7 days at most and try to do so sooner. If you are not satisfied, you can turn to the consumer services of your region or to the courts of your place of residence.`,
          'We are not currently part of any consumer arbitration scheme.',
        ],
      },
      {
        h: '11. Model withdrawal form',
        p: [
          'Only fill it in and send it to us if you want to withdraw from the contract. An email with the same details also works.',
          `For the attention of ${O.name}, ${O.address}, ${O.email}:`,
          'I hereby give notice that I withdraw from my contract for the following service: [Plus or Max] plan, [monthly or yearly].',
          'Purchased on: [date] · Name: [your name] · Account email: [your email] · Date: [today’s date] · Signature (only if sent on paper).',
        ],
      },
    ],
  },
}
