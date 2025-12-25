const imageLocation = (data, directory) =>
	data.substr(0,8) === "https://"
	|| data.substr(0,7) === "http://"
	|| data.substr(0,11) === "data:image/"
	|| data.substr(0,7) === "/images" ?
		data
	: `/${directory}/${data}`


export default imageLocation;
