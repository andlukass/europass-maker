import { readFileSync } from 'node:fs';
import type { EuropassCvConfig } from './types.js';
import { imageToDataUrl } from '../../render/assets.js';
import { getEuropassDictionary } from './dictionary.js';
import { escapeHtml, nl2br } from '../../render/html-utils.js';

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

export function generateEuropassHtml(config: EuropassCvConfig, rasc?: boolean): string {
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
  if (config.personal.phone) personalItems.push({ label: dict.phone, value: config.personal.phone });
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
    const items = config.sections.languages
      .map(
        (language) => `
    <div class="mb-1 last:mb-0">
      <span class="font-bold">${escapeHtml(language.language)}</span>: <span class="text-[#333]">${escapeHtml(language.level)}</span>
    </div>`
      )
      .join('');
    sections.push(section(dict.languages, items));
  }
  if (config.sections.skills?.length) {
    const skillsStr = config.sections.skills.map((skill) => escapeHtml(skill)).join(' | ');
    sections.push(section(dict.skills, `<div class="mt-1">${skillsStr}</div>`));
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${rascHtml}${headerHtml}${sections.join('')}</body></html>`;
}
