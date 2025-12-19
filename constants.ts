
import { Player } from './types';

export const INITIAL_PLAYERS: Player[] = [
  { id: '1', name: 'HOANG-LH' },
  { id: '2', name: 'HINH-NV' },
  { id: '3', name: 'LONG-TT' },
  { id: '4', name: 'QUYNH-NH' },
  { id: '5', name: 'HUAN-VP' },
  { id: '6', name: 'DUONG-HT' },
  { id: '7', name: 'MINH-TQ' },
  { id: '8', name: 'LAM-NV' },
  { id: '9', name: 'CHUNG-NC' },
  { id: '10', name: 'DUNG-HQ' },
  { id: '11', name: 'HAI-NT' },
  { id: '12', name: 'SON-NH' },
  { id: '13', name: 'CHIEN-DM' },
  { id: '14', name: 'THIET-NB' },
  { id: '15', name: 'VIET-TQ' },
  { id: '16', name: 'CHUNG-NT' },
];

export const GROUP_MATCH_TEMPLATE = [
  { p1: 0, p2: 1, label: 'TRẬN 1: Cặp 1 vs Cặp 2' },
  { p1: 2, p2: 3, label: 'TRẬN 2: Cặp 3 vs Cặp 4' },
  { p1: 0, p2: 2, label: 'TRẬN 3: Cặp 1 vs Cặp 3' },
  { p1: 1, p2: 3, label: 'TRẬN 4: Cặp 2 vs Cặp 4' },
  { p1: 0, p2: 3, label: 'TRẬN 5: Cặp 1 vs Cặp 4' },
  { p1: 1, p2: 2, label: 'TRẬN 6: Cặp 2 vs Cặp 3' },
];

export const STORAGE_KEY = 'lumitel_pickleball_v5_final';

// Logo Lumitel chính thức (màu vàng chữ xanh)
export const LUMITEL_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 100">
  <rect width="250" height="100" fill="%23FFE200"/>
  <g transform="translate(15, 65)">
    <text font-family="Arial Black, sans-serif" font-size="42" font-weight="900" fill="%23005696" style="letter-spacing: -2px;">LUMITEL</text>
    <rect x="110" y="-45" width="6" height="12" fill="%23005696" transform="rotate(-30 113 -39)"/>
    <rect x="122" y="-48" width="6" height="12" fill="%23005696"/>
    <rect x="134" y="-45" width="6" height="12" fill="%23005696" transform="rotate(30 137 -39)"/>
  </g>
</svg>`;
