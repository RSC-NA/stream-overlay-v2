import React, { useEffect, useState } from "react";

import { v4 as uuidv4 } from "uuid";

import { getFranchiseList } from "@/services/franchiseService";
import { getTeamListByTier, getTeamPlayerStats, getTeamStatsByTier } from "@/services/teamService";
import { getTierList } from "@/services/tierService";

import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid2";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { createTheme, styled, ThemeProvider } from "@mui/material/styles";

import defaultConfig from "@/data/config.json";

import ("@/style/controlPanel.scss");

const defaultTeamData = [
	{
		"color_primary": "206cff",
		"color_secondary": "",
		"name": "",
		"score": 0
	},
	{
		"color_primary": "f88521",
		"color_secondary": "",
		"name": "",
		"score": 0
	}
];

const defaultSeriesScore = [0, 0];
// TODO: pull current season from API?
const currentSeason = 22;

let panelTheme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#ffffff",
			secondary: "#999999",
		},
	},
});

panelTheme = createTheme(panelTheme, {
	palette: {
		splash: panelTheme.palette.augmentColor({
			color: {
				main: "#49dcee",
				secondary: "#199ade",
				dark: "#199ade",
				contrastText: "#e90000",
			},
			name: "splash",
		}),
	}
})

const Item = styled("div")(({ theme }) => ({
	background: "transparent",
	padding: theme.spacing(1),
	textAlign: "left",
	color: "#ffffff",
}));

