const imageLocation = (data, directory) =>
	data.substr(0,8) === "https://"
	|| data.substr(0,7) === "http://"
	|| data.substr(0,10) === "data:image/" ?
		data
	: `/${directory}/${data}`


export default imageLocation;
