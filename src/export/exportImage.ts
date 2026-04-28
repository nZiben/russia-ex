import type { RegionLevelState } from '../state/types';
import { LEVELS, getLevelById } from '../config/levels';
import { regions } from '../config/regions';
import { computeScore } from '../state/scoring';
import type { Locale } from '../i18n/i18n';
import { translate } from '../i18n/i18n';

export function exportMapImage(state: RegionLevelState, locale: Locale): void {
  const maxRow = Math.max(...regions.map((r) => r.row + (r.height ?? 1) - 1));
  const maxCol = Math.max(...regions.map((r) => r.col + (r.width ?? 1) - 1));

  const tileSize = 34;
  const gap = 4;
  const paddingX = 42;
  const paddingY = 36;
  const headerHeight = 88;
  const footerHeight = 96;
  const legendWidth = 176;
  const legendGap = 34;

  const mapWidth = maxCol * tileSize + (maxCol - 1) * gap;
  const mapHeight = maxRow * tileSize + (maxRow - 1) * gap;
  const width = paddingX * 2 + mapWidth + legendGap + legendWidth;
  const height = paddingY * 2 + headerHeight + mapHeight + footerHeight;

  const canvas = document.createElement('canvas');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpr, dpr);

  const summary = computeScore(state);
  const visitedCount = regions.length - summary.perLevelCounts.NEVER;
  const mapOriginX = paddingX;
  const mapOriginY = paddingY + headerHeight;
  const legendX = mapOriginX + mapWidth + legendGap;
  const legendY = mapOriginY + 8;

  ctx.fillStyle = '#e6b0b0';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#111111';
  ctx.textBaseline = 'alphabetic';
  ctx.font = '700 34px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(translate(locale, 'export.imageTitle'), paddingX, paddingY + 30);

  ctx.font = '16px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(translate(locale, 'export.imageSubtitle'), paddingX, paddingY + 56);

  for (const region of regions) {
    const levelId = state[region.id] ?? 'NEVER';
    const level = getLevelById(levelId);
    const tileWidth = (region.width ?? 1) * tileSize + ((region.width ?? 1) - 1) * gap;
    const tileHeight = (region.height ?? 1) * tileSize + ((region.height ?? 1) - 1) * gap;
    const x = mapOriginX + (region.col - 1) * (tileSize + gap);
    const y = mapOriginY + (region.row - 1) * (tileSize + gap);

    ctx.fillStyle = level.color;
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if ('roundRect' in ctx) {
      ctx.roundRect(x, y, tileWidth, tileHeight, 6);
    } else {
      ctx.rect(x, y, tileWidth, tileHeight);
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#111111';
    ctx.font = '700 10px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    const textWidth = ctx.measureText(region.shortLabel).width;
    ctx.fillText(region.shortLabel, x + tileWidth / 2 - textWidth / 2, y + tileHeight / 2 + 4);
  }

  const legendItemHeight = 38;
  ctx.font = '700 20px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#111111';
  ctx.fillText(translate(locale, 'legend.title'), legendX, legendY - 18);

  LEVELS.forEach((level, index) => {
    const itemY = legendY + index * legendItemHeight;

    ctx.fillStyle = level.color;
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(legendX, itemY, legendWidth, legendItemHeight);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#111111';
    ctx.font = '700 16px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(translate(locale, level.nameKey), legendX + 14, itemY + 24);

    const weight = String(level.weight);
    const weightWidth = ctx.measureText(weight).width;
    ctx.fillText(weight, legendX + legendWidth - 14 - weightWidth, itemY + 24);
  });

  const scoreY = height - paddingY - 30;

  ctx.fillStyle = '#111111';
  ctx.font = '700 20px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(translate(locale, 'export.scoreLabel'), paddingX, scoreY - 42);

  ctx.font = '700 38px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(`${summary.totalScore} / ${summary.maxScore}`, paddingX, scoreY - 2);

  ctx.font = '15px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(
    translate(locale, 'export.visitedLabel')
      .replace('{visited}', String(visitedCount))
      .replace('{total}', String(regions.length)),
    paddingX,
    scoreY + 24
  );

  const footer = translate(locale, 'export.footer').toLowerCase();
  ctx.font = '14px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(footer, width - paddingX - ctx.measureText(footer).width, height - paddingY);

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
