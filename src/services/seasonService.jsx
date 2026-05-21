import { callApi } from "@/services/apiService";

export const getCurrentSeason = async (league) => {
	const response = await callApi("get", "seasons/", { league, current: true });
	return response.data[0].number;
};
