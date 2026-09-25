// Default legal / static pages inserted on first migration (editable in Admin → Pages).
const SITE = "Lottery Sambad Plus";
const DOMAIN = "lotterysambad.plus";
const EMAIL = "contact@lotterysambad.plus";
const UPDATED = "September 2026";

export const DEFAULT_PAGES = [
  {
    slug: "about-us",
    title: "About Us",
    sortOrder: 1,
    metaDescription: `About ${SITE} – an independent, fast and ad-light website that publishes Lottery Sambad 1 PM, 6 PM and 8 PM results for information and education.`,
    content: `**${SITE}** (${DOMAIN}) is an independent information website that publishes the **Dear Lottery Sambad results** of the 1 PM, 6 PM and 8 PM draws as quickly and accurately as possible.

## What we do

- Publish every day's **1 PM, 6 PM and 8 PM** results in both **text and image** format.
- Keep a complete, searchable **old result archive** organised by date and month.
- Offer free tools such as the **ticket checker**, result charts and draw schedule.
- Keep the site **fast, clean and mobile-friendly**, with a dark mode for night-time reading.

## What we don't do

We are **not** a lottery operator, seller, agent or distributor. We do not sell tickets, accept payments, predict numbers or promote gambling of any kind. The website is made for **educational purposes and result display only**.

## Accuracy

Results are collected from publicly available sources soon after each draw and checked automatically. Mistakes can still happen, so **always verify your ticket with the official Government Gazette / state lottery department** before claiming a prize.

## Contact

Questions, corrections or feedback? Write to us at **${EMAIL}** or use our [Contact Us](/contact-us) page.`,
  },
  {
    slug: "contact-us",
    title: "Contact Us",
    sortOrder: 2,
    metaDescription: `Contact the ${SITE} team for corrections, feedback, advertising or DMCA requests.`,
    content: `We would love to hear from you. Whether you found an error in a result, have a suggestion, or want to talk about advertising, reach out any time.

## Email

**${EMAIL}**

We usually reply within 24–48 hours (Monday to Saturday).

## Before you write

- **Result corrections:** please mention the draw date and time (1 PM / 6 PM / 8 PM) and the correct number with a reference.
- **Prize claims:** we cannot help with prize claims, ticket sales or payments. Please contact the official state lottery department.
- **Copyright / DMCA:** see our [DMCA policy](/dmca) for the details we need.

Please note: ${SITE} is an informational website only and is not connected with any government lottery department.`,
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    sortOrder: 3,
    metaDescription: `Read the privacy policy of ${SITE}: what data we collect, cookies, Google AdSense, Google Analytics and your choices.`,
    content: `*Last updated: ${UPDATED}*

This Privacy Policy explains how **${SITE}** ("we", "us", "our"), available at **${DOMAIN}**, collects, uses and protects information when you visit our website.

## Information we collect

**We do not ask you to create an account** and we do not collect personal information such as your name, phone number or address unless you voluntarily send it to us by email.

We automatically receive standard technical information, such as:

- Browser type, device type and operating system
- Pages visited, time spent and referring website
- Approximate location (city / country) derived from IP address

The **ticket checker** runs in your browser. The ticket numbers you type are compared with published results and are **not stored** by us.

## Cookies

We use cookies and similar technologies to remember preferences (for example dark mode), understand how the site is used, and show advertisements. You can disable cookies in your browser settings; some features may not work correctly without them.

## Google AdSense and third-party advertising

We may use Google AdSense and other advertising partners to show ads. These third-party vendors, including Google, use cookies to serve ads based on your prior visits to this and other websites.

- Google's use of advertising cookies enables it and its partners to serve ads based on your visits to our site and/or other sites on the Internet.
- You may opt out of personalised advertising by visiting [Google Ads Settings](https://www.google.com/settings/ads) or [www.aboutads.info](https://www.aboutads.info).

## Google Analytics

We may use Google Analytics to understand traffic in an aggregated, anonymous form. Learn more in [Google's Privacy Policy](https://policies.google.com/privacy).

## How we use information

- To operate, maintain and improve the website
- To measure performance and fix technical problems
- To display relevant advertising that keeps the website free

We **never sell** your personal information.

## Children's information

This website is not directed at persons under 18 years of age. We do not knowingly collect information from minors.

## Third-party links

Our pages may link to official lottery websites and other external sites. We are not responsible for their content or privacy practices.

## Your rights

You may contact us to ask about, correct or delete any information you have sent to us by email.

## Changes to this policy

We may update this policy from time to time. Changes are posted on this page with a new "Last updated" date.

## Contact

For any privacy questions, email **${EMAIL}**.`,
  },
  {
    slug: "disclaimer",
    title: "Disclaimer",
    sortOrder: 4,
    metaDescription: `${SITE} disclaimer: the website is for educational purposes and result display only and does not promote or sell lottery tickets.`,
    content: `*Last updated: ${UPDATED}*

## Educational & informational purpose only

**${SITE}** (${DOMAIN}) is an independent website created for **educational purposes and result display only**. All information is provided in good faith for general information.

## No association with any government body

We are **not affiliated with, endorsed by or connected to** the Nagaland State Lotteries, Sikkim State Lotteries, any state government, the Directorate of State Lotteries or any lottery distributor. All trademarks and names belong to their respective owners.

## We do not promote or sell lotteries

- We **do not sell, promote, advertise or distribute** lottery tickets.
- We **do not accept money**, run any scheme or offer "sure-shot" numbers or predictions.
- We **do not encourage gambling**. Lottery may be habit-forming and involves financial risk. Participate only where it is legal in your state and only if you are 18 years or older.

## Accuracy of results

Results are collected from publicly available sources soon after each draw. While we try our best to keep everything correct and updated, we make **no warranty** regarding the completeness, accuracy or reliability of any result. **Always verify your ticket number with the official Government Gazette** or the concerned state lottery department before claiming a prize.

## Limitation of liability

Under no circumstance shall ${SITE} be liable for any loss or damage arising from the use of, or reliance on, any information on this website.

## External links

Links to external websites are provided for convenience only. We have no control over their content and accept no responsibility for them.

## Contact

If you believe something on this site is incorrect, please write to **${EMAIL}**.`,
  },
  {
    slug: "dmca",
    title: "DMCA Policy",
    sortOrder: 5,
    metaDescription: `${SITE} DMCA / copyright policy and how to submit a takedown notice.`,
    content: `*Last updated: ${UPDATED}*

${SITE} respects the intellectual property rights of others. Lottery results are public information; however, if you believe that any material on ${DOMAIN} infringes your copyright, please send us a notice.

## How to file a DMCA notice

Send an email to **${EMAIL}** with the subject "DMCA Takedown" including:

1. Your full name, organisation (if any) and contact details.
2. A description of the copyrighted work you claim has been infringed.
3. The exact URL(s) on ${DOMAIN} where the material appears.
4. Proof that you own the copyright or are authorised to act on behalf of the owner.
5. A statement that you have a good-faith belief that the use is not authorised by the copyright owner, its agent or the law.
6. A statement that the information in the notice is accurate, and under penalty of perjury, that you are authorised to act on behalf of the owner.
7. Your physical or electronic signature.

## Our response

We review valid requests promptly and, where appropriate, remove or disable access to the material, usually within **48–72 hours**.

## Counter-notice

If you believe material was removed by mistake, you may send a counter-notice with the same details to **${EMAIL}**.`,
  },
  {
    slug: "content-policy",
    title: "Content Policy",
    sortOrder: 6,
    metaDescription: `${SITE} content policy – how results are collected, verified and corrected, and what we never publish.`,
    content: `*Last updated: ${UPDATED}*

This policy explains how content on **${SITE}** is created, checked and corrected.

## What we publish

- Daily Lottery Sambad results (1 PM, 6 PM and 8 PM draws) in **text and image** form.
- Old results, charts, draw schedules, prize structure and how-to guides.
- Informational articles meant to help readers understand results and check tickets correctly.

## How results are collected

Results are gathered automatically from **publicly available sources** shortly after each draw and checked for consistency (date, draw time, number format and duplicates). Where sources disagree, the result is reviewed and corrected manually.

## What we never publish

- Number predictions, "guess numbers", tips or claims of guaranteed winnings.
- Offers to sell tickets, collect money or join any lottery scheme.
- Content that encourages minors to take part in any lottery.
- Misleading, hateful, adult or illegal content.

## Corrections

If you spot an error, email **${EMAIL}** with the draw date, time and correct number. Verified corrections are applied as soon as possible and the page's "updated" time is changed accordingly.

## Responsible participation

Lottery involves financial risk and may be addictive. We display results only for information; please verify with the official gazette and participate only where it is legal and only if you are 18+.`,
  },
  {
    slug: "terms-and-conditions",
    title: "Terms & Conditions",
    sortOrder: 7,
    metaDescription: `Terms and conditions for using ${SITE} (${DOMAIN}).`,
    content: `*Last updated: ${UPDATED}*

By accessing **${DOMAIN}** you agree to these Terms & Conditions. If you do not agree, please do not use the website.

## Use of the website

- The website is provided for **personal, informational and educational use** only.
- You must not copy, scrape or republish our content in bulk without written permission.
- You must not attempt to disrupt, hack or overload the website.

## No sale of lottery

${SITE} does not sell, promote or distribute lottery tickets and does not accept any payments. Any person claiming to sell tickets or "fixed numbers" on our behalf is a fraud.

## Accuracy

Results are provided "as is" without any warranty. Always confirm with the official Government Gazette before acting on any information.

## Intellectual property

The design, logo, text and code of this website belong to ${SITE}, except for third-party material, which belongs to its respective owners.

## Changes

We may update these terms at any time. Continued use of the website means you accept the updated terms.

## Governing law

These terms are governed by the laws of India.

## Contact

Email **${EMAIL}** for any questions.`,
  },
];
