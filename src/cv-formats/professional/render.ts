import type { ProfessionalCvConfig, ProfessionalPeriod } from './types.js';
import { CalendarDays, Linkedin, Mail, Phone } from 'lucide';
import type { IconNode } from 'lucide';
import { imageToDataUrl } from '../../render/assets.js';
import { escapeHtml, nl2br } from '../../render/html-utils.js';

function formatPeriod(period: ProfessionalPeriod | null | undefined, lang: 'PT' | 'EN'): string {
  if (!period) return '';

  const start = period.start?.trim();
  if (!start) return '';

  const present = lang === 'PT' ? 'Atual' : 'Present';
  const end = period.isCurrent ? present : period.end?.trim() || present;
  return `${formatDateToken(start)} – ${formatDateToken(end)}`;
}

function formatDateToken(value: string): string {
  const raw = value.trim();
  if (!raw) return '';

  if (/^\d{4}-\d{2}$/.test(raw)) {
    const [year, month] = raw.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const index = Number(month) - 1;
    if (index >= 0 && index < 12) return `${months[index]} ${year}`;
  }

  return raw;
}

function buildSection(title: string, content: string): string {
  return `
<section class="section">
  <h2 class="section-title">${escapeHtml(title)}</h2>
  <div class="section-rule"></div>
  <div>${content}</div>
</section>`;
}

function iconToSvg(iconNode: IconNode, className: string): string {
  const paths = iconNode
    .map(([tag, attrs]) => {
      const attributes = Object.entries(attrs)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key}="${escapeHtml(String(value))}"`)
        .join(' ');
      return `<${tag} ${attributes}></${tag}>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}" aria-hidden="true">${paths}</svg>`;
}

