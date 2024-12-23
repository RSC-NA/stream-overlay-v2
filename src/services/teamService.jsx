import { callApi, callStats } from "@/services/apiService";

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

export const getTeamPlayerStats = async (team) =>
	new Promise((resolve, reject) => {

		callStats(
			"get",
			`players/${team}`,
			{}
		)
			.then((response) =>
				resolve(response.data))

			.catch((error) =>
				reject(error));

	});

export const getTeamStatsByTier = async (tier) =>
	new Promise((resolve, reject) => {

		callStats(
			"get",
			`teams/${tier}`,
			{}
		)
			.then((response) =>
				resolve(response.data))

			.catch((error) =>
				reject(error));

	});
