import { readFileSync } from 'node:fs';
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
<section class="mt-[10px] break-inside-avoid [page-break-inside:avoid]">
  <h2 class="m-0 text-[18px] leading-none tracking-[-0.5px] font-extrabold text-[#1ea954]">${escapeHtml(title)}</h2>
  <div class="h-px bg-[#454545] mt-[4px] mb-[8px]"></div>
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
  const cssPath = new URL('../../render/tailwind.css', import.meta.url);
  const css = readFileSync(cssPath, 'utf8');
  const photoDataUrl = config.header.photoPath ? imageToDataUrl(config.header.photoPath) : null;
  const contacts: string[] = [];
  const phone = config.header.contacts?.phone?.trim();
  const whatsapp = config.header.contacts?.whatsapp?.trim();
  if (phone || whatsapp) {
    const phoneLabel = phone && whatsapp ? `${phone} | WhatsApp: ${whatsapp}` : phone || `WhatsApp: ${whatsapp}`;
    contacts.push(
      `<span class="inline-flex items-center gap-[4px]">${iconToSvg(Phone, 'w-[11px] h-[11px] text-[#2f3339] shrink-0')}<span>${escapeHtml(phoneLabel)}</span></span>`
    );
  }
  if (config.header.contacts?.email) {
    contacts.push(
      `<span class="inline-flex items-center gap-[4px]">${iconToSvg(Mail, 'w-[11px] h-[11px] text-[#2f3339] shrink-0')}<span>${escapeHtml(config.header.contacts.email)}</span></span>`
    );
  }
  if (config.header.contacts?.birthDate) {
    contacts.push(
      `<span class="inline-flex items-center gap-[4px]">${iconToSvg(CalendarDays, 'w-[11px] h-[11px] text-[#2f3339] shrink-0')}<span>${escapeHtml(config.header.contacts.birthDate)}</span></span>`
    );
  }
  if (config.header.contacts?.linkedin) {
    contacts.push(
      `<span class="inline-flex items-center gap-[4px]">${iconToSvg(Linkedin, 'w-[11px] h-[11px] text-[#2f3339] shrink-0')}<span>${escapeHtml(config.header.contacts.linkedin)}</span></span>`
    );
  }

  const experienceHtml = config.sections.experience?.length
    ? buildSection(
        lang === 'PT' ? 'Experiência Profissional' : 'Work Experience',
        config.sections.experience
          .map((item) => {
            const period = formatPeriod(item.period, lang);
            const locationHtml = item.location
              ? `<div class="text-[11px] italic text-[#1ea954]">${escapeHtml(item.location)}</div>`
              : '';
            const periodHtml = period
              ? `<div class="mt-[2px] text-[11px] italic text-[#7f838a]">${escapeHtml(period)}</div>`
              : '';

            return `
<article class="relative pr-[190px] mb-[7px] last:mb-0 break-inside-avoid [page-break-inside:avoid]">
  <div>
    <div class="text-[12px] font-bold text-[#2a2f35]">${escapeHtml(item.company)}</div>
    <div class="absolute top-0 right-0 text-right w-[170px] leading-[1.2]">${locationHtml}${periodHtml}</div>
  </div>
  <div class="mt-[2px] text-[10px] font-semibold text-[#3f454d]">${escapeHtml(item.role)}</div>
  ${
    item.bullets?.length
      ? `<ul class="mt-[4px] pl-[16px] text-[#4e545d] list-disc">${item.bullets.map((bullet) => `<li class="mb-[2px] last:mb-0 text-[9.6px] leading-[1.4]">${escapeHtml(bullet)}</li>`).join('')}</ul>`
      : ''
  }
</article>`;
          })
          .join('')
      )
    : '';

  const technicalSkillsHtml = config.sections.technicalSkills?.length
    ? buildSection(
        lang === 'PT' ? 'Competências Técnicas' : 'Technical Skills',
        `<div class="transform -translate-x-[190px] w-[calc(100%+24px)]"><div class="flex flex-col gap-[4px]">${config.sections.technicalSkills
          .map(
            (group) => `
<div class="grid grid-cols-[320px_1fr] gap-x-[14px] items-baseline break-inside-avoid [page-break-inside:avoid]">
  <div class="text-[#2f3540] font-bold text-[8px] text-right leading-tight">${escapeHtml(group.category)}</div>
  <div class="text-[#434a55] text-[8px] leading-tight">${group.items.map((item) => escapeHtml(item)).join(', ')}</div>
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
            const locationHtml = item.location
              ? `<div class="text-[11px] italic text-[#1ea954]">${escapeHtml(item.location)}</div>`
              : '';
            const periodHtml = periodLabel
              ? `<div class="mt-[2px] text-[11px] italic text-[#7f838a]">${escapeHtml(periodLabel)}</div>`
              : '';

            return `
<article class="relative pr-[190px] mb-[7px] last:mb-0 break-inside-avoid [page-break-inside:avoid]">
  <div>
    <div class="text-[12px] font-bold text-[#2a2f35]">${escapeHtml(item.institution)}</div>
    <div class="absolute top-0 right-0 text-right w-[170px] leading-[1.2]">${locationHtml}${periodHtml}</div>
  </div>
  <div class="mt-[2px] text-[10px] font-semibold text-[#3f454d]">${escapeHtml(item.degree)}</div>
  ${
    item.bullets?.length
      ? `<ul class="mt-[4px] pl-[16px] text-[#4e545d] list-disc">${item.bullets.map((bullet) => `<li class="mb-[2px] last:mb-0 text-[9.6px] leading-[1.4]">${escapeHtml(bullet)}</li>`).join('')}</ul>`
      : ''
  }
</article>`;
          })
          .join('')
      )
    : '';

  const projectsHtml = config.sections.projects?.length
    ? buildSection(
        lang === 'PT' ? 'Projetos' : 'Projects',
        config.sections.projects
          .map((item) => {
            const period = formatPeriod(item.period, lang);
            const locationHtml = item.location
              ? `<div class="text-[11px] italic text-[#1ea954]">${escapeHtml(item.location)}</div>`
              : '';
            const periodHtml = period
              ? `<div class="mt-[2px] text-[11px] italic text-[#7f838a]">${escapeHtml(period)}</div>`
              : '';

            return `
<article class="relative pr-[190px] mb-[10px] last:mb-0 break-inside-avoid [page-break-inside:avoid]">
  <div>
    <div class="text-[12px] font-bold text-[#2a2f35]">${escapeHtml(item.company)}</div>
    <div class="absolute top-0 right-0 text-right w-[170px] leading-[1.2]">${locationHtml}${periodHtml}</div>
  </div>
  <div class="mt-[2px] text-[10px] font-semibold text-[#3f454d]">${escapeHtml(item.role)}</div>
  ${
    item.bullets?.length
      ? `<ul class="mt-[4px] pl-[16px] text-[#4e545d] list-disc">${item.bullets.map((bullet) => `<li class="mb-[2px] last:mb-0 text-[9.6px] leading-[1.4]">${escapeHtml(bullet)}</li>`).join('')}</ul>`
      : ''
  }
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
    ${css}

    @page {
      margin: 6mm 7mm;
    }

    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  </style>
</head>
<body class="bg-white text-[#23262d] text-[10pt] leading-[1.35]">
  <main class="px-[28px] pt-0 bg-white">
    <header class="flex items-start justify-between gap-[20px] mb-[10px]">
      <div class="flex-1 min-w-0">
        <h1 class="m-0 text-[#2c2f35] text-[31px] leading-[0.95] font-extrabold tracking-[-1px]">${escapeHtml(config.header.name)}</h1>
        ${
          config.header.headline || config.header.location
            ? `<div class="mt-[6px] flex items-baseline gap-[10px]">
                ${
                  config.header.headline
                    ? `<span class="text-[#1ea954] text-[12px] font-bold uppercase tracking-[0.3px]">${escapeHtml(config.header.headline)}</span>`
                    : ''
                }
                ${config.header.headline && config.header.location ? `<span class="text-[#1ea954] text-[12px]">-</span>` : ''}
                ${
                  config.header.location
                    ? `<span class="text-[#1ea954] text-[12px] italic leading-[1.4]">${escapeHtml(config.header.location)}</span>`
                    : ''
                }
              </div>`
            : ''
        }
        ${
          contacts.length
            ? `<div class="mt-[3px] text-[#2f3339] text-[9px] leading-[1.8] flex flex-wrap items-center gap-0">${contacts.join('<span class="text-[#7f838a] mx-[10px]">|</span>')}</div>`
            : ''
        }
        <p class="mt-[10px] text-[#383d45] text-[10px] leading-[1.45] italic max-w-[760px]">${nl2br(config.summary.text)}</p>
      </div>
      ${photoDataUrl ? `<img class="w-[134px] h-[134px] rounded-full object-cover border-[3px] border-[#2f2f2f] shrink-0" src="${photoDataUrl}" alt="">` : ''}
    </header>

    ${experienceHtml}
    ${projectsHtml}
    ${educationHtml}
    ${technicalSkillsHtml}
  </main>
</body>
</html>`;
}