export function generateProfessionalHtml(config: ProfessionalCvConfig): string {
  const lang = config.cvLanguage === 'PT' ? 'PT' : 'EN';
  const photoDataUrl = config.header.photoPath ? imageToDataUrl(config.header.photoPath) : null;
  const contacts: string[] = [];
  if (config.header.contacts?.phone) {
    contacts.push(
      `<span class="contact-item">${iconToSvg(Phone, 'contact-icon')}<span>${escapeHtml(config.header.contacts.phone)}</span></span>`
    );
  }
  if (config.header.contacts?.email) {
    contacts.push(
      `<span class="contact-item">${iconToSvg(Mail, 'contact-icon')}<span>${escapeHtml(config.header.contacts.email)}</span></span>`
    );
  }
  if (config.header.contacts?.birthDate) {
    contacts.push(
      `<span class="contact-item">${iconToSvg(CalendarDays, 'contact-icon')}<span>${escapeHtml(config.header.contacts.birthDate)}</span></span>`
    );
  }
  if (config.header.contacts?.linkedin) {
    contacts.push(
      `<span class="contact-item">${iconToSvg(Linkedin, 'contact-icon')}<span>${escapeHtml(config.header.contacts.linkedin)}</span></span>`
    );
  }

  const experienceHtml = config.sections.experience?.length
    ? buildSection(
        lang === 'PT' ? 'Experiência Profissional' : 'Work Experience',
        config.sections.experience
          .map((item) => {
            const period = formatPeriod(item.period, lang);
            const locationHtml = item.location ? `<div class="meta-location">${escapeHtml(item.location)}</div>` : '';
            const periodHtml = period ? `<div class="meta-date">${escapeHtml(period)}</div>` : '';

            return `
<article class="entry">
  <div class="entry-top">
    <div class="entry-company">${escapeHtml(item.company)}</div>
    <div class="entry-meta">${locationHtml}${periodHtml}</div>
  </div>
  <div class="entry-role">${escapeHtml(item.role)}</div>
  ${item.bullets?.length ? `<ul class="entry-list">${item.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>` : ''}
</article>`;
          })
          .join('')
      )
    : '';

  const technicalSkillsHtml = config.sections.technicalSkills?.length
    ? buildSection(
        lang === 'PT' ? 'Competências Técnicas' : 'Technical Skills',
        `<div class="skills-wrap"><div class="skills-table">${config.sections.technicalSkills
          .map(
            (group) => `
<div class="skills-row">
  <div class="skills-label">${escapeHtml(group.category)}</div>
  <div class="skills-values">${group.items.map((item) => escapeHtml(item)).join(', ')}</div>
</div>`
          )
          .join('')}</div></div>`
      )
    : '';

  const educationHtml = config.sections.education?.length
    ? buildSection(
        lang === 'PT' ? 'Educação' : 'Education',
        config.sections.education
          .map((item) => {
            const periodStart = item.period?.start?.trim();
            const periodEnd = item.period?.end?.trim();
            const periodLabel = periodStart
              ? `${formatDateToken(periodStart)}${periodEnd ? ` – ${formatDateToken(periodEnd)}` : ''}`
              : '';
            const locationHtml = item.location ? `<div class="meta-location">${escapeHtml(item.location)}</div>` : '';
            const periodHtml = periodLabel ? `<div class="meta-date">${escapeHtml(periodLabel)}</div>` : '';

            return `
<article class="entry">
  <div class="entry-top">
    <div class="entry-company">${escapeHtml(item.institution)}</div>
    <div class="entry-meta">${locationHtml}${periodHtml}</div>
  </div>
  <div class="entry-role">${escapeHtml(item.degree)}</div>
  ${item.bullets?.length ? `<ul class="entry-list">${item.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>` : ''}
</article>`;
          })
          .join('')
      )
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page {
      margin: 10mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #23262d;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 10pt;
      line-height: 1.35;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .cv {
      padding: 24px 28px 36px;
      background: #ffffff;
    }

    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 18px;
    }

    .header-main {
      flex: 1;
      min-width: 0;
    }

    .name {
      margin: 0;
      color: #2c2f35;
      font-size: 31px;
      line-height: 0.95;
      font-weight: 800;
      letter-spacing: -1px;
    }

    .headline {
      margin-top: 6px;
      color: #1ea954;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .location {
      margin-top: 4px;
      color: #1ea954;
      font-size: 12px;
      font-style: italic;
      line-height: 1.4;
    }

    .contacts {
      margin-top: 6px;
      color: #2f3339;
      font-size: 9px;
      line-height: 1.8;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0;
    }

    .contact-separator {
      color: #7f838a;
      margin: 0 10px;
    }

    .contact-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .contact-icon {
      width: 11px;
      height: 11px;
      color: #2f3339;
      flex-shrink: 0;
    }

    .summary-intro {
      margin: 22px 0 0;
      color: #383d45;
      font-size: 10px;
      line-height: 1.45;
      font-style: italic;
      max-width: 760px;
    }

    .photo {
      width: 134px;
      height: 134px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #2f2f2f;
      flex-shrink: 0;
    }

    .section {
      margin-top: 14px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .section-title {
      margin: 0;
      color: #1ea954;
      font-size: 18px;
      line-height: 1;
      letter-spacing: -0.5px;
      font-weight: 800;
    }

    .section-rule {
      height: 1px;
      background: #454545;
      margin: 4px 0 8px;
    }

    .summary-text {
      margin: 0;
      color: #383d45;
      font-size: 11px;
      line-height: 1.5;
    }

    .entry {
      position: relative;
      padding-right: 190px;
      margin-bottom: 10px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .entry:last-child {
      margin-bottom: 0;
    }

    .entry-company {
      color: #2a2f35;
      font-size: 12px;
      font-weight: 700;
    }

    .entry-meta {
      position: absolute;
      top: 0;
      right: 0;
      text-align: right;
      width: 170px;
      line-height: 1.2;
    }

    .meta-location {
      color: #1ea954;
      font-size: 11px;
      font-style: italic;
    }

    .meta-date {
      margin-top: 2px;
      color: #7f838a;
      font-size: 11px;
      font-style: italic;
    }

    .entry-role {
      margin-top: 2px;
      color: #3f454d;
      font-size: 10px;
      font-weight: 600;
    }

    .entry-list {
      margin: 4px 0 0;
      padding-left: 16px;
      color: #4e545d;
    }

    .entry-list li {
      margin-bottom: 2px;
      font-size: 9.6px;
      line-height: 1.4;
    }

    .skills-wrap {
      transform: translateX(-190px);
    }

    .skills-table {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .skills-row {
      display: grid;
      grid-template-columns: 320px 1fr;
      column-gap: 14px;
      align-items: baseline;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .skills-label {
      color: #2f3540;
      font-weight: 700;
      font-size: 8px;
      text-align: right;
      line-height: 1.25;
    }

    .skills-values {
      color: #434a55;
      font-size: 8px;
      line-height: 1.25;
    }

  </style>
</head>
<body>
  <main class="cv">
    <header class="header">
      <div class="header-main">
        <h1 class="name">${escapeHtml(config.header.name)}</h1>
        ${config.header.headline ? `<div class="headline">${escapeHtml(config.header.headline)}</div>` : ''}
        ${config.header.location ? `<div class="location">${escapeHtml(config.header.location)}</div>` : ''}
        ${contacts.length ? `<div class="contacts">${contacts.join('<span class="contact-separator">|</span>')}</div>` : ''}
        <p class="summary-intro">${nl2br(config.summary.text)}</p>
      </div>
      ${photoDataUrl ? `<img class="photo" src="${photoDataUrl}" alt="">` : ''}
    </header>

    ${experienceHtml}
    ${technicalSkillsHtml}
    ${educationHtml}
  </main>
</body>
</html>`;
}
