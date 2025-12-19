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

// Logo Hội Bu Kiều bằng SVG - Tối ưu hiển thị và sát thực tế nhất
export const LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320">
  <rect width="400" height="320" fill="%23005696"/>
  <!-- Hình bản đồ Burundi cách điệu -->
  <path d="M160 50 C 120 60, 100 100, 110 150 C 120 200, 150 240, 200 250 C 250 240, 280 200, 290 150 C 300 100, 280 60, 240 50 Z" fill="%23FFE200"/>
  <!-- Vòng tròn trung tâm với 3 ngôi sao -->
  <circle cx="200" cy="140" r="45" fill="%23005696" stroke="%23005696" stroke-width="2"/>
  <circle cx="200" cy="140" r="40" fill="none" stroke="%23FFE200" stroke-width="2" stroke-dasharray="5,5"/>
  <!-- 3 Ngôi sao trắng -->
  <path d="M200 115 L204 122 L211 122 L206 127 L208 134 L200 130 L192 134 L194 127 L189 122 L196 122 Z" fill="white"/>
  <path d="M180 145 L184 152 L191 152 L186 157 L188 164 L180 160 L172 164 L174 157 L169 152 L176 152 Z" fill="white"/>
  <path d="M220 145 L224 152 L231 152 L226 157 L228 164 L220 160 L212 164 L214 157 L209 152 L216 152 Z" fill="white"/>
  <!-- Chữ HỘI BU KIỀU -->
  <text x="200" y="295" font-family="Arial, sans-serif" font-size="44" font-weight="900" text-anchor="middle" style="text-transform: uppercase;">
    <tspan fill="white">HỘI</tspan>
    <tspan fill="white" dx="15">BU KIỀU</tspan>
  </text>
</svg>`;
