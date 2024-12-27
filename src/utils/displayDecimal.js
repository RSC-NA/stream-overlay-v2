const displayDecimal = (number, places = 0) => {
	return (Math.round(number * 10**places) / 10**places).toFixed(places);
}

export default displayDecimal;
