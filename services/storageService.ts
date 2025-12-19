
import { TournamentData } from '../types';
import { STORAGE_KEY } from '../constants';

export const saveTournament = (data: TournamentData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const loadTournament = (): TournamentData | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearTournament = () => {
  localStorage.removeItem(STORAGE_KEY);
};
