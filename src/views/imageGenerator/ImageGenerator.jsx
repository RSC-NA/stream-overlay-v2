import React, { useEffect, useState } from "react";
import * as htmlToImage from "html-to-image";

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

import ("@/style/appMain.scss");
import ("@/style/imageGen.scss");

const teamColors = ["#206cff", "#f88521"];
const defaultTimes = {
	regular: ["10:50", "11:30"],
	finals: ["9:30", "10:30"],
}
const currentSeason = 22; // TODO: set on new season (or dynamically?)

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

// NOTE: This is iniitally just set up for RSC 3s and will need a serious rework to handle multiple leagues

const ImageGenerator = () => {

	const [franchiseLists, setFranchiseLists] = useState({});
	const [leagueId, setLeagueId] = useState(-1);
	const [tierLists, setTierLists] = useState({});
	const [teamLists, setTeamLists] = useState({});

	const [gameType, setGameType] = useState("regular"); // TODO: create finals styles
	const [season, setSeason] = useState(currentSeason); // TODO: Update default each season?
	const [matchday, setMatchday] = useState(1);
	const [gameCount, setGameCount] = useState(2);
	const [times, setTimes] = useState(["",""]);
	const [tiers, setTiers] = useState(["",""]);
	const [teams, setTeams] = useState([["",""],["",""]]);

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

	const changeTierField = (game, value) => {
		const currentTiers = [...tiers];
		currentTiers[game] = value;
		setTiers(currentTiers);
		loadTeamList(leagueId, value);

		changeTeamField(game, 0, "");
		changeTeamField(game, 1, "");
	}

	const changeTimeField = (game, value) => {
		const currentTimes = [...times];
		currentTimes[game] = value;
		setTimes(currentTimes);
	}

	const changeTeamField = (game, teamNum, value) => {
		const currentTeams = [...teams];
		const currentSameTeams = [...sameTeams];

		currentTeams[game][teamNum] = value;
		setTeams(currentTeams);

		for (let gm = 0; gm < gameCount; gm++) {
			if (currentTeams[gm][0].hasOwnProperty("name") && currentTeams[gm][1].hasOwnProperty("name")) {
				currentSameTeams[gm] = (currentTeams[gm][0].name === currentTeams[gm][1].name);
			} else {
				currentSameTeams[gm] = false;
			}
		}
		setSameTeams(currentSameTeams);

	}

	const clearFields = () => {

		setSeason(currentSeason);
		setMatchday(1);
		setGameCount(2);
		setTimes(["",""]);
		setTiers(["",""]);
		setTeams([["",""],["",""]]);

	}

	const generate = () => {
		if (!season
			|| (gameType === "regular" && !matchday)
			|| !tiers[0]
			|| !teams[0][0].hasOwnProperty("name")
			|| !teams[0][1].hasOwnProperty("name")
			|| (gameCount === 2 && (
				!tiers[1]
				|| !teams[1][0].hasOwnProperty("name")
				|| !teams[1][1].hasOwnProperty("name")
			))
		) {
			openSnackbar("Please fill all fields.")
			return;
		}

		if (teams[0][0].name === teams[0][1].name
			|| (gameCount === 2 && teams[1][0].name === teams[1][1].name)
		) {
			openSnackbar("A team can't play against themselves.")
			return;
		}

		const genData = {
			gameType,
			games: [],
			matchday,
			season,
		};

		for (let gm = 0; gm < gameCount; gm++) {

			const gameData = {
				time: times[gm] || defaultTimes[gameType][gm],
				tier: tiers[gm],
				teams: [...teams[gm]],
			}

			for (let tm = 0; tm < 2; tm++) {
				gameData.teams[tm].logo = franchiseLists[leagueId].filter((franchise) => franchise.id === teams[gm][tm].franchise.id)[0].logo
			}

			genData.games.push(gameData);

		}

		setGeneratorData(genData);
		openDialog("generating");
		setTimeout(() => {
			generateImageFiles();
		}, 2000);

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
				// var img = new Image();
				// img.className = "pants";
				// img.src = dataUrl;
				// document.getElementById("result").appendChild(img);
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
					<Container>

						<Grid size={12} container>

							<Grid size={{xs: 12, md: 4}}>
								<Item>

									<p>Options</p>

									<FormControl size="small" fullWidth>
										<InputLabel id="gameTypeLabel" shrink>Game Type</InputLabel>
										<Select
											notched
											labelId="gameTypeLabel"
											id="gameType"
											value={gameType}
											required
											label="Game Type"
											// className={""}
											onChange={(e) => setGameType(e.target.value)}
										>
											<MenuItem value="regular">Regular Season</MenuItem>
											<MenuItem value="finals">Finals</MenuItem>
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
										disabled={gameType !== "regular"}
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

									<Button onClick={generate} variant="contained">Generate</Button>
									<Button onClick={clearFields} color="error" variant="contained">Clear</Button>

								</Item>
							</Grid>

							{ Array.isArray(tierLists[leagueId]) && tierLists[leagueId].length ?

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
													onChange={(e) => changeTimeField(gameIndex, e.target.value)}
													value={times[gameIndex]}
													placeholder={defaultTimes[gameType][gameIndex]}
												/>
											</FormControl><br />

											<FormControl size="small" fullWidth>
												<InputLabel id={`tier${gameIndex}Label`} shrink>Tier</InputLabel>
												<Select
													notched
													labelId={`tier${gameIndex}Label`}
													id={`tier${gameIndex}`}
													value={tiers[gameIndex]}
													required
													label="Tier"
													onChange={(e) => changeTierField(gameIndex, e.target.value)}
													className={!tiers[gameIndex] ? "errorField" : ""}
												>
													{tierLists[leagueId]
														.sort((a,b) => Number(a.position) < Number(b.position) ? 1 : Number(a.position) > Number(b.position) ? -1 : 0)
														.map(tier => (
															<MenuItem key={tier.id} value={tier.name}>{tier.name}</MenuItem>
													))}
												</Select>
											</FormControl>

											{tiers[gameIndex] && teamLists[leagueId].hasOwnProperty(tiers[gameIndex]) ?

												Array.from({length: 2}).map((dummyTeam, teamIndex) =>

													<FormControl size="small" fullWidth key={`game${gameIndex}team${teamIndex}`}>
														<InputLabel id={`game${gameIndex}team${teamIndex}Label`} shrink>Team {teamIndex + 1}</InputLabel>
														<Select
															notched
															labelId={`game${gameIndex}team${teamIndex}Label`}
															id={`game${gameIndex}team${teamIndex}`}
															value={teams[gameIndex][teamIndex]}
															required
															label={`Team ${teamIndex + 1}`}
															onChange={(e) => changeTeamField(gameIndex, teamIndex, e.target.value)}
															className={!teams[gameIndex][teamIndex].hasOwnProperty("name") || sameTeams[gameIndex] ? "errorField" : ""}
														>
															{teamLists[leagueId][tiers[gameIndex]]
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
							: null}

						</Grid>

					</Container>
				</ThemeProvider>

			</div>

			{generatorData.hasOwnProperty("games") ?

				<>

					<div className="sources">

						{imageSizes.map((img, index) => (

							<StreamSchedule key={index}
								gameData={generatorData}
								imageData={img}
							/>

						))}

					</div>

					<div className="output">
						{generatedImages.map((img, index) => (
							<div key={index} id={img.id} className="generatedImage">
								<div className="label">{img.label} ({img.width} x {img.height})</div>
								<img src={img.url} />
							</div>
						))}

					</div>

				</>

			: null}


		</div>
	);
};

export default ImageGenerator;
