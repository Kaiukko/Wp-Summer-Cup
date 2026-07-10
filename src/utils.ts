import { Match, Team, StandingsRow } from './types';

export function calculateStandings(matches: Match[], teams: Team[]): { groupA: StandingsRow[]; groupB: StandingsRow[] } {
  const standingsMap: Record<string, StandingsRow> = {};

  // Initialize all teams with zero stats
  teams.forEach((team) => {
    standingsMap[team.id] = {
      rank: 1,
      teamId: team.id,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0
    };
  });

  // Accumulate stats from completed matches
  matches.forEach((match) => {
    if (match.status !== 'completed' && match.status !== 'live') {
      return; // Skip scheduled matches
    }

    const t1 = match.team1Id;
    const t2 = match.team2Id;
    const s1 = match.team1Score ?? 0;
    const s2 = match.team2Score ?? 0;

    // Check if team exists in map
    if (!standingsMap[t1] || !standingsMap[t2]) return;

    standingsMap[t1].played += 1;
    standingsMap[t2].played += 1;
    standingsMap[t1].goalsFor += s1;
    standingsMap[t1].goalsAgainst += s2;
    standingsMap[t2].goalsFor += s2;
    standingsMap[t2].goalsAgainst += s1;

    if (s1 > s2) {
      standingsMap[t1].won += 1;
      standingsMap[t1].points += 3;
      standingsMap[t2].lost += 1;
    } else if (s2 > s1) {
      standingsMap[t2].won += 1;
      standingsMap[t2].points += 3;
      standingsMap[t1].lost += 1;
    } else {
      standingsMap[t1].drawn += 1;
      standingsMap[t1].points += 1;
      standingsMap[t2].drawn += 1;
      standingsMap[t2].points += 1;
    }
  });

  // Calculate goal differences for all
  Object.keys(standingsMap).forEach((id) => {
    const s = standingsMap[id];
    s.goalDifference = s.goalsFor - s.goalsAgainst;
  });

  // Split into Group A and Group B
  const groupATeams = teams.filter((t) => t.group === 'A').map((t) => standingsMap[t.id]);
  const groupBTeams = teams.filter((t) => t.group === 'B').map((t) => standingsMap[t.id]);

  // Sort and assign ranks
  const sortFunc = (a: StandingsRow, b: StandingsRow) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }
    return b.goalsFor - a.goalsFor;
  };

  groupATeams.sort(sortFunc);
  groupBTeams.sort(sortFunc);

  groupATeams.forEach((row, index) => {
    row.rank = index + 1;
  });
  groupBTeams.forEach((row, index) => {
    row.rank = index + 1;
  });

  return {
    groupA: groupATeams,
    groupB: groupBTeams
  };
}

export function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const customUrl = localStorage.getItem('spb_supabase_url');
  const customKey = localStorage.getItem('spb_supabase_key');
  
  const headers = {
    ...(options.headers || {}),
  } as Record<string, string>;
  
  if (customUrl && customKey) {
    headers['x-supabase-url'] = customUrl;
    headers['x-supabase-key'] = customKey;
  }
  
  return fetch(url, {
    ...options,
    headers
  });
}