const ControlPanel = () => {

	const [clientId, setClientId] = useState("");
	const [config, setConfig] = useState(defaultConfig);
	const [customClientId, setCustomClientId] = useState("");
	const [currentDialog, setCurrentDialog] = useState(null);
	const [seriesScore, setSeriesScore] = useState(defaultSeriesScore);
	const [teamData, setTeamData] = useState(defaultTeamData);
	const [snackbarIsOpen, setSnackbarIsOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [viewState, setViewState] = useState("");

	const [franchiseLists, setFranchiseLists] = useState({});
	const [leagueId, setLeagueId] = useState(-1);
	const [tierLists, setTierLists] = useState({});
	const [teamLists, setTeamLists] = useState({});
	const [splashOn, setSplashOn] = useState(false);
	const [splashCount, setSplashCount] = useState(0);

	const [fieldsWithChanges, setFieldsWithChanges] = useState([]);

	const [streamTypeField, setStreamTypeField] = useState("RSC3-regular"); // default to regular season if not already set
	const [teamFields, setTeamFields] = useState(["", ""]);
	const [brandLogoField, setBrandLogoField] = useState("");
	const [headerField, setHeaderField] = useState(""); // TODO: handle multiple headers?
	const [seasonNumberField, setSeasonNumberField] = useState(currentSeason);
	const [matchdayNumberField, setMatchdayNumberField] = useState(1);
	const [tierField, setTierField] = useState("");
	const [showSeriesField, setShowSeriesField] = useState(false);
	const [seriesTypeField, setSeriesTypeField] = useState("");
	const [seriesLengthField, setSeriesLengthField] = useState(0);
	const [teamNameFields, setTeamNameFields] = useState(["", ""]);
	const [franchiseFields, setFranchiseFields] = useState(["", ""]);
	const [teamLogoFields, setTeamLogoFields] = useState(["", ""]);
	const [seriesScoreFields, setSeriesScoreFields] = useState(defaultSeriesScore);
	const [splashOnField, setSplashOnField] = useState(false);
	const [splashCountField, setSplashCountField] = useState(0);

	const thisUrl = new URL(document.location.href);
	const statsUrlPrefix = `${thisUrl.protocol}//${thisUrl.host}`;


 	useEffect(() => {

		// on start, check for existing items in localstorage; if not, send default

		if (localStorage.hasOwnProperty("clientId")) {
			setClientId(localStorage.getItem("clientId"));
		} else {
			generateRandomClientId();
		}

		if (localStorage.hasOwnProperty("config")) {
			setConfigValuesFromLocalStorage();
		} else {
			setConfigValuesToDefault();
		}

		if (localStorage.hasOwnProperty("seriesScore")) {
			setSeriesScoreFromLocalStorage();
		} else {
			localStorage.setItem("seriesScore", JSON.stringify(seriesScore));
		}

		if (localStorage.hasOwnProperty("teamData")) {
			setTeamData(JSON.parse(localStorage.getItem("teamData")));
		} else {
			setConfig(defaultTeamData);
			localStorage.setItem("teamData", JSON.stringify(defaultTeamData));
		}

		if (localStorage.hasOwnProperty("viewstate")) {
			setViewState(localStorage.getItem("viewstate"));
		} else {
			setViewState("");
		}

		setSplashFromLocalStorage();

		// listen for localstorage updates for game data and series score
		window.onstorage = (event) => {
			switch(event.key) {
				case "teamData":
					if(event.newValue !== null) {
						setTeamData(JSON.parse(event.newValue));
					}
					break;

				case "seriesScore":
					const seriesScoreIn = JSON.parse(localStorage.getItem("seriesScore"));
					setSeriesScore(seriesScoreIn);
					setSeriesScoreFields(seriesScoreIn);
					break;

				case "viewstate":
					if(event.newValue !== null) {
						setViewState(event.newValue);
					}
				break;

			}
		};
	}, []);

	// check for unsaved changes
	useEffect(() => {
		if (config.hasOwnProperty("teams")) {
			const tempFieldsWithChanges = [];
			for (let teamnum in config.teams) {
				if (teamNameFields[teamnum] !== config.teams[teamnum].name) {
					tempFieldsWithChanges.push(`teamNameField${teamnum}`);
				}
				if (franchiseFields[teamnum] !== config.teams[teamnum].franchise) {
					tempFieldsWithChanges.push(`franchiseField${teamnum}`);
				}
				if (teamLogoFields[teamnum] !== config.teams[teamnum].logo) {
					tempFieldsWithChanges.push(`teamLogoField${teamnum}`);
				}
				if (seriesScoreFields[teamnum] !== seriesScore[teamnum]) {
					tempFieldsWithChanges.push(`seriesScoreField${teamnum}`);
				}
				if (
					(teamFields[teamnum].hasOwnProperty("name") && teamFields[teamnum].name !== config.teams[teamnum].name)
					|| (!teamFields[teamnum].hasOwnProperty("name") && config.teams[teamnum].name)
				) {
					tempFieldsWithChanges.push(`teamField${teamnum}`);
				}
			}
			// TODO: handle multiple headers
			if (headerField !== config.general.headers[0]) {
				tempFieldsWithChanges.push("headerField");
			}
			if (seriesTypeField !== config.series.type) {
				tempFieldsWithChanges.push("seriesTypeField");
			}
			if (seriesLengthField !== config.series.maxGames) {
				tempFieldsWithChanges.push("seriesLengthField");
			}
			if (showSeriesField !== config.series.show) {
				tempFieldsWithChanges.push("showSeriesField");
			}
			if (brandLogoField !== config.general.brandLogo) {
				tempFieldsWithChanges.push("brandLogoField");
			}
			if (streamTypeField !== config.general.streamType) {
				tempFieldsWithChanges.push("streamTypeField");
			}
			if (Number(seasonNumberField) !== Number(config.general.season)) {
				tempFieldsWithChanges.push("seasonNumberField");
			}
			if (Number(matchdayNumberField) !== Number(config.general.matchday)) {
				tempFieldsWithChanges.push("matchdayNumberField");
			}
			if (tierField !== config.general.tier) {
				tempFieldsWithChanges.push("tierField");
			}
			if (splashOnField !== splashOn) {
				tempFieldsWithChanges.push("splashOnField");
			}
			if (splashCountField !== splashCount) {
				tempFieldsWithChanges.push("splashCountField");
			}

			setFieldsWithChanges(tempFieldsWithChanges);
		}

	}, [
		franchiseFields,
		headerField,
		brandLogoField,
		matchdayNumberField,
		seasonNumberField,
		seriesLengthField,
		seriesScoreFields,
		seriesTypeField,
		showSeriesField,
		splashCountField,
		splashOnField,
		streamTypeField,
		teamFields,
		teamLogoFields,
		teamNameFields,
		tierField,
	]);

	// load tiers on league change
	useEffect(() => {
		if(leagueId > -1) {
			loadTierList(leagueId);
		}
	}, [leagueId]);

	const fieldHasChanges = (fieldName) => fieldsWithChanges.indexOf(fieldName) > -1;

	const openDialog = (dialog) => {
		setCurrentDialog(dialog);
	}

	const closeDialog = (event, reason) => {
		if (reason && reason === "backdropClick") {
			return;
		}
		setCurrentDialog(null);
		setCustomClientId("");
	}

	const saveCustomIdDialog = async () => {
		if (!customClientId) {
			openSnackbar("Client ID is required");
		} else {
			setClientId(customClientId);
			try {
				localStorage.setItem("clientId", customClientId);
				openSnackbar("New Client ID saved");
				closeDialog();
			} catch (err) {
				console.error(err.message);
				openSnackbar("Error saving Client ID");
			}
		}
	}

	const openSnackbar = (message) => {
		setSnackbarMessage(message);
		setSnackbarIsOpen(true);
	}

	const closeSnackbar = () => {
		setSnackbarMessage(null);
		setSnackbarIsOpen(false);
	}

	const saveClientId = async (newClientId) => {
		setClientId(newClientId);
		try {
			localStorage.setItem("clientId", newClientId);
		} catch (err) {
			console.error(err.message);
			openSnackbar("Error saving Client ID");
		}
	}

	const generateRandomClientId = async () => {
		await saveClientId(uuidv4());
		openSnackbar("New random Client ID saved");
	}

	const copyClientIdToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(clientId);
			openSnackbar("Client ID Copied");
		} catch (err) {
			console.error(err.message);
			openSnackbar("Error copying Client ID");
		}
	}

	// TODO: doesn't work in OBS currently; figure out how to fix?
	const copyStatsUrlToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(`${thisUrl.protocol}//${thisUrl.host}/stats/${clientId}`);
			openSnackbar("Stats page URL Copied");
		} catch (err) {
			console.error(err.message);
			openSnackbar("Error copying stats page URL");
		}
	}

	const loadTierList = (league) => {
		if(!Array.isArray(tierLists[league]) || tierLists[league].length < 1 ) {
			const currentTierLists = {...tierLists};
			const apiPromises = [];

			openDialog("loading");

			apiPromises.push(
				getTierList(league)
					.then((loadedTierList) => {
						currentTierLists[league] = loadedTierList;
						setTierLists(currentTierLists);

						// create new empty entry in teams object for league
						const currentTeamLists = {...teamLists}
						currentTeamLists[league] = {};
						setTeamLists(currentTeamLists);

						if (tierField) {
							loadTeamList(leagueId, tierField);
						}
					})
					.catch((error) => {
						console.error(error);
						openSnackbar("Error getting tier list from API");
					})
			);

			// if franchise list isn't loaded, load it
			if(!Array.isArray(franchiseFields[league]) || franchiseFields[league].length < 1 ) {
				const currentFranchiseLists = {...franchiseLists};

				apiPromises.push(
					getFranchiseList(league)
						.then((loadedFranchiseList) => {
							currentFranchiseLists[league] = loadedFranchiseList;
							setFranchiseLists(currentFranchiseLists);
						})
						.catch((error) => {
							console.error(error);
							openSnackbar("Error getting franchise list from API");
						})
				);

			}

			Promise.all(apiPromises)
				.then(() => {
					closeDialog();
				})
				.catch((error) => {
					closeDialog();
					console.error(error);
					openSnackbar("Error loading from API");
				});

		}
	}

	const loadTeamList = (league, tier) => {

		if (league === -1 || !tier) {
			return;
		}

		const currentTeamLists = {...teamLists}

		if (!currentTeamLists.hasOwnProperty(league)) {
			currentTeamLists[league] = {};
		}

		if (!Array.isArray(currentTeamLists[league][tier]) || currentTeamLists[league][tier] < 1 ) {
			openDialog("loading");

			getTeamListByTier(league, tier, currentSeason)
				.then((loadedTeamList) => {
					currentTeamLists[league][tier] = loadedTeamList;
					setTeamLists(currentTeamLists);

					// if a current team name matches, select the object
					const currentTeamFields = [...teamFields];
					const currentTeamNameFields = [...teamNameFields];
					const currentFranchiseFields = [...franchiseFields];

					for (let teamNum in teamNameFields) {
						const matchedTeam = loadedTeamList.filter((team) => team.name === teamNameFields[teamNum]);

						if (matchedTeam.length === 1) {
							currentTeamFields[teamNum] = matchedTeam[0];
						} else {
							currentTeamFields[teamNum] = "";
							currentTeamNameFields[teamNum] = "";
							currentFranchiseFields[teamNum] = "";
						}

						setTeamFields(currentTeamFields);
						setTeamNameFields(currentTeamNameFields);
						setFranchiseFields(currentFranchiseFields);
					}

					closeDialog();
				})
				.catch((error) => {
					closeDialog();
					console.error(error);
					openSnackbar("Error getting team list from API");
				});
		}

	}

	const changeSeriesScoreField = (score, teamNumber) => {
		if (score === "" || Number.isInteger(Number(score))) {
			const tempSeriesScoreField = [... seriesScoreFields];
			tempSeriesScoreField[teamNumber] = score === "" ? "" : Number(score);
			setSeriesScoreFields(tempSeriesScoreField);
		}
	}

	const changeTeamNameField = (name, teamNumber) => {
		const tempTeamNameField = [... teamNameFields];
		tempTeamNameField[teamNumber]= name;
		setTeamNameFields(tempTeamNameField);
	}

	const changeFranchiseField = (name, teamNumber) => {
		const tempFranchiseField = [... franchiseFields];
		tempFranchiseField[teamNumber]= name;
		setFranchiseFields(tempFranchiseField);
	}

	const changeTeamLogoField = (logo, teamNumber) => {
		const tempTeamLogoField = [... teamLogoFields];
		tempTeamLogoField[teamNumber]= logo;
		setTeamLogoFields(tempTeamLogoField);
	}

	const changeShowSeriesField = (value) => {
		setShowSeriesField(value);
	}

	const changeSeriesTypeField = (type) => {
		setSeriesTypeField(type);
	}

	const changeSeriesLengthField = (length) => {
		if (length === "" || Number.isInteger(Number(length))) {
			setSeriesLengthField(length === "" ? "" : Number(length));
		}
	}

	const changeSeasonNumberField = (season) => {
		setSeasonNumberField(season);
	}

	const changeMatchdayNumberField = (matchday) => {
		setMatchdayNumberField(matchday);
	}

	const changeTierField = (tier) => {
		setTierField(tier);
		loadTeamList(leagueId, tier);
	}

	const changeTeamField = (team, teamNumber) => {
		const tempTeamFields = [... teamFields];
		tempTeamFields[teamNumber]= team;
		setTeamFields(tempTeamFields);
		changeTeamNameField(team.name, teamNumber);
		changeFranchiseField(team.franchise.name, teamNumber);
	}

	const setConfigValuesFromLocalStorage = () => {
		const loadedConfig = JSON.parse(localStorage.getItem("config"));
		setConfig(loadedConfig);
		setTeamNameFields([loadedConfig.teams[0].name, loadedConfig.teams[1].name]);
		setFranchiseFields([loadedConfig.teams[0].franchise, loadedConfig.teams[1].franchise]);
		setTeamLogoFields([loadedConfig.teams[0].logo, loadedConfig.teams[1].logo]);
		setSeriesTypeField(loadedConfig.series.type);
		setSeriesLengthField(loadedConfig.series.maxGames);
		setShowSeriesField(loadedConfig.series.show);
		setHeaderField(loadedConfig.general.headers[0]);
		setBrandLogoField(loadedConfig.general.brandLogo);
		setSeasonNumberField(loadedConfig.general.season);
		setMatchdayNumberField(loadedConfig.general.matchday);
		changeTierField(loadedConfig.general.tier);
		changeStreamTypeField(loadedConfig.general.streamType, true);
	}

	const setConfigValuesToDefault = () => {
		setTeamFields(["", ""]);
		setTierField("");
		setConfig(defaultConfig);
		localStorage.setItem("config", JSON.stringify(defaultConfig));
	}

	const setSeriesScoreToDefault = () => {
		setSeriesScore(defaultSeriesScore);
		setSeriesScoreFields(defaultSeriesScore);
		localStorage.setItem("seriesScore", JSON.stringify(defaultSeriesScore))
	}

	const setSplashToDefault = () => {
		setSplashOn(false);
		setSplashOnField(false);
		setSplashCount(0);
		setSplashCountField(0);
		localStorage.setItem("splash", JSON.stringify({
			show: false,
			count: 0,
		}))
	}

	const setAllValuesToDefault = () => {
		setConfigValuesToDefault();
		setSeriesScoreToDefault();
		setSplashToDefault();
		closeDialog();
	}

	const setSeriesScoreFromLocalStorage = () => {
		const seriesScoreIn = JSON.parse(localStorage.getItem("seriesScore"));
		setSeriesScore(seriesScoreIn);
		setSeriesScoreFields(seriesScoreIn);
	}

	const setSplashFromLocalStorage = () => {
		if (localStorage.hasOwnProperty("splash")) {
			const savedSplash = JSON.parse(localStorage.getItem("splash"));

			if (savedSplash.hasOwnProperty("show")) {
				setSplashOn(savedSplash.show);
				setSplashOnField(savedSplash.show);
			} else {
				setSplashOn(false);
				setSplashOnField(false);
			}

			if (savedSplash.hasOwnProperty("count")) {
				setSplashCount(savedSplash.count);
				setSplashCountField(savedSplash.count);
			} else {
				setSplashCount(0);
				setSplashCountField(0);
			}

		} else {
			localStorage.setItem("splash", JSON.stringify({
				show: false,
				count: 0,
			}));
			setSplashOn(false);
			setSplashOnField(false);
			setSplashCount(0);
			setSplashCountField(0);
		}
	}

	// TODO: handle multiple headers
	const changeHeaderField = (text) => {
		setHeaderField(text);
	}

	const changeBrandLogoField = (logo) => {
		setBrandLogoField(logo);
	}

	const setNamesFromDropdowns = () => {
		const tempTeamNames = [];
		const tempFranchises = [];
		for (let team in teamFields) {
			if (teamFields[team].hasOwnProperty("franchise")) {
				tempTeamNames[team] = teamFields[team].name;
				tempFranchises[team] = teamFields[team].franchise.name;
			} else {
				tempTeamNames[team] = teamNameFields[team];
				tempFranchises[team] = franchiseFields[team];
			}
		}
		setTeamNameFields(tempTeamNames);
		setFranchiseFields(tempFranchises);
	}

	// don't set team names based on dropdowns on initial load
	const changeStreamTypeField = (streamType, skipTeamNames) => {
		setStreamTypeField(streamType);

		// TODO: If another league happens, clear tier selection when switching leagues
		switch(streamType) {
			case "RSC3-regular":
				setLeagueId(1);
				changeBrandLogoField("rsc-splatter-logo.png");
				if (!skipTeamNames) {
					setNamesFromDropdowns();
				}
				break;

			case "RSC3-final":
				setLeagueId(1);
				changeBrandLogoField("rsc-splatter-logo.png");
				if (!skipTeamNames) {
					setNamesFromDropdowns();
				}
				break;

			case "RSC3-event":
				changeBrandLogoField("rsc-splatter-logo.png");
				if (headerField === "%%RSCHEADER%%") {
					setHeaderField("");
				}
			break;

			default:
				setLeagueId(-1);
				changeBrandLogoField("");
				if (headerField === "%%RSCHEADER%%") {
					setHeaderField("");
				}

				break;
		}

	}

	const resetFieldValues = () => {
		setConfigValuesFromLocalStorage();
		setSeriesScoreFromLocalStorage();
		setSplashFromLocalStorage();
	}

	const triggerViewState = (triggerState, endState) => {
		if (viewState !== triggerState && viewState !== endState) {
			setViewState(triggerState);
			localStorage.setItem("viewstate", triggerState);
		}
	}

	const switchSplash = () => {
		setSplashOnField(!splashOnField);
	}

	const changeSplashCountField = (count) => {
		if (count === "" || Number.isInteger(Number(count))) {
			setSplashCountField(count);
		}
	}


	const saveToLocalStorage = () => {
		const teamFranchiseLogos = ["", ""];

		const playerStats = [];
		const teamStats = [];
		const tierTeamStats = [];

		// check for required fields
		if (streamTypeField === "RSC3-regular" || streamTypeField === "RSC3-final") {

			if (tierField === "") {
				openSnackbar("Tier and teams must be chosen.");
				return;
			}

			if (teamFields.includes("")) {
				openSnackbar("Teams must be chosen.");
				return;
			}

			if (seasonNumberField === "" || seasonNumberField < 1) {
				openSnackbar("Season number must be set.");
				return;
			}

			if (streamTypeField === "RSC3-regular" && (matchdayNumberField === "" || matchdayNumberField < 1)) {
				openSnackbar("Matchday number must be set.");
				return;
			}

			if (showSeriesField && seriesScoreFields.includes("")) {
				openSnackbar("Team series score can't be blank.");
				return;
			}

			if (Array.isArray(franchiseLists[leagueId]) && franchiseLists[leagueId].length > 0) {
				// only load stats when series score set to 0-0
				const loadPregameStats = (seriesScoreFields[0] === 0 && seriesScoreFields[1] === 0);
				const apiPromises = [];

				// load team stats
				if (loadPregameStats) {
					apiPromises.push(
						getTeamStatsByTier(tierField)
							.then((loadedTeamStats) => {
								tierTeamStats.push(...loadedTeamStats);
							})
							.catch((error) => {
								console.error(error);
								openSnackbar("Error getting team stats from old API");
							})
					);
				}

				for (let teamnum in teamFields) {

					const teamFranchise = franchiseLists[leagueId].filter((franchise) => franchise.id === teamFields[teamnum].franchise.id);
					if (teamFranchise.length === 1) {

						// set franchise logos
						teamFranchiseLogos[teamnum] = teamFranchise[0].logo;

						// load player stats if both teams at 0 games
						if (loadPregameStats) {
								apiPromises.push(
								getTeamPlayerStats(teamFields[teamnum].name)
								.then((loadedPlayerStats) => {
									playerStats[teamnum] = loadedPlayerStats;
								})
								.catch((error) => {
									console.error(error);
									openSnackbar("Error getting team stats from stats service");
								})
							)
						}

					}
				}

				if (loadPregameStats) {
					// load team and player stats
					openDialog("loading");

					Promise.all(apiPromises)
					.then(() => {
						// set team stats from tier list
						for (let teamnum in teamFields) {
							const filteredTeamStats = tierTeamStats.filter((t) => t.teamName === teamFields[teamnum].name);
							if (filteredTeamStats.length === 1) {
								teamStats[teamnum] = filteredTeamStats[0];
							}
						}

						// save pregame stats to local storagge
						localStorage.setItem("pregameStats", JSON.stringify({
							playerStats,
							teamStats,
						}));

						closeDialog();
					})
					.catch((error) => {
						closeDialog();
						console.error(error);
						openSnackbar("Error loading from stats service");
					});

				}

			}


		} else {

			if (showSeriesField && seriesScoreFields.includes("")) {
				openSnackbar("Team series score can't be blank.");
				return;
			}

			if (headerField === "") {
				openSnackbar("Header can't be blank.");
				return;
			}

		}

		setSeriesScore(seriesScoreFields);
		localStorage.setItem("seriesScore", JSON.stringify(seriesScoreFields));

		localStorage.setItem("splash", JSON.stringify({
			show: splashOnField,
			count: splashCountField,
		}));

		const newConfig = {
			general: {
				...config.general,
				headers: [streamTypeField === "RSC3-regular" || streamTypeField === "RSC3-final" ? "%%RSCHEADER%%" : headerField],
				streamType: streamTypeField,
				season: seasonNumberField,
				matchday: matchdayNumberField,
				tier: tierField,
				brandLogo: brandLogoField,
				// TODO: create new theme for finals
				theme: streamTypeField === "RSC3-regular" || streamTypeField === "RSC3-final" || streamTypeField === "RSC3-event" ? "rsc" : "default",
				// TODO: select transition for non-RSC streams
				transition: streamTypeField === "RSC3-regular" || streamTypeField === "RSC3-final" || streamTypeField === "RSC3-event" ? "triangleMerge" : "stripeWipe",
			},
			series: {
				show: streamTypeField === "RSC3-regular" || streamTypeField === "RSC3-final" ? true : showSeriesField,
				type: streamTypeField === "RSC3-regular" ? "set" : streamTypeField === "RSC3-final" ? "bestof" : seriesTypeField,
				display: "both",
				maxGames: streamTypeField === "RSC3-regular" ? 4 : streamTypeField === "RSC3-final" ? 7 : seriesLengthField,
				override: "",
			},
			teams: [
				{
					...config.teams[0],
					name: teamNameFields[0],
					franchise: franchiseFields[0],
					logo: streamTypeField === "RSC3-regular" || streamTypeField === "RSC3-final" ? teamFranchiseLogos[0] : teamLogoFields[0],
				},
				{
					...config.teams[1],
					name: teamNameFields[1],
					franchise: franchiseFields[1],
					logo: streamTypeField === "RSC3-regular" || streamTypeField === "RSC3-final" ? teamFranchiseLogos[1] : teamLogoFields[1],
				},
			],
		};

		localStorage.setItem("config", JSON.stringify(newConfig));
		setConfig(newConfig);
		setHeaderField(streamTypeField === "RSC3-regular" || streamTypeField === "RSC3-final" ? "%%RSCHEADER%%" : headerField);
		setFieldsWithChanges([]);

		setSplashCount(splashCountField);
		setSplashOn(splashOnField);
	}


	return (
		Array.isArray(teamData) && config.hasOwnProperty("teams") ?

			<div id="ControlPanel">

				<Dialog
					open={currentDialog === "customId"}
					onClose={closeDialog}
				>
					<DialogContent>
						<p>Make this unique; don't cross the streams.</p>
						<FormControl variant="outlined" required>
							<InputLabel htmlFor="newClientId">New Client ID</InputLabel>
							<OutlinedInput
								id="newClientId"
								label="New Client ID"
								onChange={(e) => setCustomClientId(e.target.value)}
								value={customClientId}
							/>
						</FormControl>
					</DialogContent>
					<DialogActions>
						<Button onClick={saveCustomIdDialog}>Save</Button>
						<Button color="inherit" onClick={closeDialog}>Cancel</Button>
					</DialogActions>
				</Dialog>

				<Dialog
					open={currentDialog === "confirmDefault"}
					onClose={closeDialog}
				>
					<DialogContent>
						<p>This will set <strong><em>everything</em></strong> to default and save immediately.  Are you sure?</p>
					</DialogContent>
					<DialogActions>
						<Button onClick={setAllValuesToDefault}>Set to Default</Button>
						<Button color="inherit" onClick={closeDialog}>Cancel</Button>
					</DialogActions>
				</Dialog>

				<Dialog
					open={currentDialog === "loading"}
					onClose={closeDialog}
				>
					<DialogContent>
						<p>Loading...</p>
					</DialogContent>
				</Dialog>

				<Snackbar
					autoHideDuration={4000}
					open={snackbarIsOpen}
					onClose={closeSnackbar}
					message={snackbarMessage}
				/>

				<h1>RSC overlay control panel</h1>

				<ThemeProvider theme={panelTheme}>

					<Container>
						<Grid container spacing={0} className="idGrid">

							<Grid size={{xs: 12, md: 5}}>
								<Item >
									<strong>Stats page URL:</strong><br />{thisUrl.protocol}//{thisUrl.host}/stats/{clientId}
								</Item>
							</Grid>

							<Grid size={{xs: 12, md: 4}} justifyContent="flex-end" offset="auto" display="flex">
								<Item>
									<Button
										size="small"
										variant="contained"
										color="inherit"
										onClick={() => {setCurrentDialog("customId")}}
									>
										Set Custom Id
									</Button>
									<Button
										variant="outlined"
										color="warning"
										onClick={generateRandomClientId}
									>
										New Random Id
									</Button>
								</Item>
							</Grid>

		{/* can't copy from within OBS; figure out later? */
		/* 					<Grid size={{xs: 12, md: 4}}>
								<Item>
									<Button variant="contained" onClick={copyStatsUrlToClipboard}>Copy Stats URL</Button>
									<Button variant="outlined" onClick={copyClientIdToClipboard}>Copy Id</Button>
								</Item>
							</Grid>
		*/}

							</Grid>

							<Grid container spacing={2} className="buttons">

								<Grid size={12}>
									<Button
										disabled={!fieldsWithChanges.length}
										variant="contained"
										color="success"
										onClick={saveToLocalStorage}
									>
										Save
									</Button>
									<Button
										disabled={!fieldsWithChanges.length}
										variant="outlined"
										color="warning"
										onClick={resetFieldValues}
									>
										Reset
									</Button>
									<Button
										// disabled={!hasChanges}
										variant="outlined"
										color="error"
										onClick={() => openDialog("confirmDefault")}
									>
										Set to Default
									</Button>
								</Grid>

							</Grid>

							<Grid container size={12} spacing={0} className="gridRow">

								<Grid size={{xs: 12, md: 3}}>
									<Item>
										<FormControl size="small" fullWidth>
											<InputLabel id="streamTypeLabel" shrink>Stream Type</InputLabel>
											<Select
												notched
												labelId="streamTypeLabel"
												id="streanType"
												value={streamTypeField}
												label="Stream Type"
												className={fieldHasChanges("streamTypeField") ? "changedField" : ""}
												onChange={(e) => changeStreamTypeField(e.target.value)}
											>
												<MenuItem value="RSC3-regular">RSC 3s Regular Season</MenuItem>
												<MenuItem value="RSC3-final">RSC 3s Finals</MenuItem>
												<MenuItem value="RSC3-event">RSC 3s Other Event</MenuItem>
												<MenuItem value="other">No RSC branding</MenuItem>
											</Select>
										</FormControl>
									</Item>
								</Grid>

							</Grid>


								{streamTypeField === "RSC3-regular" || streamTypeField === "RSC3-final" ?

									<>

										<Grid container size={12} spacing={0} className="gridRow">

											<Grid size={3}>
												<Item>
													<TextField
														fullWidth
														required
														inputProps={{
															min: 1,
															step: 1,
														}}
														id="seasonNumber"
														type="number"
														size="small"
														label="Season"
														value={seasonNumberField}
														onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
														onChange={(e) => changeSeasonNumberField(e.target.value)}
														className={`${fieldHasChanges("seasonNumberField") ? "changedField" : ""} ${seasonNumberField === "" || seasonNumberField < 1 ? "errorField" : ""}`}
													/>
												</Item>
											</Grid>

											<Grid size={3}>
												<Item>
													<TextField
														fullWidth
														required
														inputProps={{
															min: 1,
															step: 1,
														}}
														id="matchdayNumberField"
														type="number"
														size="small"
														label="Matchday"
														value={matchdayNumberField}
														disabled={streamTypeField === "RSC3-final"}
														onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
														onChange={(e) => changeMatchdayNumberField(e.target.value)}
														className={`${fieldHasChanges("matchdayNumberField") ? "changedField" : ""} ${streamTypeField === "RSC3-regular" && (matchdayNumberField === "" || matchdayNumberField < 1) ? "errorField" : ""}`}
													/>
												</Item>
											</Grid>

											{Array.isArray(tierLists[leagueId]) && tierLists[leagueId].length > 0 ?

												<Grid size={6}>
													<Item>
														<FormControl size="small" fullWidth>
															<InputLabel id="tierFieldLabel" shrink>Tier</InputLabel>
															<Select
																notched
																labelId="tierFieldLabel"
																id="tierField"
																value={tierField}
																required
																label="Tier"
																onChange={(e) => changeTierField(e.target.value)}
																className={`${fieldHasChanges("tierField") ? "changedField" : ""} ${tierField === "" ? "errorField" : ""}`}
															>
																{tierLists[leagueId]
																	.sort((a,b) => Number(a.position) < Number(b.position) ? 1 : Number(a.position) > Number(b.position) ? -1 : 0)
																	.map(tier => (
																		<MenuItem key={tier.id} value={tier.name}>{tier.name}</MenuItem>
																))}
															</Select>
														</FormControl>
													</Item>
												</Grid>

											: null}

										</Grid>

										<Grid container size={12} spacing={0} className="gridRow pregameButtons">

											<Grid size={12}>
												<h2>Pregame cards</h2>

												<Item justifyContent={"center"}>

													<Button
														variant={viewState === "matchup" ? "contained" : "outlined"}
														disabled={viewState === "matchup" || viewState === "triggerMatchup"}
														style={{
															borderWidth: "2px",
															borderStyle: "solid",
															borderColor: viewState === "matchup" ? "yellowgreen" : "",
														}}
														color="primary"
														onClick={() => {triggerViewState("triggerMatchup", "matchup")}}
													>Matchup</Button>

													<Button
														color="secondary"
														variant={viewState === "teamStats" ? "contained" : "outlined"}
														disabled={viewState === "teamStats" || viewState === "triggerTeamStats"}
														style={{
															borderWidth: "2px",
															borderStyle: "solid",
															borderColor: viewState === "teamStats" ? "yellowgreen" : "",
														}}
														onClick={() => {triggerViewState("triggerTeamStats", "teamStats")}}
													>Team stats</Button>

													<Button
														variant={viewState === "playerStats0" ? "contained" : "outlined"}
														disabled={viewState === "playerStats0" || viewState === "triggerPlayerStats0"}
														style={{
															borderWidth: "2px",
															borderStyle: "solid",
															borderColor: viewState === "playerStats0" ? "yellowgreen" : `#${config.teams[0].color ? config.teams[0].color : teamData[0].color_primary}`,
															backgroundColor: viewState === "playerStats0" ? `#${config.teams[0].color ? config.teams[0].color : teamData[0].color_primary}` : null,
															color: viewState === "playerStats0" ? null : `#${config.teams[0].color ? config.teams[0].color : teamData[0].color_primary}`,
														}}
														onClick={() => {triggerViewState("triggerPlayerStats0", "playerStats0")}}
													>Player stats 1</Button>

													<Button
														variant={viewState === "playerStats1" ? "contained" : "outlined"}
														disabled={viewState === "playerStats1" || viewState === "triggerPlayerStats1"}
														style={{
															borderWidth: "2px",
															borderStyle: "solid",
															borderColor: viewState === "playerStats1" ? "yellowgreen" : `#${config.teams[1].color ? config.teams[1].color : teamData[1].color_primary}`,
															backgroundColor: viewState === "playerStats1" ? `#${config.teams[1].color ? config.teams[1].color : teamData[1].color_primary}` : null,
															color: viewState === "playerStats1" ? null : `#${config.teams[1].color ? config.teams[1].color : teamData[1].color_primary}`,
														}}
														onClick={() => {triggerViewState("triggerPlayerStats1", "playerStats1")}}
													>Player stats 2</Button>

													<Button
														variant={viewState === "live" ? "contained" : "outlined"}
														disabled={viewState === "live" || viewState === "triggerLive"}
														color="error"
														style={{
															borderWidth: "2px",
															borderStyle: "solid",
															borderColor: viewState === "live" ? "yellowgreen" : "",
														}}
														onClick={() => {triggerViewState("triggerLive", "live")}}
													>Live game</Button>

												</Item>

											</Grid>

										</Grid>

									</>

								:
									<>

										<Item>
											<FormControl variant="outlined" size="small" fullWidth>
												<InputLabel shrink htmlFor={`header`}>Header</InputLabel>
												<OutlinedInput
													notched
													id="header"
													label="Header"
													onChange={(e) => changeHeaderField(e.target.value)}
													value={headerField}
													className={`${fieldHasChanges(`headerField`) ? "changedField" : ""} ${headerField === "" ? "errorField" : ""}`}
												/>
											</FormControl>
										</Item>

										{streamTypeField === "other" ?

										<Item>
											<FormControl variant="outlined" size="small" fullWidth>
												<InputLabel shrink htmlFor={`brandLogo`}>Brand Logo</InputLabel>
												<OutlinedInput
													notched
													id="brandLogo"
													label="Brand Logo"
													onChange={(e) => changeBrandLogoField(e.target.value)}
													value={brandLogoField}
													className={`${fieldHasChanges(`brandLogoField`) ? "changedField" : ""}`}
												/>
											</FormControl>
										</Item>



										: null}

									</>

								}



								{/* TODO: Handle custom series text */}

								{streamTypeField !== "RSC3-regular" && streamTypeField !== "RSC3-final" ?

									<Grid container size={12} spacing={0} className="gridRow">

										<Grid size={3}>
											<Item>
												<FormControl size="small" fullWidth>
													<InputLabel id="showSeriesLabel" shrink>Show Series?</InputLabel>
													<Select
														notched
														labelId="showSeriesLabel"
														id="showSeries"
														value={showSeriesField}
														label="Show Series?"
														className={fieldHasChanges("showSeriesField") ? "changedField" : ""}
														onChange={(e) => changeShowSeriesField(e.target.value)}
													>
														<MenuItem value={true}>Yes</MenuItem>
														<MenuItem value={false}>No</MenuItem>

													</Select>
												</FormControl>
											</Item>
										</Grid>

										{showSeriesField === true ?

											<>

												<Grid size={6}>
													<Item>
														<FormControl size="small" fullWidth>
															<InputLabel id="seriesTypeLabel" shrink>Series Type</InputLabel>
															<Select
																notched
																labelId="seriesTypeLabel"
																id="seriesType"
																value={seriesTypeField}
																label="Series Type"
																className={fieldHasChanges("seriesTypeField") ? "changedField" : ""}
																onChange={(e) => changeSeriesTypeField(e.target.value)}
															>
																<MenuItem value="bestof">Best of</MenuItem>
																<MenuItem value="set">Set number of games</MenuItem>
																<MenuItem value="unlimited">Unlimited</MenuItem>
															</Select>
														</FormControl>

													</Item>
												</Grid>

												<Grid size={3}>
													<Item>
														<TextField
															fullWidth
															required
															inputProps={{
																min: 1,
																step: 1,
															}}
															id="seriesLength"
															type="number"
															size="small"
															label="Games"
															disabled={seriesTypeField === "unlimited"}
															value={seriesLengthField}
															onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
															onChange={(e) => changeSeriesLengthField(e.target.value)}
															className={`${fieldHasChanges("seriesLengthField") ? "changedField" : ""} ${seriesTypeField !== "unlimited" && !seriesLengthField ? "errorField" : ""}`}
														/>
													</Item>
												</Grid>

											</>

										: null}

									</Grid>

								: null}



							<Grid container size={12} spacing={2} className="mainPanelGrid">
								{teamData.map((team, teamnum) => (
								<Grid container
									spacing={0}
									key={teamnum}
									size={{xs:12, md: 6}}
									className={`team team${teamnum}`}
									style={{
										borderColor: `#${config.teams[teamnum].color ? config.teams[teamnum].color : team.color_primary}`,
									}}
								>

									<Grid size={12}>
										<Item>
											<strong>In Game:</strong> {team.name}
										</Item>
									</Grid>

									<Grid size={9}>
										<Item>
											{streamTypeField !== "RSC3-regular" && streamTypeField !== "RSC3-final" ?
												<>
													<FormControl variant="outlined" size="small" fullWidth>
														<InputLabel shrink htmlFor={`teamNameField${teamnum}`}>Team Name</InputLabel>
														<OutlinedInput
															notched
															id={`teamNameField${teamnum}`}
															label="Team Name"
															onChange={(e) => changeTeamNameField(e.target.value, teamnum)}
															value={teamNameFields[teamnum]}
															placeholder={team.name}
															className={fieldHasChanges(`teamNameField${teamnum}`) ? "changedField" : ""}
														/>
													</FormControl><br />
													<FormControl variant="outlined" size="small" fullWidth>
														<InputLabel shrink htmlFor={`franchiseField${teamnum}`}>Franchise Name</InputLabel>
														<OutlinedInput
															notched
															id={`franchiseField${teamnum}`}
															label="Franchise Name"
															onChange={(e) => changeFranchiseField(e.target.value, teamnum)}
															value={franchiseFields[teamnum]}
															className={fieldHasChanges(`franchiseField${teamnum}`) ? "changedField" : ""}
														/>
													</FormControl>
													{/* TODO: upload team logo */}
													<FormControl variant="outlined" size="small" fullWidth>
														<InputLabel shrink htmlFor={`teamLogoField${teamnum}`}>Team Logo</InputLabel>
														<OutlinedInput
															notched
															id={`teamLogoField${teamnum}`}
															label="Team Logo"
															onChange={(e) => changeTeamLogoField(e.target.value, teamnum)}
															value={teamLogoFields[teamnum]}
															className={fieldHasChanges(`teamLogoField${teamnum}`) ? "changedField" : ""}
														/>
													</FormControl><br />
												</>
											: teamLists.hasOwnProperty(leagueId) && Array.isArray(teamLists[leagueId][tierField]) && teamLists[leagueId][tierField].length > 0 ?
												<>
													<FormControl size="small" fullWidth>
														<InputLabel id={`teamField${teamnum}Label`} shrink>Team</InputLabel>
														<Select
															notched
															labelId={`teamField${teamnum}Label`}
															id={`teamField${teamnum}`}
															value={teamFields[teamnum]}
															required
															label="Team"
															className={`${fieldHasChanges(`teamField${teamnum}`) ? "changedField" : ""} ${teamFields[teamnum] === "" ? "errorField" : ""}`}
															onChange={(e) => changeTeamField(e.target.value, teamnum)}
														>
															{teamLists[leagueId][tierField]
																	.sort((a,b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0)
																	.map(team => (
																		<MenuItem key={team.id} value={team}>{team.name}</MenuItem>
																))}
														</Select>
													</FormControl>

												</>
											: null
											}
										</Item>
									</Grid>

									{(streamTypeField === "RSC3-regular" || streamTypeField === "RSC3-final") || showSeriesField ?

										<Grid size={3}>
											<Item>
												<TextField
													required
													inputProps={{
														min: 0,
														step: 1,
													}}
													id={`seriesScoreField${teamnum}`}
													type="number"
													size="small"
													label="Games"
													value={seriesScoreFields[teamnum]}
													onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
													onChange={(e) => changeSeriesScoreField(e.target.value, teamnum)}
													className={`${fieldHasChanges(`seriesScoreField${teamnum}`) ? "changedField" : ""} ${seriesScoreFields[teamnum] === "" ? "errorField" : ""}`}
												/>
											</Item>
										</Grid>

									: null}

								</Grid>

							))}

						</Grid>

						<Grid container size={12} spacing={2} className="mainPanelGrid">

							<Grid size={6}>
								<Item>
									<span className={fieldHasChanges("splashOnField") ? "changedField" : ""}>
										<strong>Show splash counter?</strong>
									</span>
									<Switch
										checked={splashOnField}
										onChange={switchSplash}
										color={splashOnField ? "splash" : "primary"}
									/>
								</Item>
							</Grid>

							{splashOnField ?

								<Grid size={6}>
									<Item>
										<TextField
											required
											inputProps={{
												min: 0,
												step: 1,
											}}
											id="splashCountField"
											type="number"
											size="small"
											label="Splash Count"
											value={splashCountField}
											onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
											onChange={(e) => changeSplashCountField(e.target.value)}
											className={`${fieldHasChanges(`splashCountField`) ? "changedField" : ""} ${splashCountField === "" ? "errorField" : ""}`}
										/>
									</Item>
								</Grid>


							: null}


						</Grid>

					</Container>

				</ThemeProvider>

			</div>

		:

			// TODO: Figure out the real issue?  Maybe useRef?
			<div>
				<p>Refresh this panel.  (Within OBS: right click in this panel, then click "Refresh".)</p>
				<p>If you&apos;ve already refreshed, ask for help.</p>
			</div>
	)

}

export default ControlPanel;
