import type { CvConfig } from '../model.js';
import { imageToDataUrl } from './assets.js';
import { readFileSync } from 'fs';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function nl2br(s: string): string {
  return escapeHtml(s).replace(/\n/g, '<br>');
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

export function generateHtml(config: CvConfig, logoPath?: string): string {
  const cssPath = new URL('./tailwind.css', import.meta.url);
  const css = readFileSync(cssPath, 'utf8');

  const photoDataUrl = config.personal.photoPath ? imageToDataUrl(config.personal.photoPath) : null;
  
  const effectiveLogoPath = logoPath || 'src/assets/europass.png';
  const logoDataUrl = imageToDataUrl(effectiveLogoPath);

  const logoHtml = logoDataUrl
    ? `<div class="flex items-center gap-2"><img src="${logoDataUrl}" alt="Europass" class="h-[35px]"></div>`
    : `<div class="flex items-center gap-2"><div class="w-8 h-8 bg-[#003399] flex items-center justify-center rounded-[2px]"><span class="text-[#ffcc00] text-[16px] leading-none">★</span></div><span class="text-[20pt] font-medium text-[#5c2d91]">europass</span></div>`;

  const photoHtml = photoDataUrl
    ? `<img src="${photoDataUrl}" alt="" class="w-[110px] h-[135px] object-cover shrink-0">`
    : '';

  const personalItems: Array<{ label: string; value: string }> = [];
  if (config.personal.nationality) personalItems.push({ label: 'Nacionalidade', value: config.personal.nationality });
  if (config.personal.sex) personalItems.push({ label: 'Sexo', value: config.personal.sex });
  if (config.personal.email) personalItems.push({ label: 'Email', value: config.personal.email });
  if (config.personal.phone) personalItems.push({ label: 'Telemóvel', value: config.personal.phone });
  if (config.personal.address) personalItems.push({ label: 'Morada', value: config.personal.address });

  const leftLabels = new Set(['Nacionalidade', 'Email', 'Morada']);
  const leftCol = personalItems.filter((i) => leftLabels.has(i.label));
  const rightCol = personalItems.filter((i) => !leftLabels.has(i.label));

  const personalGridHtml =
    personalItems.length > 0
      ? `
  <div class="grid grid-cols-2 gap-y-3 gap-x-[60px] mt-1">
    <div>${leftCol.map((i) => `<div class="text-[10pt] text-[#222]"><span class="font-bold inline-block w-[100px]">${escapeHtml(i.label)}:</span> <span class="text-black">${escapeHtml(i.value)}</span></div>`).join('')}</div>
    <div>${rightCol.map((i) => `<div class="text-[10pt] text-[#222]"><span class="font-bold inline-block w-[100px]">${escapeHtml(i.label)}:</span> <span class="text-black">${escapeHtml(i.value)}</span></div>`).join('')}</div>
  </div>`
      : '';

  const headerHtml = `
<div class="bg-[#f8f9f9] pt-[30px] pb-[20px] px-[40px] mb-[30px]">
  <div class="flex gap-[25px] items-start">
    ${photoHtml}
    <div class="flex-1">
      <div class="flex justify-between items-center mb-2">
        <h1 class="text-[20pt] font-semibold text-[#444] m-0">${escapeHtml(config.personal.name)}</h1>
        ${logoHtml}
      </div>
      <div class="h-[2px] bg-[#aeb1b1] my-[10px] mb-[15px]"></div>
      ${personalGridHtml}
    </div>
  </div>
</div>`;

  const sections: string[] = [];

  if (config.sections.presentation?.text) {
    sections.push(section('Apresentação', `<p class="m-0">${nl2br(config.sections.presentation.text)}</p>`));
  }
  if (config.sections.objective?.text) {
    sections.push(section('Objetivo Profissional', `<p class="m-0">${nl2br(config.sections.objective.text)}</p>`));
  }
  if (config.sections.experience?.items?.length) {
    const items = config.sections.experience.items
      .map(
        (e) => `
    <div class="mb-4 last:mb-0">
      <div class="text-[9.5pt] text-[#666] mb-0.5">${[e.from, e.to].filter(Boolean).join(' - ')}${e.country ? ` - ${escapeHtml(e.country)}` : ''}</div>
      <div class="font-bold uppercase text-black mb-1">${escapeHtml(e.role)}${e.company ? ` – <span class="underline text-[#4c4a8d]">${escapeHtml(e.company)}</span>` : ''}</div>
      ${e.bullets?.length ? `<ul class="mt-1 list-disc pl-5">${e.bullets.map((b) => `<li class="mb-1 last:mb-0">${escapeHtml(b)}</li>`).join('')}</ul>` : ''}
    </div>`
      )
      .join('');
    sections.push(section('Experiência Profissional', items));
  }
  if (config.sections.education?.items?.length) {
    const items = config.sections.education.items
      .map(
        (e) => `
    <div class="mb-3 last:mb-0">
      <div class="font-bold uppercase text-black mb-0.5">${escapeHtml(e.title)}</div>
      ${e.institution ? `<div class="text-[10pt] text-[#333]">${escapeHtml(e.institution)}</div>` : ''}
    </div>`
      )
      .join('');
    sections.push(section('Educação e Formação', items));
  }
  if (config.sections.languages?.nativeLanguage) {
    sections.push(
      section(
        'Competências Linguísticas',
        `<div>Língua Nativa: <span class="font-bold uppercase">${escapeHtml(config.sections.languages.nativeLanguage)}</span></div>`
      )
    );
  }
  if (config.sections.skills?.items?.length) {
    const list = config.sections.skills.items.map((s) => `<li class="mb-1 last:mb-0">${escapeHtml(s)}</li>`).join('');
    sections.push(section('Habilidades', `<ul class="mt-1 list-disc pl-5">${list}</ul>`));
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${headerHtml}${sections.join('')}</body></html>`;
}
