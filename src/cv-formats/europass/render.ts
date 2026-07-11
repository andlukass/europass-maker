import { readFileSync } from 'node:fs';
import { Flag, Mail, MapPin, MessageCircle, Phone } from 'lucide';
import type { EuropassCvConfig } from './types.js';
import { imageToDataUrl } from '../../render/assets.js';
import { getEuropassDictionary } from './dictionary.js';
import { escapeHtml, nl2br } from '../../render/html-utils.js';

type LucideIconNode = ReadonlyArray<readonly [tag: string, attrs: Record<string, string | number | undefined>]>;

function renderLucideIcon(icon: LucideIconNode): string {
  const elements = icon
    .map(([tag, attrs]) => {
      const attrsHtml = Object.entries(attrs)
        .filter(([, value]) => value !== undefined)
        .map(([name, value]) => `${name}="${escapeHtml(String(value))}"`)
        .join(' ');
      return `<${tag}${attrsHtml ? ` ${attrsHtml}` : ''}></${tag}>`;
    })
    .join('');

  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${elements}</svg>`;
}

function section(title: string, content: string): string {
  return `
<div class="px-10 mb-6">
  <div class="flex items-center gap-2">
    <span class="w-2 h-2 bg-[#b3b3b3] rounded-full"></span>
    <h2 class="text-[11.5pt] font-bold uppercase text-black m-0">${escapeHtml(title)}</h2>
  </div>
  <div class="h-[2px] bg-[#aeb1b1] mt-1 mb-3"></div>
  <div class="pl-[18px] text-[#333]">${content}</div>
</div>`;
}

function generateEuropassClassicHtml(config: EuropassCvConfig, rasc?: boolean): string {
  const dict = getEuropassDictionary(config.cvLanguage);
  const cssPath = new URL('../../render/tailwind.css', import.meta.url);
  const css = readFileSync(cssPath, 'utf8');

  const photoDataUrl = config.personal.photoPath ? imageToDataUrl(config.personal.photoPath) : null;
  const logoDataUrl = imageToDataUrl('src/assets/europass.png');

  const rascHtml = rasc
    ? `
<div class="fixed top-0 right-[15%] h-full flex flex-col justify-center items-center pointer-events-none z-50">
  <div class="text-[#666] opacity-30 font-bold text-[60px] flex flex-col items-center uppercase select-none space-y-2">
    ${dict.draft
      .split('')
      .map((char) => `<span>${escapeHtml(char)}</span>`)
      .join('')}
  </div>
</div>`
    : '';

  const logoHtml = `<div class="flex items-center gap-2"><img src="${logoDataUrl}" alt="Europass" class="h-[50px] mt-3"></div>`;

  const photoHtml = photoDataUrl
    ? `<img src="${photoDataUrl}" alt="" class="w-[120px] h-[145px] object-cover shrink-0">`
    : '';

  const personalItems: Array<{ label: string; value: string }> = [];
  if (config.personal.nationality) personalItems.push({ label: dict.nationality, value: config.personal.nationality });
  if (config.personal.sex) personalItems.push({ label: dict.sex, value: config.personal.sex });
  const phone = config.personal.phone?.trim();
  const whatsapp = config.personal.whatsapp?.trim();
  if (phone) personalItems.push({ label: dict.phone, value: phone });
  if (config.personal.birthDate) personalItems.push({ label: dict.birthDate, value: config.personal.birthDate });
  if (whatsapp) personalItems.push({ label: dict.whatsapp, value: whatsapp });
  if (config.personal.email) personalItems.push({ label: dict.email, value: config.personal.email });
  if (config.personal.address) personalItems.push({ label: dict.address, value: config.personal.address });

  const personalGridHtml =
    personalItems.length > 0
      ? `
  <div class="grid grid-cols-2 gap-y-2 gap-x-[60px] mt-1">
    ${personalItems
      .map((item) => {
        const spanClass = item.value.length > 24 ? 'col-span-2' : '';
        return `<div class="text-[10pt] text-[#222] ${spanClass}"><span class="font-bold inline-block w-[100px]">${escapeHtml(item.label)}:</span> <span class="text-black">${escapeHtml(item.value)}</span></div>`;
      })
      .join('')}
  </div>`
      : '';

  const headerHtml = `
<div class="bg-[#f8f9f9] pt-[30px] pb-[20px] px-[40px] mb-[10px]">
  <div class="flex gap-[25px] items-center">
    ${photoHtml}
    <div class="flex-1 -mt-4">
      <div class="flex justify-between items-center">
        <h1 class="text-[24px] font-semibold text-[#444] m-0">${escapeHtml(config.personal.name)}</h1>
        ${logoHtml}
      </div>
      <div class="h-[2px] bg-[#aeb1b1] mb-[15px]"></div>
      ${personalGridHtml}
    </div>
  </div>
</div>`;

  const sections: string[] = [];

  if (config.sections.presentation?.text) {
    sections.push(section(dict.presentation, `<p class="m-0">${nl2br(config.sections.presentation.text)}</p>`));
  }
  if (config.sections.objective?.text) {
    sections.push(section(dict.objective, `<p class="m-0">${nl2br(config.sections.objective.text)}</p>`));
  }
  if (config.sections.experience?.length) {
    const items = config.sections.experience
      .map(
        (experience) => `
    <div class="mb-4 last:mb-0">
      <div class="text-[9.5pt] text-[#666] mb-0.5">${[experience.from, experience.to].filter(Boolean).join(' - ')}${experience.country ? ` - ${escapeHtml(experience.country)}` : ''}</div>
      <div class="font-bold uppercase text-gray-900 mb-1">${escapeHtml(experience.role)}${experience.company ? ` - <span class="text-gray-900 font-normal">${escapeHtml(experience.company)}</span>` : ''}</div>
      ${experience.bullets?.length ? `<ul class="mt-1 list-disc pl-5">${experience.bullets.map((bullet) => `<li class="mb-1 last:mb-0">${escapeHtml(bullet)}</li>`).join('')}</ul>` : ''}
    </div>`
      )
      .join('');
    sections.push(section(dict.experience, items));
  }
  if (config.sections.education?.length) {
    const items = config.sections.education
      .map(
        (education) => `
    <div class="mb-3 last:mb-0">
      <div class="font-bold uppercase text-gray-900 mb-0.5">${escapeHtml(education.title)}</div>
      ${education.institution ? `<div class="text-[10pt] text-[#333]">${escapeHtml(education.institution)}</div>` : ''}
    </div>`
      )
      .join('');
    sections.push(section(dict.education, items));
  }
  if (config.sections.languages?.length) {
    const languageRows: string[] = [];
    let inlineLanguages: string[] = [];

    const flushInlineLanguages = () => {
      if (!inlineLanguages.length) return;
      languageRows.push(`
    <div class="mb-1 last:mb-0">
      ${inlineLanguages.join(' | ')}
    </div>`);
      inlineLanguages = [];
    };

    for (const language of config.sections.languages) {
      const languageHtml = `<span class="font-bold">${escapeHtml(language.language)}</span>: <span class="text-[#333]">${escapeHtml(language.level)}</span>`;

      if (language.break === false) {
        inlineLanguages.push(languageHtml);
        continue;
      }

      flushInlineLanguages();
      languageRows.push(`
    <div class="mb-1 last:mb-0">
      ${languageHtml}
    </div>`);
    }

    flushInlineLanguages();
    const items = languageRows.join('');
    sections.push(section(dict.languages, items));
  }
  if (config.sections.skills?.length) {
    const skillsStr = config.sections.skills.map((skill) => escapeHtml(skill)).join(' | ');
    sections.push(section(dict.skills, `<div class="mt-1">${skillsStr}</div>`));
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${rascHtml}${headerHtml}${sections.join('')}</body></html>`;
}

