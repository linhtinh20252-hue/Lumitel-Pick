
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

// Logo Hội Bu Kiều
export const LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320">
  <rect width="400" height="320" fill="%23005696"/>
  <path d="M160 50 C 120 60, 100 100, 110 150 C 120 200, 150 240, 200 250 C 250 240, 280 200, 290 150 C 300 100, 280 60, 240 50 Z" fill="%23FFE200"/>
  <circle cx="200" cy="140" r="45" fill="%23005696" stroke="%23005696" stroke-width="2"/>
  <circle cx="200" cy="140" r="40" fill="none" stroke="%23FFE200" stroke-width="2" stroke-dasharray="5,5"/>
  <path d="M200 115 L204 122 L211 122 L206 127 L208 134 L200 130 L192 134 L194 127 L189 122 L196 122 Z" fill="white"/>
  <path d="M180 145 L184 152 L191 152 L186 157 L188 164 L180 160 L172 164 L174 157 L169 152 L176 152 Z" fill="white"/>
  <path d="M220 145 L224 152 L231 152 L226 157 L228 164 L220 160 L212 164 L214 157 L209 152 L216 152 Z" fill="white"/>
  <text x="200" y="295" font-family="Arial, sans-serif" font-size="44" font-weight="900" text-anchor="middle">
    <tspan fill="white">HỘI</tspan>
    <tspan fill="white" dx="15">BU KIỀU</tspan>
  </text>
</svg>`;

// Logo Lumitel chính thức (màu vàng chữ xanh)
export const LUMITEL_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 100">
  <rect width="250" height="100" fill="%23FFE200"/>
  <g transform="translate(15, 65)">
    <text font-family="Arial Black, sans-serif" font-size="42" font-weight="900" fill="%23005696" style="letter-spacing: -2px;">LUMITEL</text>
    <!-- Biểu tượng tia sáng trên chữ I -->
    <rect x="110" y="-45" width="6" height="12" fill="%23005696" transform="rotate(-30 113 -39)"/>
    <rect x="122" y="-48" width="6" height="12" fill="%23005696"/>
    <rect x="134" y="-45" width="6" height="12" fill="%23005696" transform="rotate(30 137 -39)"/>
  </g>
</svg>`;
