import { callApi } from "@/services/apiService";

export const getTeamStats = async (teamName, tier, season) => {
	// Step 1: resolve team name to an ID
	const teamResponse = await callApi("get", "teams/", { seasons: season, name: teamName, tier });
	const teamId = teamResponse.data[0]?.id;
	if (!teamId) throw new Error(`No team found for "${teamName}" in ${tier}`);

	// Step 2: fetch season stats for that team
	const statsResponse = await callApi("get", `teams/${teamId}/stats/`, { season });
	const s = statsResponse.data;
	return {
		teamName:  s.team,
		wins:      s.games_won,
		loss:      s.games_lost,
		goals:     s.goals,
		shots:     s.shots,
		shotPct:   parseFloat(s.shooting_percentage.toFixed(2)), // rounded to hundredths
		assists:   s.assists,
		oppGoals:  s.opponent_goals,
		saves:     s.saves,
	};
};

export const getTeamListByTier = async (league, tier, season) =>

	new Promise((resolve, reject) => {

		callApi(
			"get",
			`teams/`,
			{
				league,
				tier,
				season,
			}
		)
			.then((response) =>
				resolve(response.data))

			.catch((error) =>
				reject(error));

	});

export const getTeamPlayerStats = async (teamId, season) => {
	// Players with 0 games played are included by the API with zeroes for all stats
	const response = await callApi("get", `teams/${teamId}/player_stats/`, { season });
	return response.data.map(p => {
		const goals = p.goals;
		const shots = p.shots;
		return {
			playerName: p.player,
			gp:         p.games_played,
			goals,
			shots,
			shotPct:    parseFloat(p.shooting_percentage.toFixed(2)), // rounded to hundredths
			assists:    p.assists,
			saves:      p.saves,
			demos:      p.demos_inflicted,
		};
	});
};

