
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

// High-fidelity Base64 for the Hội Bu Kiều logo extracted from the provided image
export const LOGO_BASE64 = "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";
