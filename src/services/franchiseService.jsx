import { callApi } from "@/services/apiService";

export const getFranchiseList = async (league) =>

	new Promise((resolve, reject) => {

		const apiCall = callApi(
			"get",
			`franchises/`,
			{
				league,
			}
		)
			.then((response) =>
				resolve(response.data))

			.catch((error) =>
				reject(error));

	});
