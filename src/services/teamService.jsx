import { callApi, callStagingApi } from "@/services/apiService";

export const getTeamStats = async (teamName, tier, season) => {
	const teamResponse = await callApi("get", "teams/", { seasons: season, name: teamName, tier });
	const teamId = teamResponse.data[0]?.id;
	if (!teamId) throw new Error(`No team found for "${teamName}" in ${tier}`);

	const statsResponse = await callApi("get", `teams/${teamId}/stats/`, { season });
	const s = statsResponse.data;
	return {
		teamName:  s.team,
		wins:      s.games_won,
		loss:      s.games_lost,
		goals:     s.goals,
		shots:     s.shots,
		shotPct:   parseFloat(s.shooting_percentage.toFixed(2)),
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
	const response = await callStagingApi("get", `teams/${teamId}/player_stats/`, { season });
	return response.data.map(p => {
		const goals = p.goals;
		const shots = p.shots;
		return {
			playerName: p.player,
			gp:         p.games_played,
			goals,
			shots,
			shotPct:    parseFloat(p.shooting_percentage.toFixed(2)),
			assists:    p.assists,
			saves:      p.saves,
			demos:      p.demos_inflicted,
		};
	});
};

