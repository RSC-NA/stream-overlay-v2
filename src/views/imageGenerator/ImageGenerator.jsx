import React, { useEffect, useState } from "react";
import * as htmlToImage from "html-to-image";

import PlayoffBracket from "@/views/imageGenerator/PlayoffBracket";
import StreamSchedule from "@/views/imageGenerator/StreamSchedule";

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

import playoffConfig from "@/data/playoffs";

import ("@/style/appMain.scss");
import ("@/style/imageGen.scss");

const teamColors = ["#206cff", "#f88521"];
const defaultTimes = {
	regular: ["10:50", "11:30"],
	finals: ["9:30", "10:30"],
}
const currentSeason = 25; // TODO: set on new season (or dynamically?)

// TODO: don't have formats yet
const imageSizes = [
	{
		id: "base",
		label: "Base",
		width: 1920,
		height: 1080,
	},
]

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
	padding: theme.spacing(2),
	textAlign: "left",
	color: "#ffffff",
}));

function b64toBlob(dataURI) {

    var byteString = atob(dataURI.split(",")[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);

    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: "image/png" });
}

const gamesInRound = (tier, round) => {
	if (!tier || !round || !playoffConfig.hasOwnProperty(tier) || !playoffConfig[tier].teams) {
		return 0;
	}

	const teamCount = playoffConfig[tier].teams;
	const hasConf = playoffConfig[tier].conferences;

	switch(round) {
		case 1:
			if (teamCount <= 8) {
				return 0;
			} else {
				return 8;
			}
			break;
		case 2:
			if (teamCount <= 4) {
				return 0;
			} else {
				return 4;
			}
			break;
		case 3:
			return 2;
			break;
		default:
			console.error("Error finding games in round");
			return 0;
			break;
	}

}

const blankArray = (len) => Array.from({length: len}, () => "");

const teamTBD = {
	"id": "TBD",
	"name": "TBD",
};

// NOTE: This is iniitally just set up for RSC 3s and will need a serious rework to handle multiple leagues

