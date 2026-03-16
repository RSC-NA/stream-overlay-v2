import { callApi, callStats } from "@/services/apiService";

// Set to true to pull stats from Google Sheets, false to use the devleague API
const USE_SHEETS = true;

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

export const getTeamPlayerStats = async (team) => {
	if (USE_SHEETS) {
		const response = await fetch(`/api/sheets/players/${encodeURIComponent(team)}`);
		return response.json();
	}
	return new Promise((resolve, reject) => {
		callStats("get", `players/${team}`, {})
			.then((response) => resolve(response.data))
			.catch((error) => reject(error));
	});
};

export const getTeamStatsByTier = async (tier) => {
	if (USE_SHEETS) {
		const response = await fetch(`/api/sheets/teams/${encodeURIComponent(tier)}`);
		return response.json();
	}
	return new Promise((resolve, reject) => {
		callStats("get", `teams/${tier}`, {})
			.then((response) => resolve(response.data))
			.catch((error) => reject(error));
	});
};
