import type { RegionLevelState } from '../state/types';
import { LEVELS, getLevelById } from '../config/levels';
import { regions } from '../config/regions';
import { computeScore } from '../state/scoring';
import type { Locale } from '../i18n/i18n';
import { translate } from '../i18n/i18n';
import { buildCartogramGeometry } from '../render/cartogram';

export function exportMapImage(state: RegionLevelState, locale: Locale): void {
  const geometry = buildCartogramGeometry(regions);
  const mapScale = 0.28;
  const paddingX = 42;
  const paddingY = 36;
  const headerHeight = 88;
  const footerHeight = 96;
  const legendWidth = 176;
  const legendGap = 34;

  const mapWidth = geometry.width * mapScale;
  const mapHeight = geometry.height * mapScale;
  const width = paddingX * 2 + mapWidth + legendGap + legendWidth;
  const height = paddingY * 2 + headerHeight + mapHeight + footerHeight;

  const canvas = document.createElement('canvas');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

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

  for (const component of geometry.components) {
    ctx.save();
    ctx.beginPath();

    for (const rect of component.maskRects) {
      ctx.rect(
        mapOriginX + (rect.x - geometry.minX) * mapScale,
        mapOriginY + (rect.y - geometry.minY) * mapScale,
        rect.width * mapScale,
        rect.height * mapScale
      );
    }

    ctx.clip();

    for (const shape of component.shapes) {
      const levelId = state[shape.region.id] ?? 'NEVER';
      const level = getLevelById(levelId);

      ctx.beginPath();
      shape.polygon.forEach((point, index) => {
        const x = mapOriginX + (point.x - geometry.minX) * mapScale;
        const y = mapOriginY + (point.y - geometry.minY) * mapScale;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.closePath();

      ctx.fillStyle = level.color;
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 2.2;
      ctx.fill();
      ctx.stroke();

      const labelX = mapOriginX + (shape.label.x - geometry.minX) * mapScale;
      const labelY = mapOriginY + (shape.label.y - geometry.minY) * mapScale;
      ctx.fillStyle = '#111111';
      ctx.font = `${Math.max(8, shape.labelFontSize * mapScale)}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(shape.region.shortLabel, labelX, labelY);
    }

    ctx.restore();
  }

  ctx.textAlign = 'start';
  ctx.textBaseline = 'alphabetic';

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
