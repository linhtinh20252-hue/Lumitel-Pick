import { Player } from './types';

export const INITIAL_PLAYERS: Player[] = [
  { id: '1', name: 'Lê Huy Hoàng' },
  { id: '2', name: 'Nguyễn Việt Hinh' },
  { id: '3', name: 'Trần Tử Long' },
  { id: '4', name: 'Nguyễn Huy Quỳnh' },
  { id: '5', name: 'Văn Phúc Huân' },
  { id: '6', name: 'Hà Thế Dương' },
  { id: '7', name: 'Trần Quang Minh' },
  { id: '8', name: 'Nguyễn Văn Lam' },
  { id: '9', name: 'Nguyễn Chính Chung' },
  { id: '10', name: 'Hoa Quốc Dũng' },
  { id: '11', name: 'Nguyễn Thanh Hải' },
  { id: '12', name: 'Ngô Hùng Sơn' },
  { id: '13', name: 'Đặng Mạnh Chiến' },
  { id: '14', name: 'Nguyễn Bá Thiết' },
  { id: '15', name: 'Trần Quốc Việt' },
  { id: '16', name: 'Nguyễn Thành Chung' },
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

// Logo Hội Bu Kiều bằng SVG - Tuyệt đối không lỗi hiển thị
export const LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="%23005696"/>
  <path d="M200 40 L230 80 L280 90 L250 130 L270 180 L200 160 L130 180 L150 130 L120 90 L170 80 Z" fill="%23FFE200" transform="translate(0, 10) scale(1.2) translate(-33, -20)"/>
  <circle cx="200" cy="130" r="45" fill="%23005696" stroke="%23FFE200" stroke-width="4"/>
  <path d="M200 110 L205 120 L215 120 L208 128 L212 138 L200 132 L188 138 L192 128 L185 120 L195 120 Z" fill="white"/>
  <path d="M180 145 L185 155 L195 155 L188 163 L192 173 L180 167 L168 173 L172 163 L165 155 L175 155 Z" fill="white"/>
  <path d="M220 145 L225 155 L235 155 L228 163 L232 173 L220 167 L208 173 L212 163 L205 155 L215 155 Z" fill="white"/>
  <text x="200" y="260" font-family="Arial, sans-serif" font-size="42" font-weight="900" fill="white" text-anchor="middle" style="text-transform: uppercase;">HỘI BU KIỀU</text>
</svg>`;