const ImageGenerator = () => {

	const [franchiseLists, setFranchiseLists] = useState({});
	const [leagueId, setLeagueId] = useState(-1);
	const [tierLists, setTierLists] = useState({});
	const [teamLists, setTeamLists] = useState({});

	const [imageType, setImageType] = useState("regular");
	const [season, setSeason] = useState(currentSeason); // TODO: Update default each season?
	const [matchday, setMatchday] = useState(1);
	const [gameCount, setGameCount] = useState(2);
	const [scheduleTimes, setScheduleTimes] = useState(["",""]);
	const [scheduleTiers, setScheduleTiers] = useState(["",""]);
	const [scheduleTeams, setScheduleTeams] = useState([["",""],["",""]]);

	const [bracketTier, setBracketTier] = useState("");
	const [lunarTeams, setLunarTeams] = useState([]);
	const [solarTeams, setSolarTeams] = useState([]);
	const [rd2Teams, setRd2Teams] = useState([]);
	const [semiTeams, setSemiTeams] = useState([]);
	const [finalTeams, setFinalTeams] = useState([]);

	const [sameTeams, setSameTeams] = useState([false, false]);

	const [generatorData, setGeneratorData] = useState({});
	const [generatedImages, setGeneratedImages] = useState([]);

	const [currentDialog, setCurrentDialog] = useState(null);
	const [snackbarIsOpen, setSnackbarIsOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");

	useEffect(() => {
		if(leagueId > -1) {
			loadTierList(leagueId);
		} else {
			setLeagueId(1); // default 1 for RSC 3s; handle elsewhere for multiple leagues
		}
	}, [leagueId]);

	const openDialog = (dialog) => {
		setCurrentDialog(dialog);
	}

	const closeDialog = (event, reason) => {
		if (reason && reason === "backdropClick") {
			return;
		}
		setCurrentDialog(null);
	}

	const openSnackbar = (message) => {
		setSnackbarMessage(message);
		setSnackbarIsOpen(true);
	}

	const closeSnackbar = () => {
		setSnackbarMessage(null);
		setSnackbarIsOpen(false);
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
					})
					.catch((error) => {
						console.error(error);
						openSnackbar("Error getting tier list from API");
					})
			);

			// if franchise list isn't loaded, load it
			if (!(Array.isArray(franchiseLists[league]) && franchiseLists[league].length)) {
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

					closeDialog();
				})
				.catch((error) => {
					closeDialog();
					console.error(error);
					openSnackbar("Error getting team list from API");
				});
		}

	}

	const changeScheduleTierField = (game, value) => {
		const currentTiers = [...scheduleTiers];
		currentTiers[game] = value;
		setScheduleTiers(currentTiers);
		loadTeamList(leagueId, value);

		changeScheduleTeamField(game, 0, "");
		changeScheduleTeamField(game, 1, "");
	}

	const changeScheduleTimeField = (game, value) => {
		const currentTimes = [...scheduleTimes];
		currentTimes[game] = value;
		setScheduleTimes(currentTimes);
	}

	const changeScheduleTeamField = (game, teamNum, value) => {
		const currentTeams = [...scheduleTeams];
		const currentSameTeams = [...sameTeams];

		currentTeams[game][teamNum] = value;
		setScheduleTeams(currentTeams);

		for (let gm = 0; gm < gameCount; gm++) {
			if (currentTeams[gm][0].hasOwnProperty("name") && currentTeams[gm][1].hasOwnProperty("name")) {
				currentSameTeams[gm] = (
					currentTeams[gm][0].name !== "TBD"
						&& currentTeams[gm][0].name === currentTeams[gm][1].name
					);
			} else {
				currentSameTeams[gm] = false;
			}
		}
		setSameTeams(currentSameTeams);

	}

	const changeBracketTierField = (value) => {

		setBracketTier(value);
		loadTeamList(leagueId, value);
		resetBracketTeamFields(value);

	}

	const changeSolarTeamField = (teamNum, value) => {
	const currentTeams = [...solarTeams];

		currentTeams[teamNum] = value;
		setSolarTeams(currentTeams);
	}

	const changeLunarTeamField = (teamNum, value) => {
		const currentTeams = [...lunarTeams];

		currentTeams[teamNum] = value;
		setLunarTeams(currentTeams);
	}

	const changeRd2TeamField = (teamNum, value) => {
		const currentTeams = [...rd2Teams];

		currentTeams[teamNum] = value;
		setRd2Teams(currentTeams);
	}

	const changeSemiTeamField = (teamNum, value) => {
		const currentTeams = [...semiTeams];

		currentTeams[teamNum] = value;
		setSemiTeams(currentTeams);
	}

	const changeFinalTeamField = (teamNum, value) => {
		const currentTeams = [...finalTeams];

		currentTeams[teamNum] = value;
		setFinalTeams(currentTeams);
	}


	const resetFields = () => {

		setSeason(currentSeason);
		setMatchday(1);
		setGameCount(2);
		setScheduleTimes(["",""]);
		setScheduleTiers(["",""]);
		setScheduleTeams([["",""],["",""]]);
		setBracketTier("");
		resetBracketTeamFields();

	}

	const resetBracketTeamFields = (tier) => {
		setSolarTeams(!tier ? [] : blankArray(playoffConfig[tier].teams / (playoffConfig[tier].conferences ? 2 : 1)));
		setLunarTeams(!tier ? [] : blankArray(playoffConfig[tier].teams / (playoffConfig[tier].conferences ? 2 : 1)));
		setRd2Teams(!tier ? [] : blankArray(gamesInRound(tier, 1)));
		setSemiTeams(!tier ? [] : blankArray(gamesInRound(tier, 2)));
		setFinalTeams(!tier ? [] : blankArray(gamesInRound(tier, 3)));

	}

	const generate = () => {

		let genData = {
			ready: false,
		};

		setGeneratedImages([]);

		if (imageType === "regular" || imageType === "finals") {
			if (!season
				|| (imageType === "regular" && !matchday)
				|| !scheduleTiers[0]
				|| !scheduleTeams[0][0].hasOwnProperty("name")
				|| !scheduleTeams[0][1].hasOwnProperty("name")
				|| (gameCount === 2 && (
					!scheduleTiers[1]
					|| !scheduleTeams[1][0].hasOwnProperty("name")
					|| !scheduleTeams[1][1].hasOwnProperty("name")
				))
			) {
				openSnackbar("Please fill all fields.")
				return;
			}

			if (scheduleTeams[0][0].name !== "TBD" && scheduleTeams[0][0].name === scheduleTeams[0][1].name
				|| (gameCount === 2 && scheduleTeams[1][0].name !== "TBD" &&scheduleTeams[1][0].name === scheduleTeams[1][1].name)
			) {
				openSnackbar("A team can't play against themselves.")
				return;
			}

			genData = {
				imageType,
				games: [],
				matchday,
				ready: true,
				season,
			};

			for (let gm = 0; gm < gameCount; gm++) {

				const gameData = {
					time: scheduleTimes[gm] || defaultTimes[imageType][gm],
					tier: scheduleTiers[gm],
					teams: [...scheduleTeams[gm]],
				}

				for (let tm = 0; tm < 2; tm++) {
					if (scheduleTeams[gm][tm].hasOwnProperty("franchise")) {
						gameData.teams[tm].logo = franchiseLists[leagueId].filter((franchise) => franchise.id === scheduleTeams[gm][tm].franchise.id)[0].logo;
					}
				}

				genData.games.push(gameData);

			}

		} else if (imageType === "bracket") {

			if (solarTeams.indexOf("") > -1 || (playoffConfig[bracketTier].conferences && lunarTeams.indexOf("") > -1) ) {
				openSnackbar("All playoff teams must be chosen.")
				return;
			}

			genData = {
				imageType,
				ready: true,
				franchiseList: franchiseLists[leagueId],
				season,
				tier: bracketTier,
				config: playoffConfig[bracketTier],
				solarTeams,
				lunarTeams,
				rd2Teams,
				semiTeams,
				finalTeams,
			}


		}

		if (genData.ready) {

			openDialog("generating");
			setGeneratorData(genData);
			setTimeout(() => {
				generateImageFiles();
			}, 2000);

		}

	}

	const generateImageFiles = () => {
		const imageList = [];
		const promises = [];

		for (let imgData of imageSizes) {
			promises.push(
				generateImage(imgData)
					.then(imgUrl => {
						imageList.push({
							...imgData,
							url: imgUrl,
						});
					})
					.catch(error => {
						console.error(error);
						openSnackbar("Error generating images");
					})
			);
		}

		Promise.all(promises)
			.then(() => {
				setGeneratedImages(imageList)
				closeDialog();
			})
			.catch(error => {
				closeDialog();
				console.error(error);
				openSnackbar("Error generating images");
			});

	}

	const generateImage = async (imgData) =>
		htmlToImage
			.toPng(document.getElementById(imgData.id), {
				width: imgData.width,
				height: imgData.height,
			})
			.then(dataUrl => {
				return dataUrl;
			})
			.catch(error => {
				openSnackbar("Error generating image");
				console.error("Error generating image", error);
			});

	return (
		<div id="ImageGenerator">

			<Dialog
				open={currentDialog === "loading"}
				onClose={closeDialog}
				disableEscapeKeyDown={true}
			>
				<DialogContent>
					<p>Loading...</p>
				</DialogContent>
			</Dialog>

			<Dialog
				open={currentDialog === "generating"}
				onClose={closeDialog}
			>
				<DialogContent>
					<p>Generating...</p>
				</DialogContent>
			</Dialog>

			<Snackbar
				autoHideDuration={4000}
				open={snackbarIsOpen}
				onClose={closeSnackbar}
				message={snackbarMessage}
			/>

			<div className="selectors">

				<ThemeProvider theme={panelTheme}>
					<Container maxWidth="xxxxl">

						<Grid size={12} container>

							<Grid size={{xs: 12, md: 4}}>
								<Item>

									<p>Options</p>

									<FormControl size="small" fullWidth>
										<InputLabel id="imageTypeLabel" shrink>Game Type</InputLabel>
										<Select
											notched
											labelId="imageTypeLabel"
											id="imageType"
											value={imageType}
											required
											label="Image Type"
											onChange={(e) => setImageType(e.target.value)}
										>
											<MenuItem value="regular">Regular Season Schedule</MenuItem>
											<MenuItem value="finals">Finals Schedule</MenuItem>
											<MenuItem value="bracket">Playoff Bracket</MenuItem>
										</Select>
									</FormControl>

									<TextField
										fullWidth
										required
										inputProps={{
											min: 1,
											step: 1,
											max: currentSeason,
										}}
										id="season"
										type="number"
										size="small"
										label="Season"
										value={season}
										onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
										onChange={(e) => setSeason(e.target.value)}
										className={season === "" || season < 1 || season > currentSeason ? "errorField" : ""}
									/>

									{ imageType === "regular" || imageType === "finals" ?

										<>

											<TextField
												fullWidth
												required
												inputProps={{
													min: 1,
													step: 1,
												}}
												id="matchday"
												type="number"
												size="small"
												label="Matchday"
												value={matchday}
												disabled={imageType !== "regular"}
												onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
												onChange={(e) => setMatchday(e.target.value)}
												className={matchday === "" || matchday < 1 ? "errorField" : ""}
											/>

											<FormControl size="small" fullWidth>
												<InputLabel id="gameCountLabel" shrink>Games</InputLabel>
												<Select
													notched
													labelId="gameCountLabel"
													id="gameCount"
													value={gameCount}
													required
													label="Game"
													onChange={(e) => setGameCount(e.target.value)}
												>
													<MenuItem value={1}>1</MenuItem>
													<MenuItem value={2}>2</MenuItem>
												</Select>
											</FormControl>

										</>

									:

										<FormControl size="small" fullWidth>
											<InputLabel id="bracketTierLabel" shrink>Tier</InputLabel>
											<Select
												notched
												labelId="bracketTierLabel"
												id="bracketTier"
												value={bracketTier}
												required
												label="Tier"
												onChange={(e) => changeBracketTierField(e.target.value)}
												className={!bracketTier ? "errorField" : ""}
											>
												{tierLists[leagueId]
													.sort((a,b) => Number(a.position) < Number(b.position) ? 1 : Number(a.position) > Number(b.position) ? -1 : 0)
													.map(tier => (
														<MenuItem key={tier.id} value={tier.name}>{tier.name}</MenuItem>
												))}
											</Select>
										</FormControl>

									}

									<Button onClick={generate} variant="contained">Generate</Button>
									<Button onClick={resetFields} color="error" variant="contained">Reset Fields</Button>

								</Item>
							</Grid>

							{ imageType === "regular" || imageType === "finals" ?

								Array.isArray(tierLists[leagueId]) && tierLists[leagueId].length ?

									Array.from({length: gameCount}).map((dummy, gameIndex) =>

										<Grid size={{xs: 12, md: 4}} key={`game${gameIndex}`}>
											<Item>

												<p>Game {gameIndex + 1}</p>

												<FormControl variant="outlined" size="small" fullWidth>
													<InputLabel shrink htmlFor={`time${gameIndex}`}>Time</InputLabel>
													<OutlinedInput
														notched
														id={`time${gameIndex}`}
														label="Time"
														onChange={(e) => changeScheduleTimeField(gameIndex, e.target.value)}
														value={scheduleTimes[gameIndex]}
														placeholder={defaultTimes[imageType][gameIndex]}
													/>
												</FormControl><br />

												<FormControl size="small" fullWidth>
													<InputLabel id={`tier${gameIndex}Label`} shrink>Tier</InputLabel>
													<Select
														notched
														labelId={`tier${gameIndex}Label`}
														id={`tier${gameIndex}`}
														value={scheduleTiers[gameIndex]}
														required
														label="Tier"
														onChange={(e) => changeScheduleTierField(gameIndex, e.target.value)}
														className={!scheduleTiers[gameIndex] ? "errorField" : ""}
													>
														{tierLists[leagueId]
															.sort((a,b) => Number(a.position) < Number(b.position) ? 1 : Number(a.position) > Number(b.position) ? -1 : 0)
															.map(tier => (
																<MenuItem key={tier.id} value={tier.name}>{tier.name}</MenuItem>
														))}
													</Select>
												</FormControl>

												{scheduleTiers[gameIndex] && teamLists[leagueId].hasOwnProperty(scheduleTiers[gameIndex]) ?

													Array.from({length: 2}).map((dummyTeam, teamIndex) =>

														<FormControl size="small" fullWidth key={`game${gameIndex}team${teamIndex}`}>
															<InputLabel id={`game${gameIndex}team${teamIndex}Label`} shrink>Team {teamIndex + 1}</InputLabel>
															<Select
																notched
																labelId={`game${gameIndex}team${teamIndex}Label`}
																id={`game${gameIndex}team${teamIndex}`}
																value={scheduleTeams[gameIndex][teamIndex]}
																required
																label={`Team ${teamIndex + 1}`}
																onChange={(e) => changeScheduleTeamField(gameIndex, teamIndex, e.target.value)}
																className={!scheduleTeams[gameIndex][teamIndex].hasOwnProperty("name") || sameTeams[gameIndex] ? "errorField" : ""}
															>
																{imageType === "finals" ?
																	<MenuItem value={teamTBD}>TBD</MenuItem>
																: null}

																{teamLists[leagueId][scheduleTiers[gameIndex]]
																	.sort((a,b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0)
																	.map(team => (
																		<MenuItem key={team.id} value={team}>{team.name}</MenuItem>
																))}
															</Select>
														</FormControl>

													)
												: null}


											</Item>
										</Grid>

									)

								: null


							:

								bracketTier
									&& teamLists[leagueId].hasOwnProperty(bracketTier)
									&& playoffConfig.hasOwnProperty(bracketTier)
									?

									<>

										{playoffConfig[bracketTier].conferences ?

											<Grid size={{xs: 12, md: 2}}>
												<Item>
													<p>Lunar Teams (by seed)</p>

													{lunarTeams.map((team, teamIndex) =>

														<FormControl size="small" fullWidth key={`bracketTeam${teamIndex}`}>
															<InputLabel id={`bracketTeam${teamIndex}Label`} shrink>Team {teamIndex + 1}</InputLabel>
															<Select
																notched
																labelId={`bracketTeam${teamIndex}Label`}
																id={`bracketTeam${teamIndex}`}
																value={team}
																required
																label={`Team ${teamIndex + 1}`}
																onChange={(e) => changeLunarTeamField(teamIndex, e.target.value)}
																className={!team.hasOwnProperty("name") ? "errorField" : ""}
															>
																{teamLists[leagueId][bracketTier]
																	.sort((a,b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0)
																	.map(team => (
																		<MenuItem key={team.id} value={team}>{team.name}</MenuItem>
																))}
															</Select>
														</FormControl>

													)}

												</Item>
											</Grid>

										: null}


										<Grid size={{xs: 12, md: 2}}>
											<Item>

												{playoffConfig[bracketTier].conferences ?
													<p>Solar Teams (by seed)</p>
												:
													<p>Playoff Teams (by seed)</p>
												}

												{ solarTeams.map((team, teamIndex) =>

														<FormControl size="small" fullWidth key={`bracketTeam${teamIndex}`}>
															<InputLabel id={`bracketTeam${teamIndex}Label`} shrink>Team {teamIndex + 1}</InputLabel>
															<Select
																notched
																labelId={`bracketTeam${teamIndex}Label`}
																id={`bracketTeam${teamIndex}`}
																value={team}
																required
																label={`Team ${teamIndex + 1}`}
																onChange={(e) => changeSolarTeamField(teamIndex, e.target.value)}
																className={!team.hasOwnProperty("name") ? "errorField" : ""}
															>
																{teamLists[leagueId][bracketTier]
																	.sort((a,b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0)
																	.map(team => (
																		<MenuItem key={team.id} value={team}>{team.name}</MenuItem>
																))}
															</Select>
														</FormControl>

												)}

											</Item>
										</Grid>

									<Grid size={{xs: 12, md: 4}} container>

											<>

												{rd2Teams.length ?

													<Grid size={{xs: 12, md: 4}}>
														<Item>

															<p>Rd 2</p>

															{rd2Teams.map((team, teamIndex) =>

																<FormControl size="small" fullWidth key={`bracketTeam${teamIndex}`}>
																	<InputLabel id={`bracketTeam${teamIndex}Label`} shrink>Team {teamIndex + 1}</InputLabel>
																	<Select
																		notched
																		labelId={`bracketTeam${teamIndex}Label`}
																		id={`bracketTeam${teamIndex}`}
																		value={team}
																		required
																		label={`Team ${teamIndex + 1}`}
																		onChange={(e) => changeRd2TeamField(teamIndex, e.target.value)}
																	>
																		{teamLists[leagueId][bracketTier]
																			.sort((a,b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0)
																			.map(team => (
																				<MenuItem key={team.id} value={team}>{team.name}</MenuItem>
																		))}
																	</Select>
																</FormControl>

															)}
														</Item>
													</Grid>

												: null}

												{semiTeams.length ?

													<Grid size={{xs: 12, md: 4}}>
														<Item>

															<p>Semis</p>

															{semiTeams.map((team, teamIndex) =>

																<FormControl size="small" fullWidth key={`bracketTeam${teamIndex}`}>
																	<InputLabel id={`bracketTeam${teamIndex}Label`} shrink>Team {teamIndex + 1}</InputLabel>
																	<Select
																		notched
																		labelId={`bracketTeam${teamIndex}Label`}
																		id={`bracketTeam${teamIndex}`}
																		value={team}
																		required
																		label={`Team ${teamIndex + 1}`}
																		onChange={(e) => changeSemiTeamField(teamIndex, e.target.value)}
																	>
																		{teamLists[leagueId][bracketTier]
																			.sort((a,b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0)
																			.map(team => (
																				<MenuItem key={team.id} value={team}>{team.name}</MenuItem>
																		))}
																	</Select>
																</FormControl>

															)}

														</Item>
													</Grid>

												: null}

												{finalTeams.length ?

													<Grid size={{xs: 12, md: 4}}>
														<Item>

															<p>Final</p>

															{finalTeams.map((team, teamIndex) =>

																<FormControl size="small" fullWidth key={`bracketTeam${teamIndex}`}>
																	<InputLabel id={`bracketTeam${teamIndex}Label`} shrink>Team {teamIndex + 1}</InputLabel>
																	<Select
																		notched
																		labelId={`bracketTeam${teamIndex}Label`}
																		id={`bracketTeam${teamIndex}`}
																		value={team}
																		required
																		label={`Team ${teamIndex + 1}`}
																		onChange={(e) => changeFinalTeamField(teamIndex, e.target.value)}
																	>
																		{teamLists[leagueId][bracketTier]
																			.sort((a,b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0)
																			.map(team => (
																				<MenuItem key={team.id} value={team}>{team.name}</MenuItem>
																		))}
																	</Select>
																</FormControl>

															)}
														</Item>
													</Grid>

												: null}


											</>


									</Grid>

								</>


							: null}

						</Grid>

					</Container>
				</ThemeProvider>

			</div>

			{generatorData.ready ?

				<>

					<div className="sources">

						{imageSizes.map((img, index) =>

							generatorData.imageType === "regular" || generatorData.imageType === "finals" ?

								<StreamSchedule key={index}
									gameData={generatorData}
									imageData={img}
								/>

							:

								<PlayoffBracket key={index}
									bracketData={generatorData}
									imageData={img}
								/>

						)}

					</div>

					<div className="output">

						{generatedImages.map((img, index) => (
							<div key={index} className="generatedImage">
								<div className="label">{img.label} ({img.width} x {img.height})</div>
								<img src={URL.createObjectURL(b64toBlob(img.url))} />
							</div>
						))}

					</div>

				</>

			: null}


		</div>
	);
};

export default ImageGenerator;
