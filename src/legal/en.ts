// Legal texts in English (translation of the Spanish version, which prevails in case of doubt)
import { OWNER } from './owner'
import type { LegalDoc, LegalSlug } from './types'

const O = OWNER
const UPDATED = '24 October 2026'

export const en: Record<LegalSlug, LegalDoc> = {
  'aviso-legal': {
    title: 'Legal notice',
    intro: `Last updated: ${UPDATED}. Information required by Spanish Law 34/2002 on information society services and e-commerce (LSSI-CE). The Spanish version prevails.`,
    sections: [
      { h: '1. Owner', table: { head: ['Item', 'Value'], rows: [['Owner', O.name], ['Tax ID (NIF)', O.nif], ['Address', O.address], ['Contact email', O.email], ['Website', O.site]] } },
      {
        h: '2. What E-Trading is',
        p: [
          'E-Trading is an educational app for learning to invest through lessons, quizzes and a market simulator with virtual money.',
          'E-Trading is not a financial institution or an investment firm: it does not receive money from users, does not execute real trades, does not connect to any broker and does not provide investment advice. It is therefore not authorised or supervised by the Spanish securities regulator (CNMV).',
        ],
      },
      {
        h: '3. Market information',
        p: [
          'Prices come from third-party sources (Finnhub, Binance, Yahoo Finance and the European Central Bank) and may be delayed or contain errors. They are shown for educational purposes only and must not be used for real investment decisions.',
          'Nothing in the app — including Lumi’s messages, risk warnings or lessons — is a personalised recommendation to buy, sell or hold any financial instrument.',
        ],
      },
      { h: '4. Terms of use of the site', p: ['Using the app means accepting this legal notice, the Terms of use, the Privacy policy and the Cookie policy.'] },
      {
        h: '5. Intellectual property',
        p: [
          'The texts, exercises, design, logos, the Lumi mascot and the code of E-Trading belong to their owner or are used under licence. They may not be copied or distributed without permission, except for personal, non-commercial use.',
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
            ['In-app notifications (streak, orders, achievements)', 'Performance of the contract (6.1.b); you can turn them off in Settings'],
            ['Answering your contact messages', 'Your request and our legitimate interest in handling it (6.1.b and 6.1.f)'],
            ['Sending you news if you join the list', 'Your consent (6.1.a), which you can withdraw at any time'],
            ['Complying with legal obligations', 'Legal obligation (6.1.c)'],
          ],
        },
      },
      {
        h: '4. Minors',
        p: [
          'You must be at least 14 to sign up — the age from which people can consent to data processing in Spain (LOPDGDD art. 7). If you are 14 to 17 you can use the free plan; Premium requires confirmation from a parent or guardian.',
          'If we learn that an account belongs to someone under 14, we will delete it.',
        ],
      },
      {
        h: '5. How long we keep data',
        list: [
          'Account, progress and simulator: while you keep your account. Deleting it in Settings removes them immediately; technical backups are overwritten within 7 days.',
          'Security logs (e.g. sign-in attempts): up to 12 months.',
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
          ],
        },
      },
      { h: '7. International transfers', p: ['Some of these providers are in the United States. Transfers rely on the adequacy decision for the EU-US Data Privacy Framework and, where applicable, on the standard contractual clauses approved by the European Commission.'] },
      { h: '8. Price sources', p: ['Our server requests market prices from Finnhub, Binance, Yahoo Finance and the European Central Bank. These sources receive none of your data.'] },
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
        p: ['E-Trading only uses technical cookies and storage, or preferences you choose. We use no analytics, advertising or third-party cookies.'],
        table: {
          head: ['Name', 'Owner', 'Purpose', 'Duration', 'Type'],
          rows: [
            ['__Secure-better-auth.session_token', 'E-Trading', 'Keep you securely signed in', '30 days', 'Technical, necessary'],
            ['better-auth.state', 'E-Trading', 'Protect sign-in with Google (only if you use it)', '10 minutes', 'Technical, necessary'],
            ['NEXT_LOCALE', 'E-Trading', 'Remember the language you choose in Settings', '1 year', 'Preference you chose'],
            ['et-theme (local storage)', 'E-Trading', 'Remember the light or dark theme', 'Until you delete it', 'Preference you chose'],
            ['et-cookies (local storage)', 'E-Trading', 'Remember that you have seen the cookie notice', 'Until you delete it', 'Technical'],
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
    intro: `Last updated: ${UPDATED}. These terms govern the use of E-Trading. You accept them when you create an account. The Spanish version prevails.`,
    sections: [
      { h: '1. The service', p: [`E-Trading, by ${O.name}, offers lessons, quizzes, a market simulator with virtual money and game elements (XP, streak, lives, gems, achievements and league) for learning to invest.`] },
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
          'You must be at least 14. From 14 to 17, Premium requires the consent of a parent or guardian.',
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
        h: '7. Premium',
        list: [
          'Premium extends lessons, lives, virtual balance and order types. The price and conditions are shown before you subscribe.',
          'There is a 7-day free trial, one per person. In the current version payments are not active yet: the trial ends by itself and you go back to Free at no cost.',
          'Once payments are active: the subscription renews automatically until you cancel it in Settings, we will notify you before each charge and, as a consumer, you will have 14 calendar days to withdraw from the date of subscription.',
        ],
      },
      { h: '8. Intellectual property', p: ['E-Trading content belongs to its owner or is used under licence. You may use it for your personal learning, but not copy or distribute it without permission.'] },
      { h: '9. Liability', p: ['We take great care with the service, but it may have errors or interruptions. We are not liable for real investment decisions made based on the app. Nothing here limits your statutory rights as a consumer.'] },
      { h: '10. Changes to the service and the terms', p: ['We may improve or change features. If we change these terms significantly we will give you advance notice in the app.'] },
      { h: '11. Law and disputes', p: [`Spanish law applies. If you have a problem, write to us first at ${O.email} and we will try to solve it. As a consumer you may also contact the consumer bodies of your region and the courts of your place of residence.`] },
    ],
  },
}
