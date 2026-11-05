import type { HelpDoc } from './types'

export const en: HelpDoc = {
  title: 'Help centre',
  intro: 'Short answers to what people ask us most. If you can’t find yours, write to us.',
  search: 'Search: lives, streak, cancel, password…',
  noResults: 'Nothing matches those words. Try others or write to us.',
  all: 'All',
  contactTitle: 'Can’t find your answer?',
  contactBody: 'Write to us using the contact form. We reply within one or two working days.',
  contactCta: 'Go to Contact',
  legalTitle: 'Legal documents',
  categories: [
    {
      id: 'empezar',
      title: 'Getting started',
      items: [
        { id: 'que-es', q: 'What is Lumi?', a: ['An app to learn to invest from scratch: short interactive lessons, quizzes and a market with real prices where you practise with virtual money. Lumi, the mascot, is with you every step of the way.'] },
        { id: 'dinero-real', q: 'Is real money used?', a: ['No. All the money in the simulator is virtual and has no value: you can’t pay money in or take it out, and your trades never reach a real market.'] },
        { id: 'cuesta', q: 'Does it cost anything?', a: ['The Free plan is free forever. Plus and Max are optional and expand the course and Lumi.', 'Payments aren’t active yet: you can try the paid plans free for 7 days and, when the trial ends, you go back to Free at no cost.'] },
        { id: 'saber-antes', q: 'Do I need to know anything first?', a: ['No. The course starts with the basics (what money is and why it loses value). If you already know some of it, you can take a placement test at the start to skip what you’ve mastered.'] },
        { id: 'edad', q: 'How old do I need to be?', a: ['At least 14. Between 14 and 17, a parent or guardian has to confirm before you take out a paid plan.'] },
        { id: 'asesoramiento', q: 'Does Lumi tell me what to invest in?', a: ['No. Lumi is education, not financial advice: nothing in the app is a recommendation to buy or sell anything. You learn how markets work so that one day you can decide for yourself, with good judgement.'] },
      ],
    },
    {
      id: 'clases',
      title: 'Lessons and progress',
      items: [
        { id: 'como-clases', q: 'What are the lessons like?', a: ['About 6 minutes each. First you do something (a story with choices, a piece to play with or a mission with real data), then you understand the idea. Every lesson ends with a short quiz.'] },
        { id: 'bloqueadas', q: 'Why are some lessons locked?', a: ['Lessons open in order: when you finish one, the next one opens. Each section opens when you pass the final challenge of the previous one.', 'Some lessons belong to Plus or Max: you’ll see them with a padlock and the plan name.'] },
        { id: 'vidas', q: 'What are lives?', a: ['On the Free plan you have 5 lives for quizzes. You lose one when you get a question wrong and get one back every 4 hours. You can also refill them with gems.', 'On Plus and Max, lives are unlimited.'] },
        { id: 'racha', q: 'How does the streak work?', a: ['It grows by one day each day you finish a lesson or a quiz, or make a trade in the simulator. If you skip a day, it starts again.', 'A streak freeze saves it on a day you can’t make it: you buy it with gems (you can hold 2 at most). On Max you get one every week.'] },
        { id: 'xp-gemas', q: 'What are XP and gems for?', a: ['XP measures what you learn and practise: it makes you level up and compete in the league.', 'You earn gems from achievements, daily goals and moving up a division. They pay for streak freezes and life refills. They can’t be bought with money or exchanged for anything.'] },
        { id: 'liga', q: 'How does the league work?', a: ['Every week you compete in a group of up to 30 people for the XP you earn that week. The top 7 move up a division (and win gems) and the bottom ones move down. It resets every Monday.', 'If you’d rather not show your name, you can appear as «Anonymous player» in Settings.'] },
        { id: 'repaso', q: 'What happens to the questions I get wrong?', a: ['They’re saved so you can review them later, right when you’re about to forget them. That way what you learn sticks.'] },
      ],
    },
    {
      id: 'mercado',
      title: 'Market simulator',
      items: [
        { id: 'saldo', q: 'How much money do I start with?', a: ['€10,000 in virtual money on Free and €50,000 on Plus and Max.'] },
        { id: 'precios', q: 'Are the prices real?', a: ['Yes: they come from public market data sources. They may be delayed (15 minutes or more on some exchanges) or occasionally wrong. They’re for learning only.'] },
        { id: 'ordenes', q: 'Which order types can I use?', a: ['Market orders from the start. Limit, stop loss and take profit orders unlock when you finish the stop loss lesson (on Max, from day one).'] },
        { id: 'no-ejecuta', q: 'Why hasn’t my order gone through?', a: ['The usual reasons: that asset’s market is closed (the order waits for it to open), the price hasn’t reached the one you set in a limit or stop order, or you don’t have enough balance.'] },
        { id: 'comisiones', q: 'Are there fees?', a: ['Yes, simulated ones, so it feels like the real thing: 0.1 % of each trade, with a minimum of €1 in virtual money.'] },
        { id: 'reiniciar', q: 'Can I start my portfolio from scratch?', a: ['Yes, up to 3 times a year, from the portfolio screen. You go back to the starting balance and your positions are closed; you keep your XP, streak and achievements.'] },
      ],
    },
    {
      id: 'lumi',
      title: 'Ask Lumi',
      items: [
        { id: 'que-hace', q: 'What can I ask Lumi?', a: ['Questions about the course, ideas you don’t understand, what to study next and, on paid plans, how your portfolio is doing or which biases show up in your trades. Lumi answers using the course content and your progress.'] },
        { id: 'limite', q: 'How many questions can I ask?', a: ['5 a day on Free, 30 on Plus and 100 on Max. The count resets every day.'] },
        { id: 'privacidad-lumi', q: 'Do my questions leave Lumi?', a: ['No. Lumi runs on our own servers: your questions are not sent to any third-party AI service. You can delete the history at any time from the conversation itself.'] },
      ],
    },
    {
      id: 'planes',
      title: 'Plans and payments',
      items: [
        { id: 'diferencias', q: 'What’s the difference between Free, Plus and Max?', a: ['Free: units 1 to 3 in full and the first 3 lessons of every unit, with 5 lives and 5 questions a day to Lumi.', 'Plus (€3.99/month or €29.99/year): units 1 to 5 in full and the first 5 lessons of every unit, unlimited lives, €50,000 in virtual money and 30 questions a day.', 'Max (€7.99/month or €59.99/year): the whole course, unlimited lives, advanced orders from day one, 100 questions a day with every mode and a streak freeze every week.'], links: [{ href: '/premium', label: 'See the plans' }] },
        { id: 'prueba', q: 'How does the free trial work?', a: ['You get 7 days to try Max, once per person. They unlock in two ways: with a 5-day streak or by joining with a friend’s invitation (then they start as soon as you join).', 'Payments aren’t active yet: the trial ends on its own and you go back to Free at no cost.', 'Once payments are active, we’ll remind you before the trial ends and you’ll be able to cancel at no cost.'] },
        { id: 'cancelar', q: 'How do I cancel my plan?', a: ['In Settings, Subscription, «Cancel subscription». No calls, no questions. You keep what you’ve paid for until the end of the period.'] },
        { id: 'reembolso', q: 'Can I get my money back?', a: ['Yes. You have 14 days to withdraw from the day you sign up and, on top of that, if you ask within 14 days of your first charge, we refund the full amount.'], links: [{ href: '/legal/contratacion', label: 'Terms of purchase' }] },
      ],
    },
    {
      id: 'cuenta',
      title: 'Account and privacy',
      items: [
        { id: 'sin-registro', q: 'Can I try it without signing up?', a: ['Yes: tap «Try it without signing up» and you’re in straight away, with no email or password. If you like it, add an email and password to your account in «Save» and keep all your progress.', 'If you don’t save it, the guest account is deleted after 30 days without signing in. To try Plus or Max you need to save your progress first.'] },
        { id: 'google-bluetooth', q: 'Signing in with Google asks me to turn on Bluetooth', a: ['That’s a Google step, not a Lumi one: if your Google account has a passkey, Google tries to use your phone as the key, and that needs Bluetooth.', 'If it doesn’t work, tap «Try another way» on that Google screen and choose your Google password or a code on your phone. You can also sign in with your email and a Lumi password.'] },
        { id: 'crear-contrasena', q: 'I signed up with Google: can I sign in with email?', a: ['Yes. Sign in once with Google and go to Settings, Account, «Create a password». From then on you can sign in with your email and that password, or keep using Google.'] },
        { id: 'invitar', q: 'How does inviting friends work?', a: ['In Profile, «Invite your friends», you’ll find your link. Your friend gets 7 days of Max for free as soon as they join. You add 7 days of Max when they save their account and finish their first lesson, up to a year in total.'], links: [{ href: '/perfil/invitar', label: 'Invite friends' }] },
        { id: 'contrasena', q: 'I’ve forgotten my password', a: ['On «Sign in», tap «Forgot your password?». If email recovery isn’t available yet, write to us from Contact with your account email and we’ll help you.'], links: [{ href: '/recuperar', label: 'Recover your password' }] },
        { id: 'ajustes', q: 'Where do I change my name, language or theme?', a: ['In Profile, Settings. You can also change your daily goal, notifications and Lumi’s name and look there.'] },
        { id: 'datos', q: 'What data do you keep and why?', a: ['Only what the app needs to work and to get better: your account, your progress, your simulator activity and our own usage statistics. We use no advertising or third-party tools and we don’t sell your data.'], links: [{ href: '/legal/privacidad', label: 'Privacy policy' }] },
        { id: 'descargar-borrar', q: 'How do I download or delete my data?', a: ['In Settings, Account: you can download all your data in a file and delete your account. Deleting it removes your progress, portfolio and history, and it can’t be undone.'] },
      ],
    },
    {
      id: 'seguridad',
      title: 'Safety',
      items: [
        { id: 'fraude', q: 'Someone says they’re from Lumi and offers me an investment', a: ['It’s a scam. Lumi will never ask you for money, bank details, your password or codes by email, message or social media, and will never offer to invest or «manage» your money.', 'Don’t reply, don’t pay anything and tell us from Contact. If you’ve already paid, contact your bank and report it to the police.'] },
        { id: 'cuenta-segura', q: 'How do I keep my account safe?', a: ['Use a password you don’t use anywhere else, with at least 8 characters and a number, or sign in with Google. If someone else uses your device, sign out when you’re done.'] },
        { id: 'error', q: 'I’ve found a bug', a: ['Thanks for telling us. Write to us from Contact explaining what you were doing and what happened; add a screenshot if you can. Using a bug to get ahead in the league is against the rules.'] },
      ],
    },
  ],
}
