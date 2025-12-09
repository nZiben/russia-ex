import type { RegionLevelState } from '../state/types';
import { regions } from '../config/regions';
import { getLevelById } from '../config/levels';
import { computeScore } from '../state/scoring';
import type { Locale } from '../i18n/i18n';
import { translate } from '../i18n/i18n';

export function exportMapImage(state: RegionLevelState, locale: Locale): void {
  const maxRow = Math.max(...regions.map((r) => r.row));
  const maxCol = Math.max(...regions.map((r) => r.col));

  const tileSize = 28;
  const gap = 4;
  const paddingX = 40;
  const paddingY = 60;
  const headerHeight = 60;

  const width = paddingX * 2 + maxCol * tileSize + (maxCol - 1) * gap;
  const height =
    paddingY * 2 + headerHeight + maxRow * tileSize + (maxRow - 1) * gap + 40;

  const canvas = document.createElement('canvas');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpr, dpr);

  // Background
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, width, height);

  // Title & subtitle
  ctx.fillStyle = '#e5e7eb';
  ctx.font = 'bold 22px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
  const title = translate(locale, 'export.imageTitle');
  ctx.fillText(title, paddingX, paddingY);

  ctx.font = '14px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#9ca3af';
  const subtitle = translate(locale, 'export.imageSubtitle');
  ctx.fillText(subtitle, paddingX, paddingY + 24);

  const originY = paddingY + headerHeight;

  // Tiles
  for (const region of regions) {
    const levelId = state[region.id] ?? 'NEVER';
    const level = getLevelById(levelId);
    const x = paddingX + (region.col - 1) * (tileSize + gap);
    const y = originY + (region.row - 1) * (tileSize + gap);

    ctx.fillStyle = level.color;
    // rounded rect if available
    if ((ctx as any).roundRect) {
      (ctx as any).roundRect(x, y, tileSize, tileSize, 5);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.rect(x, y, tileSize, tileSize);
      ctx.fill();
    }

    // Label
    ctx.fillStyle = '#f9fafb';
    ctx.font = '10px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    const text = region.shortLabel;
    const textWidth = ctx.measureText(text).width;
    ctx.fillText(text, x + tileSize / 2 - textWidth / 2, y + tileSize / 2 + 3);
  }

  // Score line
  const summary = computeScore(state);
  ctx.font = '13px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#e5e7eb';

  const scoreLabel = translate(locale, 'export.scoreLabel');
  const scoreText = `${scoreLabel}: ${summary.totalScore} / ${summary.maxScore}`;
  ctx.fillText(scoreText, paddingX, height - paddingY - 10);

  // Footer
  ctx.fillStyle = '#6b7280';
  ctx.font = '11px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
  const footer = translate(locale, 'export.footer');
  ctx.fillText(
    footer,
    width - paddingX - ctx.measureText(footer).width,
    height - paddingY - 10
  );

  // Trigger download
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'russia-ex.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}
