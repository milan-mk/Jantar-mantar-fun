export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed';

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Uses the native share sheet when present, otherwise the clipboard.
 * The result only says 'shared' / 'copied' when the browser confirmed it.
 */
export async function shareText(text: string): Promise<ShareOutcome> {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: 'Democracy Dash', text });
      return 'shared';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
      // Native sharing failed for another reason: try the clipboard instead.
    }
  }
  return (await copyToClipboard(text)) ? 'copied' : 'failed';
}
