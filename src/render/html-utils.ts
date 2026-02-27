export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;');
}

export function nl2br(value: string): string {
  return escapeHtml(value).replace(/\n/g, '<br>');
}
