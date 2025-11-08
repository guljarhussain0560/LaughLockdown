const LEADERBOARD_KEY = 'laugh-lockdown-leaderboard';

export interface LeaderboardEntry {
  name: string;
  survivalTime: number;
  date: string;
}

/**
 * Get leaderboard from localStorage
 */
export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading leaderboard:', error);
    return [];
  }
}

/**
 * Save score to leaderboard
 */
export function saveScore(name: string, survivalTime: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    const leaderboard = getLeaderboard();
    const newEntry: LeaderboardEntry = {
      name,
      survivalTime,
      date: new Date().toISOString(),
    };
    
    leaderboard.push(newEntry);
    leaderboard.sort((a, b) => b.survivalTime - a.survivalTime);
    
    // Keep only top 10
    const top10 = leaderboard.slice(0, 10);
    
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(top10));
  } catch (error) {
    console.error('Error saving score:', error);
  }
}

/**
 * Get personal best score
 */
export function getPersonalBest(): number {
  if (typeof window === 'undefined') return 0;
  
  try {
    const data = localStorage.getItem('laugh-lockdown-personal-best');
    return data ? parseInt(data, 10) : 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Save personal best score
 */
export function savePersonalBest(time: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    const currentBest = getPersonalBest();
    if (time > currentBest) {
      localStorage.setItem('laugh-lockdown-personal-best', time.toString());
    }
  } catch (error) {
    console.error('Error saving personal best:', error);
  }
}
