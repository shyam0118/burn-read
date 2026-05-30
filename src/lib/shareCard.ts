// Share card generation using html2canvas
// Converts DOM elements to downloadable PNG images

import html2canvas from 'html2canvas';

export type CardSize = 'square' | 'story';
export type CardTheme = 'dark' | 'light';

interface CardDimensions {
  width: number;
  height: number;
}

const CARD_SIZES: Record<CardSize, CardDimensions> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

const THEME_COLORS: Record<CardTheme, { bg: string; text: string; accent: string; card: string }> = {
  dark: {
    bg: '#0f172a',
    text: '#f1f5f9',
    accent: '#38bdf8',
    card: '#1e293b',
  },
  light: {
    bg: '#ffffff',
    text: '#0f172a',
    accent: '#0284c7',
    card: '#f1f5f9',
  },
};

export async function captureElementToPng(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    logging: false,
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function createCardContainer(
  width: number,
  height: number,
  theme: CardTheme
): HTMLDivElement {
  const colors = THEME_COLORS[theme];
  const container = document.createElement('div');
  container.style.cssText = `
    width: ${width}px;
    height: ${height}px;
    background: ${colors.bg};
    color: ${colors.text};
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    padding: 48px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    position: fixed;
    left: -9999px;
    top: 0;
    overflow: hidden;
    box-sizing: border-box;
  `;
  document.body.appendChild(container);
  return container;
}

export function removeCardContainer(container: HTMLDivElement): void {
  if (container.parentNode) {
    container.parentNode.removeChild(container);
  }
}

export function getCardDimensions(size: CardSize): CardDimensions {
  return CARD_SIZES[size];
}

export { THEME_COLORS, CARD_SIZES };