function leftSectionTitle(text: string): string {
  return `<h3 style="margin:0 0 8px 0;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#6d7f96;">${escapeHtml(text)}</h3>`;
}

function rightSectionTitle(text: string): string {
  return `<h2 style="margin:0 0 10px 0;padding-top:3px;font-size:12px;font-weight:700;letter-spacing:0.9px;text-transform:uppercase;color:#7d8ea4;border-top:1px solid #d8dee5;">${escapeHtml(text)}</h2>`;
}

function splitDate(value?: string): { top: string; bottom: string } {
  if (!value) return { top: '', bottom: '' };
  const clean = value.trim();
  if (!clean) return { top: '', bottom: '' };
  const parts = clean.split('-').map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { top: parts[0], bottom: parts.slice(1).join(' - ') };
  }
  return { top: clean, bottom: '' };
}

function renderTimelineRow(params: {
  dateTop: string;
  dateBottom: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
}): string {
  const bullets = (params.bullets ?? []).filter((bullet) => bullet.trim().length > 0);
  const bulletsHtml =
    bullets.length > 0
      ? `<ul style="margin:6px 0 0 14px;padding:0;color:#4d5a6a;font-size:8.8px;line-height:1.45;">${bullets
          .map((bullet) => `<li style="margin:0 0 3px 0;">${escapeHtml(bullet)}</li>`)
          .join('')}</ul>`
      : '';

  return `<div class="timeline-row">
    <div class="timeline-date">
      ${params.dateTop ? `<div>${escapeHtml(params.dateTop)}</div>` : ''}
      ${params.dateBottom ? `<div>${escapeHtml(params.dateBottom)}</div>` : ''}
    </div>
    <div class="timeline-content">
      <div class="timeline-title">${escapeHtml(params.title)}</div>
      ${params.subtitle?.trim() ? `<div class="timeline-subtitle">${escapeHtml(params.subtitle.trim())}</div>` : ''}
      ${bulletsHtml}
    </div>
  </div>`;
}

