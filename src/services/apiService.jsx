import axios from "axios";

const apiLocation        = "https://api.rscna.com/api/v1/";
const apiStagingLocation = "https://staging-api.rscna.com/api/v1/";

export const callApi = (method, path, params) =>
	makeServerCall(method, path, params, "api");

export const callStagingApi = (method, path, params) =>
	makeServerCall(method, path, params, "staging");

export const makeServerCall = (method, path, params, service) =>

	new Promise((resolve, reject) => {

		const callParams = {};

		if (Object.keys(params).length) {

			// remove empty parameters
			Object.keys(params)
				.forEach((key) => {
					if (params[key] !== undefined) {
						callParams[key] = params[key];
					}
				});

		}

		const axiosRequest = {
			method,
			url: `${service === "staging" ? apiStagingLocation : apiLocation}${path}`,
		};

		if (method === "get") {

			axiosRequest.params = callParams;

		} else {

			axiosRequest.data = callParams;

		}

		axios(axiosRequest)
			.then((response) => {
				resolve(response);
			})
			.catch((error) => {
					reject(error);
			});

	});
