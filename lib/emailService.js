import sgMail from '@sendgrid/mail';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PREMIUM_PDFS_ENABLED } from '@/lib/featureFlags';

const isSendGridConfigured =
  process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.');

if (isSendGridConfigured) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

let genAI = null;
let geminiModel = null;

if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'placeholder') {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  for (const model of ['gemini-2.5-flash', 'gemini-2.0-flash']) {
    try {
      geminiModel = genAI.getGenerativeModel({ model });
      break;
    } catch {
      // Model not available, try next
    }
  }
}

class EmailService {
  constructor() {
    this.isConfigured = isSendGridConfigured;
    this.isAIConfigured =
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== 'placeholder' &&
      geminiModel !== null;
  }

  getBaseUrl() {
    return (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
  }

  buildUrl(path) {
    const baseUrl = this.getBaseUrl();
    return baseUrl ? `${baseUrl}${path}` : null;
  }

  renderButton(url, label) {
    if (!url || !label) return '';
    return `<p style="margin: 24px 0;"><a href="${url}" style="background: #0f172a; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 6px; display: inline-block;">${label}</a></p>`;
  }

  escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  formatMessageHtml(message) {
    return this.escapeHtml(message).replace(/\r?\n/g, '<br>');
  }

  renderShell({ eyebrow, title, intro, body, bullets = [], ctaLabel, ctaUrl, closing }) {
    const listHtml =
      bullets.length > 0
        ? `<ul style="padding-left: 20px; margin: 16px 0;">${bullets
            .map((item) => `<li style="margin: 8px 0;">${item}</li>`)
            .join('')}</ul>`
        : '';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a; line-height: 1.6;">
        ${eyebrow ? `<p style="font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">${eyebrow}</p>` : ''}
        <h1 style="font-size: 28px; line-height: 1.2; margin: 0 0 16px;">${title}</h1>
        ${intro ? `<p>${intro}</p>` : ''}
        ${body ? `<p>${body}</p>` : ''}
        ${listHtml}
        ${this.renderButton(ctaUrl, ctaLabel)}
        ${closing ? `<p>${closing}</p>` : ''}
        <p style="margin-top: 24px;">Domy v Itálii</p>
      </div>
    `;
  }

  formatPlainText({ intro, body, bullets = [], url, closing }) {
    const bulletBlock = bullets.length > 0 ? `\n- ${bullets.join('\n- ')}` : '';
    return [intro, body, bulletBlock.trim(), url || '', closing, 'Domy v Itálii']
      .filter(Boolean)
      .join('\n\n');
  }

  async generateAIContent(type, data) {
    if (!this.isAIConfigured || !genAI) {
      return null;
    }

    const prompts = {
      welcome: `Write a concise welcome email for ${data.userName}. Return JSON with keys subject and body.`,
      'inquiry-response': `Write a concise inquiry confirmation email for ${data.userName} about "${data.propertyTitle}". Return JSON with keys subject and body.`,
      'property-alert': `Write a concise property alert email for ${data.userName}. We found ${data.properties.length} properties. Return JSON with keys subject and body.`
    };

    const prompt = prompts[type];
    if (!prompt) return null;

    for (const model of ['gemini-2.5-flash', 'gemini-2.0-flash']) {
      try {
        const currentModel = genAI.getGenerativeModel({ model });
        const result = await currentModel.generateContent(prompt);
        const text = result.response.text().trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '');
        const content = JSON.parse(text);
        if (content?.subject && content?.body) {
          return content;
        }
      } catch (error) {
        console.error(`[EMAIL SYSTEM] AI generation failed with ${model}:`, error.message);
      }
    }

    return null;
  }

  async sendEmail({ to, subject, text, html, replyTo }) {
    if (!this.isConfigured) {
      console.log('\n========================================');
      console.log('[EMAIL SYSTEM] SIMULATION MODE - Email NOT sent');
      console.log('========================================');
      console.log('From (System):', process.env.SENDGRID_FROM_EMAIL || '(Not Set)');
      console.log('To:', to);
      console.log('Reply-To:', replyTo || '(Default)');
      console.log('Subject:', subject);
      console.log('---');
      console.log('Text Content:');
      console.log(text);
      console.log('---');
      console.log('HTML Content:');
      console.log(html);
      console.log('========================================\n');

      return {
        success: true,
        provider: 'simulation',
        message: 'Email logged to console (SendGrid not configured)'
      };
    }

    const verifiedSender = process.env.SENDGRID_FROM_EMAIL;
    if (!verifiedSender) {
      const errorMsg =
        'Missing SENDGRID_FROM_EMAIL environment variable. SendGrid requires a verified sender.';
      console.error(`[EMAIL SYSTEM] ${errorMsg}`);
      return {
        success: false,
        provider: 'sendgrid',
        error: errorMsg
      };
    }

    try {
      const msg = {
        to,
        from: verifiedSender,
        replyTo,
        subject,
        text,
        html
      };

      Object.keys(msg).forEach((key) => msg[key] === undefined && delete msg[key]);

      const result = await sgMail.send(msg);
      return {
        success: true,
        provider: 'sendgrid',
        statusCode: result[0].statusCode
      };
    } catch (error) {
      console.error('[EMAIL SYSTEM] Error sending email via SendGrid:', error.message);
      if (error.response) {
        console.error(JSON.stringify(error.response.body, null, 2));
      }
      return {
        success: false,
        provider: 'sendgrid',
        error: error.message
      };
    }
  }

  async sendPropertyAlert({ userEmail, userName, properties, searchCriteria }) {
    const aiContent = await this.generateAIContent('property-alert', {
      userName,
      properties,
      searchCriteria
    });

    const recommendationsUrl = this.buildUrl('/dashboard/recommendations');
    const criteriaSummary = [
      searchCriteria?.type ? `Property type: ${searchCriteria.type}` : null,
      searchCriteria?.city ? `Area: ${searchCriteria.city}` : null,
      searchCriteria?.priceMin ? `Minimum budget: EUR ${searchCriteria.priceMin}` : null,
      searchCriteria?.priceMax ? `Maximum budget: EUR ${searchCriteria.priceMax}` : null
    ].filter(Boolean);

    const subject =
      aiContent?.subject ||
      `${properties.length} new propert${properties.length === 1 ? 'y' : 'ies'} matching your search`;

    const intro = `Hi ${userName}, we found ${properties.length} new propert${properties.length === 1 ? 'y' : 'ies'} matching your saved search.`;
    const body =
      aiContent?.body ||
      'Open your dashboard to review the new listings and decide which ones are worth a closer look.';

    return this.sendEmail({
      to: userEmail,
      subject,
      text: this.formatPlainText({
        intro,
        body,
        bullets: criteriaSummary,
        url: recommendationsUrl || 'Log in to your dashboard to review the new matches.',
        closing:
          'If you no longer want these alerts, you can change your notification preferences in your account.'
      }),
      html: this.renderShell({
        eyebrow: 'Property alerts',
        title: subject,
        intro,
        body,
        bullets: criteriaSummary,
        ctaLabel: recommendationsUrl ? 'View matching properties' : null,
        ctaUrl: recommendationsUrl,
        closing:
          'If you no longer want these alerts, you can change your notification preferences in your account.'
      })
    });
  }

  async sendInquiryConfirmation({ userEmail, userName, propertyTitle, inquiryMessage }) {
    const aiContent = await this.generateAIContent('inquiry-response', {
      userName,
      propertyTitle,
      inquiryMessage
    });

    const inquiriesUrl = this.buildUrl('/dashboard/inquiries');
    const subject = aiContent?.subject || `We received your inquiry about ${propertyTitle}`;
    const intro = `Hi ${userName}, thank you for getting in touch about "${propertyTitle}".`;
    const body =
      aiContent?.body ||
      'Your message has been recorded and our team will review it shortly. You can also track your inquiries from your dashboard.';

    return this.sendEmail({
      to: userEmail,
      subject,
      text: this.formatPlainText({
        intro,
        body,
        bullets: inquiryMessage ? [`Your message: ${inquiryMessage}`] : [],
        url: inquiriesUrl || 'Log in to your dashboard to review your inquiries.',
        closing: 'If you need to add more context, reply to this email or send a new message from the property page.'
      }),
      html: this.renderShell({
        eyebrow: 'Inquiry received',
        title: subject,
        intro,
        body,
        bullets: inquiryMessage ? [`Your message: ${inquiryMessage}`] : [],
        ctaLabel: inquiriesUrl ? 'Open your inquiries' : null,
        ctaUrl: inquiriesUrl,
        closing: 'If you need to add more context, reply to this email or send a new message from the property page.'
      })
    });
  }

  async sendInternalInquiryNotification({
    recipientEmail = process.env.INQUIRY_NOTIFICATION_EMAIL || 'info@domyvitalii.cz',
    userEmail,
    userName,
    userPhone,
    propertyTitle,
    listingId,
    inquiryMessage,
    inquiryType,
    inquiryId
  }) {
    const safePropertyTitle = propertyTitle || listingId || 'General inquiry';
    const adminUrl = this.buildUrl('/admin/inquiries');
    const subject = `New property inquiry: ${safePropertyTitle}`;
    const details = [
      `Name: ${userName || 'Not provided'}`,
      `Email: ${userEmail || 'Not provided'}`,
      userPhone ? `Phone: ${userPhone}` : null,
      `Type: ${inquiryType || 'property'}`,
      listingId ? `Property ID: ${listingId}` : null,
      inquiryId ? `Inquiry ID: ${inquiryId}` : null
    ].filter(Boolean);

    return this.sendEmail({
      to: recipientEmail,
      replyTo: userEmail,
      subject,
      text: this.formatPlainText({
        intro: 'A new inquiry was submitted from the website.',
        body: `Property: ${safePropertyTitle}`,
        bullets: [...details, inquiryMessage ? `Message: ${inquiryMessage}` : 'Message: Not provided'],
        url: adminUrl || '',
        closing: 'Open the admin panel to reply to the inquiry.'
      }),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a; line-height: 1.6;">
          <p style="font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">New website inquiry</p>
          <h1 style="font-size: 26px; line-height: 1.25; margin: 0 0 16px;">${this.escapeHtml(subject)}</h1>
          <p>A new inquiry was submitted from the website.</p>
          <div style="margin: 18px 0; padding: 14px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            ${details.map((item) => `<p style="margin: 6px 0;">${this.escapeHtml(item)}</p>`).join('')}
          </div>
          <p><strong>Message:</strong></p>
          <div style="margin: 12px 0 20px; padding: 14px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px;">${this.formatMessageHtml(inquiryMessage || 'Not provided')}</div>
          ${this.renderButton(adminUrl, 'Open admin inquiries')}
        </div>
      `
    });
  }

  async sendInquiryResponse({ userEmail, userName, propertyTitle, inquiryMessage, responseMessage }) {
    const safePropertyTitle = propertyTitle || 'your property inquiry';
    const subject = `Response to your inquiry about ${safePropertyTitle}`;
    const intro = `Hi ${userName || 'there'},`;
    const body = responseMessage;
    const originalInquiry = inquiryMessage ? `Original inquiry: ${inquiryMessage}` : '';

    return this.sendEmail({
      to: userEmail,
      subject,
      text: this.formatPlainText({
        intro,
        body,
        bullets: originalInquiry ? [originalInquiry] : [],
        closing: 'Best regards,\nDomy v Italii'
      }),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a; line-height: 1.6;">
          <p style="font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">Inquiry response</p>
          <h1 style="font-size: 28px; line-height: 1.2; margin: 0 0 16px;">${this.escapeHtml(subject)}</h1>
          <p>${this.escapeHtml(intro)}</p>
          <p>${this.formatMessageHtml(body)}</p>
          ${originalInquiry ? `<div style="margin: 24px 0; padding: 14px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;"><strong>Original inquiry:</strong><br>${this.formatMessageHtml(inquiryMessage)}</div>` : ''}
          <p>Best regards,<br>Domy v Italii</p>
        </div>
      `
    });
  }

  async sendWelcomeEmail({ userEmail, userName }) {
    const aiContent = await this.generateAIContent('welcome', {
      userName
    });

    const dashboardUrl = this.buildUrl('/dashboard');
    const subject = aiContent?.subject || 'Welcome to Domy v Itálii';
    const intro = `Hi ${userName}, welcome to Domy v Itálii.`;
    const body =
      aiContent?.body ||
      'Your account is ready. You can now save searches, track favorite properties, manage inquiries, and keep your buying process organized in one place.';

    return this.sendEmail({
      to: userEmail,
      subject,
      text: this.formatPlainText({
        intro,
        body,
        bullets: [
          'save searches and activate alerts',
          'keep interesting properties in your favorites',
          'track inquiries and next steps from your dashboard'
        ],
        url: dashboardUrl || 'Log in to your dashboard to get started.',
        closing: 'If you need help understanding the buying process in Italy, the guides and contact section are the best place to continue.'
      }),
      html: this.renderShell({
        eyebrow: 'Welcome',
        title: 'Your account is ready',
        intro,
        body,
        bullets: [
          'save searches and activate alerts',
          'keep interesting properties in your favorites',
          'track inquiries and next steps from your dashboard'
        ],
        ctaLabel: dashboardUrl ? 'Open your dashboard' : null,
        ctaUrl: dashboardUrl,
        closing: 'If you need help understanding the buying process in Italy, the guides and contact section are the best place to continue.'
      })
    });
  }

  async sendFreePdfUpsellEmail({
    userEmail,
    userName,
    language = 'it',
    freePdfKey = 'inspections-guide',
    premiumProductKey = 'premium-domy'
  }) {
    const safeLanguage = language === 'cs' || language === 'en' ? language : 'it';
    const followUpUrl = PREMIUM_PDFS_ENABLED
      ? `${this.getBaseUrl()}/premium?product=${encodeURIComponent(premiumProductKey)}`
      : this.buildUrl('/contact');
    const promotePremium = PREMIUM_PDFS_ENABLED;

    const freePdfTopicByLanguage = {
      'inspections-guide': {
        it: 'sulle visite immobiliari in Italia',
        en: 'for property viewings in Italy',
        cs: 'pro prohlidky nemovitostí v Itálii'
      },
      'mistakes-guide': {
        it: 'sugli errori comuni da evitare quando si acquista in Italia',
        en: 'about common mistakes to avoid when buying in Italy',
        cs: 'o castych chybach, kterym je dobře se při koupí v Itálii vyhnout'
      }
    };

    const freePdfTopic =
      freePdfTopicByLanguage[freePdfKey] || freePdfTopicByLanguage['inspections-guide'];

    const copy = {
      it: {
        subject: 'Grazie per aver scaricato il PDF gratuito',
        title: promotePremium ? 'Più chiarezza oggi, meno sorprese domani' : 'Continuiamo da qui',
        greeting: `Ciao ${userName},`,
        intro: `Grazie per aver scaricato la nostra guida gratuita ${freePdfTopic.it}.`,
        body: promotePremium
          ? 'Più informazioni dettagliate ricevi, più diventa semplice e trasparente acquistare casa in Italia. Per questo offriamo anche documenti premium con contenuti approfonditi e pratici, pensati per chi vuole procedere con metodo.'
          : 'Se vuoi capire quali controlli abbiano davvero senso nel tuo caso, puoi continuare con le guide gratuite oppure scriverci direttamente.',
        bullets: promotePremium
          ? [
              'controlli essenziali prima dei passaggi vincolanti',
              'spiegazioni chiare su costi, rischi e priorità',
              'struttura operativa concreta, passo dopo passo'
            ]
          : [
              'guida gratuita su costi e imposte',
              'approfondimento gratuito sul ruolo del notaio',
              'contatto diretto per orientarti sui prossimi passi'
            ],
        cta: promotePremium ? 'Apri il PDF premium' : 'Contattaci',
        closing: promotePremium
          ? 'Puoi accedere al materiale di approfondimento quando vuoi.'
          : 'Se vuoi, rispondi a questa email o contattaci dal sito e ti aiutiamo a capire i prossimi passi.'
      },
      en: {
        subject: 'Thank you for downloading the free PDF',
        title: promotePremium ? 'More clarity today, fewer surprises tomorrow' : 'Let us continue from here',
        greeting: `Hi ${userName},`,
        intro: `Thank you for downloading our free guide ${freePdfTopic.en}.`,
        body: promotePremium
          ? 'The more detailed information you have, the easier and more transparent buying a home in Italy becomes. That is why we also offer deeper practical material for people who want to move forward with a clear method.'
          : 'If you want to understand which next checks make sense in your case, continue with the free guides or contact us directly.',
        bullets: promotePremium
          ? [
              'essential checks before binding steps',
              'clear explanations of costs, risks, and priorities',
              'a practical step-by-step structure'
            ]
          : [
              'free guide about costs and taxes',
              'free guide about the notary role',
              'direct contact for the next steps'
            ],
        cta: promotePremium ? 'Open the premium PDF' : 'Contact us',
        closing: promotePremium
          ? 'You can access the deeper material whenever it suits you.'
          : 'If you want, reply to this email or contact us through the site and we will help you identify the next steps.'
      },
      cs: {
        subject: 'Dekuji, ze jste si stahli PDF zdarma',
        title: promotePremium ? 'Vice jasnosti dnes, mene prekvapeni zitra' : 'Muzeme pokracovat odsud',
        greeting: `Dobry den ${userName},`,
        intro: `Dekuji, ze jste si stahli nas bezplatny průvodce ${freePdfTopic.cs}.`,
        body: promotePremium
          ? 'Čím více detailních informací máte, tím snazší je koupit nemovitost v Itálii s větším klidem. Proto nabízíme i hlubší praktické materiály pro lidi, kteří chtějí postupovat systémově.'
          : 'Pokud chcete pochopit, ktere dalsi kontroly davaji smysl ve vasem pripade, pokracujte bezplatnymi pruvodci nebo nam napiste primo.',
        bullets: promotePremium
          ? [
              'zakladni kontroly pred dulezitymi kroky',
              'prehledne vysvetleni nakladu, rizik a priorit',
              'konkretni postup krok za krokem'
            ]
          : [
              'bezplatny průvodce o nakladech a danich',
              'bezplatny průvodce o roli notare',
              'primy kontakt pro dalsi kroky'
            ],
        cta: promotePremium ? 'Otevrit premium PDF' : 'Kontaktujte nas',
        closing: promotePremium
          ? 'K materialu se muzete vratit kdykoli pozdeji.'
          : 'Kdyz budete chtit, odpovezte na tento email nebo nas kontaktujte pres web a pomuzeme vam urcit dalsi kroky.'
      }
    }[safeLanguage];

    return this.sendEmail({
      to: userEmail,
      subject: copy.subject,
      text: this.formatPlainText({
        intro: copy.greeting,
        body: `${copy.intro}\n\n${copy.body}`,
        bullets: copy.bullets,
        url: followUpUrl || '',
        closing: copy.closing
      }),
      html: this.renderShell({
        eyebrow: 'Free PDF follow-up',
        title: copy.title,
        intro: copy.greeting,
        body: `${copy.intro} ${copy.body}`,
        bullets: copy.bullets,
        ctaLabel: followUpUrl ? copy.cta : null,
        ctaUrl: followUpUrl,
        closing: copy.closing
      })
    });
  }

  async sendFollowUpEmail({ userEmail, userName, daysSinceRegistration }) {
    const propertiesUrl = this.buildUrl('/properties');
    const subject = 'How is your Italy property search going?';
    const intro = `Hi ${userName}, it has been ${daysSinceRegistration} days since you joined Domy v Itálii.`;
    const body =
      'If you want to keep moving, review the latest properties, refine your criteria, and shortlist only the listings worth deeper checks.';

    return this.sendEmail({
      to: userEmail,
      subject,
      text: this.formatPlainText({
        intro,
        body,
        bullets: [
          'review the newest listings',
          'save or refine your search criteria',
          'shortlist only the properties worth closer checks'
        ],
        url: propertiesUrl || 'Log in to continue your search.',
        closing: 'If you need help evaluating the next step, write to us and we will point you in the right direction.'
      }),
      html: this.renderShell({
        eyebrow: `Follow-up after ${daysSinceRegistration} days`,
        title: 'Keep your search moving',
        intro,
        body,
        bullets: [
          'review the newest listings',
          'save or refine your search criteria',
          'shortlist only the properties worth closer checks'
        ],
        ctaLabel: propertiesUrl ? 'Continue your search' : null,
        ctaUrl: propertiesUrl,
        closing: 'If you need help evaluating the next step, write to us and we will point you in the right direction.'
      })
    });
  }
}

export default new EmailService();