function experienceWeight(experience: NonNullable<EuropassCvConfig['sections']['experience']>[number]): number {
  const subtitleLength = [experience.company, experience.country].filter(Boolean).join(' - ').length;
  const bulletWeight = (experience.bullets ?? []).reduce(
    (total, bullet) => total + Math.max(1, Math.ceil(bullet.trim().length / 72)),
    0
  );
  return 4 + Math.ceil(subtitleLength / 62) + bulletWeight;
}

function splitExperiencesForTwoPages(
  experiences: NonNullable<EuropassCvConfig['sections']['experience']>
): [typeof experiences, typeof experiences] {
  if (experiences.length < 2) return [experiences, []];

  const weights = experiences.map(experienceWeight);
  const totalWeight = weights.reduce((total, weight) => total + weight, 0);

  // The first page has less vertical room because it carries the full identity header.
  const firstPageTarget = totalWeight * 0.46;
  let accumulated = 0;
  let bestIndex = 1;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let index = 1; index < experiences.length; index += 1) {
    accumulated += weights[index - 1];
    const distance = Math.abs(accumulated - firstPageTarget);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  }

  return [experiences.slice(0, bestIndex), experiences.slice(bestIndex)];
}

function renderEuropass2Html(config: EuropassCvConfig, rasc?: boolean): string {
  const dict = getEuropassDictionary(config.cvLanguage);
  const isPt = config.cvLanguage !== 'EN';
  const photoDataUrl = config.personal.photoPath ? imageToDataUrl(config.personal.photoPath) : null;
  const europeDataUrl = imageToDataUrl('src/assets/europe.png');
  const europeanFormatDataUrl = imageToDataUrl('src/assets/european-format.png');
  const headline = config.sections.objective?.text?.trim();
  const aboutText = config.sections.presentation?.text?.trim();
  const labels = {
    experience: isPt ? 'Experiência' : 'Experience',
    education: isPt ? 'Educação' : 'Education',
    skills: isPt ? 'Habilidades' : 'Skills',
    languages: isPt ? 'Linguagem' : 'Language',
  };

  const nameTokens = config.personal.name.trim().split(/\s+/).filter(Boolean);
  const firstName = nameTokens[0] ?? '';
  const restName = nameTokens.slice(1).join(' ');
  const nameHtml = `${escapeHtml(firstName)}${restName ? `<br>${escapeHtml(restName)}` : ''}`;

  const contacts: Array<{ value: string; icon: string }> = [];
  if (config.personal.email?.trim()) contacts.push({ value: config.personal.email.trim(), icon: renderLucideIcon(Mail) });
  if (config.personal.address?.trim()) contacts.push({ value: config.personal.address.trim(), icon: renderLucideIcon(MapPin) });
  if (config.personal.phone?.trim()) contacts.push({ value: config.personal.phone.trim(), icon: renderLucideIcon(Phone) });
  if (config.personal.nationality?.trim()) contacts.push({ value: config.personal.nationality.trim(), icon: renderLucideIcon(Flag) });
  if (config.personal.whatsapp?.trim()) contacts.push({ value: config.personal.whatsapp.trim(), icon: renderLucideIcon(MessageCircle) });

  const contactsHtml = contacts
    .map((item) => `<li><span class="left-icon">${item.icon}</span><span>${escapeHtml(item.value)}</span></li>`)
    .join('');

  const skillsHtml = (config.sections.skills ?? [])
    .filter((skill) => skill.trim().length > 0)
    .map((skill) => `<li><span class="left-dot"></span><span>${escapeHtml(skill)}</span></li>`)
    .join('');

  const languagesHtml = (config.sections.languages ?? [])
    .filter((language) => language.language.trim().length > 0)
    .map((language) => {
      const detail = language.level?.trim() ? ` | ${escapeHtml(language.level)}` : '';
      return `<li><span class="left-dot"></span><span>${escapeHtml(language.language)}${detail}</span></li>`;
    })
    .join('');

  const renderExperiences = (experiences: NonNullable<EuropassCvConfig['sections']['experience']>) => experiences
    .map((experience) => {
      const to = experience.to?.trim() ?? '';
      const subtitle = [experience.company?.trim(), experience.country?.trim()].filter(Boolean).join(' - ');
      return renderTimelineRow({
        dateTop: experience.from?.trim() ?? '',
        dateBottom: to,
        title: experience.role,
        subtitle,
        bullets: experience.bullets,
      });
    })
    .join('');

  const [firstPageExperiences, secondPageExperiences] = splitExperiencesForTwoPages(config.sections.experience ?? []);
  const firstPageExperienceHtml = renderExperiences(firstPageExperiences);
  const secondPageExperienceHtml = renderExperiences(secondPageExperiences);
  const hasSecondPage = secondPageExperiences.length > 0;

  const educationHtml = (config.sections.education ?? [])
    .map((education) => {
      const { top, bottom } = education.date?.trim() ? splitDate(education.date) : { top: '', bottom: '' };
      return renderTimelineRow({
        dateTop: top,
        dateBottom: bottom,
        title: education.title,
        subtitle: education.institution,
      });
    })
    .join('');

  const profilePhoto = photoDataUrl ? `<img src="${photoDataUrl}" alt="" class="profile-photo">` : '';

  const rascHtml = rasc
    ? `<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:120px;font-weight:700;color:#777;opacity:0.16;pointer-events:none;z-index:999;text-transform:uppercase;">${escapeHtml(
        dict.draft
      )}</div>`
    : '';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; width: 210mm; font-family: Arial, Helvetica, sans-serif; color: #3a4655; background: #fff; }
  .page { width: 210mm; height: 297mm; overflow: hidden; break-after: page; page-break-after: always; }
  .page:last-child { break-after: auto; page-break-after: auto; }
  .cv { display: flex; width: 100%; height: 100%; }
  .left { width: 35.75%; background: #d4dde7; padding: 34px 24px 26px; color: #5d6f87; }
  .right { width: 64.25%; background: #ffffff; padding: 0 0 28px 28.6px; position: relative; overflow: hidden; }
  .hero { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin: 0 0 2px 0; padding-top: 20px; }
  .hero-text { flex: 1; min-width: 0; }
  .hero-map { width: 207px; height: 148.5px; opacity: 0.32; object-fit: fill; object-position: right top; margin: 0; display: block; }
  .profile-wrap { display: flex; justify-content: center; margin-bottom: 16px; }
  .profile-photo { width: 136px; height: 136px; border-radius: 999px; object-fit: cover; border: 4px solid #dfe5ed; }
  .left-about { font-size: 11px; line-height: 1.5; margin: 14px 0 18px; color: #62758d; }
  .left-rule { height: 1px; background: #bdc9d6; margin: 14px 0; }
  .left-list { list-style: none; margin: 0; padding: 0; }
  .left-list li { display: flex; align-items: flex-start; gap: 7px; font-size: 11px; line-height: 1.5; color: #607389; margin: 0 0 6px 0; }
  .left-icon { width: 12px; height: 12px; color: #7f90a6; flex: 0 0 12px; margin-top: 2px; }
  .left-icon svg { width: 12px; height: 12px; display: block; }
  .left-dot { width: 6px; height: 6px; border-radius: 999px; background: #90a2b8; margin-top: 5px; flex: 0 0 6px; }
  .left-footer { margin-top: auto; padding-top: 20px; display: flex; justify-content: center; align-items: center; opacity: 0.3; }
  .left-footer img { width: 135px; height: auto; display: block; }
  .left-column-flow { display: flex; flex-direction: column; min-height: 100%; }

  .header-role { font-size: 8px; letter-spacing: 1px; text-transform: uppercase; color: #93a3b8; font-weight: 700; margin: 34px 0 10px; }
  .header-name { margin: 0; font-size: 35.04px; line-height: 0.93; color: #3b4552; font-weight: 500; }
  .sections-wrap { padding-right: 28.6px; }
  .section { margin-top: 18px; }
  .timeline { position: relative; margin-left: 0; padding-left: 0; }
  .timeline::before { content: ""; position: absolute; left: 20px; top: 4px; bottom: 4px; width: 1px; background: #d2dae4; }
  .timeline-row { position: relative; display: grid; grid-template-columns: 88px 1fr; gap: 18px; margin: 0 0 14px; padding-left: 34px; }
  .timeline-row { break-inside: avoid; page-break-inside: avoid; }
  .timeline-row::before { content: ""; position: absolute; left: 16px; top: 5px; width: 8px; height: 8px; border-radius: 999px; background: #2458b2; }
  .timeline-date { font-size: 8.8px; line-height: 1.25; color: #2d5fb3; font-weight: 700; margin-top: 1px; }
  .timeline-content { position: relative; }
  .timeline-title { font-size: 12px; line-height: 1.2; text-transform: uppercase; letter-spacing: 0.2px; color: #4f5966; font-weight: 700; }
  .timeline-subtitle { font-size: 8.8px; color: #5f6e82; font-weight: 700; margin-top: 2px; }
  .education-timeline .timeline-row { margin-bottom: 9px; }
  .education-timeline .timeline-title { font-size: 10.5px; }
  .continuation-header { height: 116px; display: flex; align-items: flex-end; justify-content: space-between; margin-right: 28.6px; padding: 30px 0 17px; }
  .continuation-kicker { color: #2d5fb3; font-size: 8px; font-weight: 700; letter-spacing: 1.1px; text-transform: uppercase; }
  .continuation-heading { margin: 5px 0 0; color: #3b4552; font-size: 22px; font-weight: 500; }
  .continuation-page-number { color: #a5b0bd; font-size: 11px; font-weight: 700; }
  .page-2 .section { margin-top: 22px; }
  @media screen { body { background: #e9edf2; } .page { margin: 0 auto 18px; background: #fff; box-shadow: 0 8px 26px rgba(49,65,85,.12); } }
  </style></head><body>${rascHtml}<div class="page"><div class="cv">
  <aside class="left">
    <div class="left-column-flow">
      <div class="profile-wrap">${profilePhoto}</div>
      ${aboutText ? `<div class="left-about">${nl2br(aboutText)}</div>` : ''}
      ${contactsHtml ? `<ul class="left-list">${contactsHtml}</ul>` : ''}
      ${skillsHtml ? `<div class="left-rule"></div>${leftSectionTitle(labels.skills)}<ul class="left-list">${skillsHtml}</ul>` : ''}
      ${languagesHtml ? `<div class="left-rule"></div>${leftSectionTitle(labels.languages)}<ul class="left-list">${languagesHtml}</ul>` : ''}
      <div class="left-footer"><img src="${europeanFormatDataUrl}" alt="European format"></div>
    </div>
  </aside>
  <main class="right">
    <div class="hero">
      <div class="hero-text">
        ${headline ? `<div class="header-role">${escapeHtml(headline)}</div>` : ''}
        <h1 class="header-name">${nameHtml}</h1>
      </div>
      <img src="${europeDataUrl}" alt="" class="hero-map">
    </div>
    <div class="sections-wrap">
      ${firstPageExperienceHtml ? `<section class="section">${rightSectionTitle(labels.experience)}<div class="timeline">${firstPageExperienceHtml}</div></section>` : ''}
      ${!hasSecondPage && educationHtml ? `<section class="section">${rightSectionTitle(labels.education)}<div class="timeline education-timeline">${educationHtml}</div></section>` : ''}
    </div>
  </main>
  </div></div>${hasSecondPage ? `<div class="page page-2"><div class="cv">
  <aside class="left">
    <div class="left-column-flow">
      <div class="profile-wrap">${profilePhoto}</div>
      ${aboutText ? `<div class="left-about">${nl2br(aboutText)}</div>` : ''}
      ${contactsHtml ? `<ul class="left-list">${contactsHtml}</ul>` : ''}
      ${skillsHtml ? `<div class="left-rule"></div>${leftSectionTitle(labels.skills)}<ul class="left-list">${skillsHtml}</ul>` : ''}
      ${languagesHtml ? `<div class="left-rule"></div>${leftSectionTitle(labels.languages)}<ul class="left-list">${languagesHtml}</ul>` : ''}
      <div class="left-footer"><img src="${europeanFormatDataUrl}" alt="European format"></div>
    </div>
  </aside>
  <main class="right">
    <div class="continuation-header">
      <div>
        <div class="continuation-kicker">${isPt ? 'Curriculum Vitae · Continuação' : 'Curriculum Vitae · Continued'}</div>
        <h2 class="continuation-heading">${escapeHtml(config.personal.name)}</h2>
      </div>
      <div class="continuation-page-number">02</div>
    </div>
    <div class="sections-wrap">
      <section class="section">${rightSectionTitle(`${labels.experience} · ${isPt ? 'continuação' : 'continued'}`)}<div class="timeline">${secondPageExperienceHtml}</div></section>
      ${educationHtml ? `<section class="section">${rightSectionTitle(labels.education)}<div class="timeline education-timeline">${educationHtml}</div></section>` : ''}
    </div>
  </main>
  </div></div>` : ''}</body></html>`;
}

export function generateEuropassHtml(config: EuropassCvConfig, rasc?: boolean): string {
  if (config.cvKind === 'europass-2') {
    return renderEuropass2Html(config, rasc);
  }
  return generateEuropassClassicHtml(config, rasc);
}
