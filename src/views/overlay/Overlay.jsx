import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import useWebSocket from "react-use-websocket";

import defaultConfig from "@/data/config.json";

import Interview from "@/views/overlay/Interview";
import Live from "@/views/overlay/Live";
import Postgame from "@/views/overlay/Postgame";
import Matchup from "@/views/pregame/Matchup";
import PlayerStats from "@/views/pregame/PlayerStats";
import TeamStats from "@/views/pregame/TeamStats";
import Transition from "@/views/overlay/Transition";

import hexToRgba from "@/utils/hexToRgba";
import imageLocation from "@/utils/imageLocation";
import { v4 as uuidv4 } from "uuid";

const expireEventsInMs = 7000;
const gameSocketUrl = "ws://localhost:49122";

const socketServerUrl = "https://overlay.rscna.com/ws/"; // prod
// const socketServerUrl = "ws://localhost:8321"; // local testing

const Overlay = () => {

	const transitionDefault = {
		delay: 3,
		logo: null,
		name: "stripeWipe",
		show: false,
		team: null,
		text: "",
	};

	// For testing
	/* 	const transitionDefault = {
			delay: 0,
			logo: "/images/logos/rsc-splatter-logo.png",
			name: "triangleMerge",
			show: true,
			team: null,
			text: "GOAL!",
		};
	*/
	const teamColorsDefault = ["206cff", "f88521"];

	const splashDefault = {
		show: false,
		count: 0,
	};

	const [activeConfig, _setActiveConfig] = useState(defaultConfig);
	const [clientId, _setClientId] = useState("");
	const [clockRunning, _setClockRunning] = useState(false);
    const [gameData, _setGameData] = useState({
		teams: [{name: ""}, {name: ""}],
		time_seconds: 0,
	});
	const [gameMode, _setGameMode] = useState("soccar");
	const [interview, _setInterview] = useState({});
	const [lastGoal, setLastGoal] = useState({});
    const [playerData, _setPlayerData] = useState({});
    const [playerEvents, _setPlayerEvents] = useState([]);
    const [playerStats, _setPlayerStats] = useState([]);
    const [pregameStats, _setPregameStats] = useState({});
    const [seriesScore, _setSeriesScore] = useState([0,0]);
	const [showGoalTeam, setShowGoalTeam] = useState(false);
	const [splash, _setSplash] = useState(splashDefault);
	const [teamDataSent, setTeamDataSent] = useState(false);
	const [transition, setTransition] = useState(transitionDefault);
	const [viewState, _setViewState] = useState("");

	const activeConfigRef = useRef(activeConfig);
	const setActiveConfig = (data) => {
		activeConfigRef.current = data;
		_setActiveConfig(data);
	}

    const clientIdRef = useRef(clientId);
    const setClientId = (data) => {
        clientIdRef.current = data;
        _setClientId(data);
    }

	const clockRunningRef = useRef(clockRunning);
    const setClockRunning = (data) => {
        clockRunningRef.current = data;
        _setClockRunning(data);
    }

    const gameDataRef = useRef(gameData);
    const setGameData = (data) => {
        gameDataRef.current = data;
        _setGameData(data);
    }

	const gameModeRef = useRef(gameMode);
    const setGameMode = (data) => {
        gameModeRef.current = data;
        _setGameMode(data);
    }

	const interviewRef = useRef(interview);
    const setInterview = (data) => {
        interviewRef.current = data;
        _setInterview(data);
    }

	const playerDataRef = useRef(playerData);
    const setPlayerData = (data) => {
        playerDataRef.current = data;
        _setPlayerData(data);
    }

    const playerEventsRef = useRef(playerEvents);
    const setPlayerEvents = (data) => {
        playerEventsRef.current = data;
        _setPlayerEvents(data);
    }

	const playerStatsRef = useRef(playerStats);
    const setPlayerStats = (data) => {
        playerStatsRef.current = data;
        _setPlayerStats(data);
    }

	const pregameStatsRef = useRef(pregameStats);
    const setPregameStats = (data) => {
        pregameStatsRef.current = data;
        _setPregameStats(data);
    }

	const seriesScoreRef = useRef(seriesScore);
    const setSeriesScore = (data) => {
        seriesScoreRef.current = data;
        _setSeriesScore(data);
    }

	const splashRef = useRef(splash);
    const setSplash = (data) => {
        splashRef.current = data;
        _setSplash(data);
    }

	const viewStateRef = useRef(viewState);
    const setViewState = (data) => {
        viewStateRef.current = data;
        _setViewState(data);
    }

	useEffect(() => {

		// on load, check for existing items in localstorage; if not, send default

		if (localStorage.hasOwnProperty("clientId")) {
			setClientId(localStorage.getItem("clientId"));
		} else {
			const newClientId = uuidv4();
			localStorage.setItem("clientId", newClientId);
			setClientId(newClientId);
		}

		if (localStorage.hasOwnProperty("config")) {
			setActiveConfig(JSON.parse(localStorage.getItem("config")));
		} else {
			localStorage.setItem("config", JSON.stringify(activeConfig));
		}

		if (localStorage.hasOwnProperty("interview")) {
			setInterview(JSON.parse(localStorage.getItem("interview")));
		} else {
			console.log("no");
			setInterview({
				name: "",
				team: {
					name: "",
					franchise: "",
					logo: "",
				}
			});
			localStorage.setItem("interview", JSON.stringify({
				name: "",
				team: {
					name: "",
					franchise: "",
					logo: "",
				}
			}));
		}

		if (localStorage.hasOwnProperty("pregameStats")) {
			setPregameStats(JSON.parse(localStorage.getItem("pregameStats")));
		}

		if (localStorage.hasOwnProperty("seriesScore")) {
			setSeriesScore(JSON.parse(localStorage.getItem("seriesScore")));
		} else {
			if (Array.isArray(seriesScore)) {
				localStorage.setItem("seriesScore", JSON.stringify(seriesScore));
			}
		}

		if (localStorage.hasOwnProperty("splash")) {
			setSplash(JSON.parse(localStorage.getItem("splash")));
		} else {
			localStorage.setItem("splash", JSON.stringify(splash));
		}

		if (localStorage.hasOwnProperty("viewstate")) {
			if (localStorage.getItem("viewstate") === "postgame" && Object.keys(playerStatsRef.current).length === 0) {
				applyViewState("");
			} else {
				applyViewState(localStorage.getItem("viewstate"));
			}
		} else {
			localStorage.setItem("viewstate", "");
		}

		// set interval to send data to websocket server (even before game initialized)
		const sendExternalInterval = setInterval(() => {

			// don't send logos, could be very large and the statboard doesn't use them
			const configToSend = Object.assign({}, JSON.parse(JSON.stringify(activeConfigRef.current)));
			configToSend.teams[0].logo = undefined;
			configToSend.teams[1].logo = undefined;
			configToSend.general.brandLogo = undefined;

			sendJsonMessageServer({
				clientId: clientIdRef.current,
				event: "overlay:game_data",
				data: {
					clockRunning: clockRunningRef.current,
					config: configToSend,
					gameData: gameDataRef.current,
					gameMode: gameModeRef.current,
					playerStats: playerStatsRef.current,
					playerEvents: playerEventsRef.current,
					pregameStats: pregameStatsRef.current,
					seriesScore: seriesScoreRef.current,
					splash: splashRef.current,
				}
			});

			localStorage.setItem("seriesScore", JSON.stringify(seriesScoreRef.current));

		}, 50);


		// listen for localstorage updates from control panel
		window.onstorage = (event) => {

			switch(event.key) {
				case "clientId":
					setClientId(event.newValue);
					break;

				case "config":
					if(event.newValue !== null) {
						setActiveConfig(JSON.parse(event.newValue));
					} else {
						setActiveConfig(defaultConfig);
						localStorage.setItem("config", JSON.stringify(defaultConfig));
					}
					break;

				case "interview":
					if(event.newValue !== null) {
						const newInterview = JSON.parse(event.newValue);
						if (viewStateRef.current === "interview" && newInterview.hasOwnProperty("team")) {
							triggerTransition(
								activeConfigRef.current.general.hasOwnProperty("transition") && activeConfigRef.current.general.transition ? activeConfigRef.current.general.transition : transitionDefault.name,
								"",
								newInterview.team.hasOwnProperty("logo") ?
									newInterview.team.logo
									: activeConfigRef.current.general.hasOwnProperty("brandLogo") && activeConfigRef.current.general.brandLogo ?
										imageLocation(activeConfigRef.current.general.brandLogo, "images/logos")
									: null,
								null,
								null,
								0,
							);
							setTimeout(() => {
								setInterview(newInterview);
							}, 700);
						} else {
							setInterview(JSON.parse(event.newValue));
						}
					} else {
						setInterview({});
					}
					break;

				case "pregameStats":
					if(event.newValue !== null) {
						setPregameStats(JSON.parse(event.newValue));
					} else {
						setPregameStats({});
					}
					break;

				case "seriesScore":
					if(event.newValue !== null) {
						setSeriesScore(JSON.parse(event.newValue));
					} else {
						setSeriesScore([0,0]);
						localStorage.setItem("seriesScore", JSON.stringify([0,0]));
					}
					break;

				case "splash":
					if(event.newValue !== null) {
						console
						setSplash(JSON.parse(event.newValue));
					} else {
						setSplash(splashDefault);
						localStorage.setItem("splash", JSON.stringify(splashDefault));
					}
					break;

				case "viewstate":
					switch (event.newValue) {

						case "triggerMatchup": {
							triggerTransition(
								activeConfigRef.current.general.hasOwnProperty("transition") && activeConfigRef.current.general.transition ? activeConfigRef.current.general.transition : transitionDefault.name,
								"",
								activeConfigRef.current.general.hasOwnProperty("brandLogo") && activeConfigRef.current.general.brandLogo ?
									imageLocation(activeConfigRef.current.general.brandLogo, "images/logos")
									: null,
								null,
								0,
							);
							setTimeout(() => {
								applyViewState("matchup");
							}, 750);
							break;
						}

						case "triggerTeamStats": {
							triggerTransition(
								activeConfigRef.current.general.hasOwnProperty("transition") && activeConfigRef.current.general.transition ? activeConfigRef.current.general.transition : transitionDefault.name,
								"",
								activeConfigRef.current.general.hasOwnProperty("brandLogo") && activeConfigRef.current.general.brandLogo ?
									imageLocation(activeConfigRef.current.general.brandLogo, "images/logos")
									: null,
								null,
								0,
							);
							setTimeout(() => {
								applyViewState("teamStats");
							}, 750);
							break;
						}

						case "triggerPlayerStats0": {
							triggerTransition(
								activeConfigRef.current.general.hasOwnProperty("transition") && activeConfigRef.current.general.transition ? activeConfigRef.current.general.transition : transitionDefault.name,
								"",
								activeConfigRef.current.teams[0].hasOwnProperty("logo") && activeConfigRef.current.teams[0].logo ?
									imageLocation(activeConfigRef.current.teams[0].logo, "images/logos/teams/")
									: activeConfigRef.current.general.hasOwnProperty("brandLogo") && activeConfigRef.current.general.brandLogo ?
										imageLocation(activeConfigRef.current.general.brandLogo, "images/logos")
									: null,
								0,
								0,
							);
							setTimeout(() => {
								applyViewState("playerStats0");
							}, 750);
							break;
						}

						case "triggerPlayerStats1": {
							triggerTransition(
								activeConfigRef.current.general.hasOwnProperty("transition") && activeConfigRef.current.general.transition ? activeConfigRef.current.general.transition : transitionDefault.name,
								"",
								activeConfigRef.current.teams[1].hasOwnProperty("logo") && activeConfigRef.current.teams[1].logo ?
									imageLocation(activeConfigRef.current.teams[1].logo, "images/logos/teams/")
									: activeConfigRef.current.general.hasOwnProperty("brandLogo") && activeConfigRef.current.general.brandLogo ?
										imageLocation(activeConfigRef.current.general.brandLogo, "images/logos")
									: null,
								1,
								0,
							);
							setTimeout(() => {
								applyViewState("playerStats1");
							}, 750);
							break;
						}

						case "triggerLive": {
							triggerTransition(
								activeConfigRef.current.general.hasOwnProperty("transition") && activeConfigRef.current.general.transition ? activeConfigRef.current.general.transition : transitionDefault.name,
								"",
								activeConfigRef.current.general.hasOwnProperty("brandLogo") && activeConfigRef.current.general.brandLogo ?
									imageLocation(activeConfigRef.current.general.brandLogo, "images/logos")
									: null,
								null,
								0,
							);
							setTimeout(() => {
								applyViewState("live");
							}, 750);
							break;
						}

						case "triggerInterview": {
							triggerTransition(
								activeConfigRef.current.general.hasOwnProperty("transition") && activeConfigRef.current.general.transition ? activeConfigRef.current.general.transition : transitionDefault.name,
								"",
								interviewRef.current.team.hasOwnProperty("logo") ?
									interviewRef.current.team.logo
									: activeConfigRef.current.general.hasOwnProperty("brandLogo") && activeConfigRef.current.general.brandLogo ?
										imageLocation(activeConfigRef.current.general.brandLogo, "images/logos")
									: null,
								null,
								null,
								0,
							);
							setTimeout(() => {
								applyViewState("interview");
							}, 750);
							break;
						}

					}

					break;

				}
		};

		return () => clearInterval(sendExternalInterval);

	}, []);

	// websocket from Rocket League / BakkesMod
	const {
		sendMessage: sendMessageGame,
		sendJsonMessage: sendJsonMessageGame,
		lastMessage: lastMessageGame,
		lastJsonMessage: lastJsonMessageGame,
		readyState: readyStateGame,
		getWebSocket: getWebSocketGame,
	} = useWebSocket(gameSocketUrl, {
		onOpen: () => {},
		onMessage: (msg) => handleGameData(msg.data),
		shouldReconnect: (closeEventGame) => true,
	});

	// my websocket server for updating stats page
	const {
		sendMessage: sendMessageServer,
		sendJsonMessage: sendJsonMessageServer,
		lastMessage: lastMessageServer,
		lastJsonMessage: lastJsonMessageServer,
		readyState: readyStateServer,
		getWebSocket: getWebSocketServer,
	} = useWebSocket(socketServerUrl, {
		onOpen: () => subscribeToServerFeed(),
		onMessage: (msg) => handleServerData(msg.data),
		shouldReconnect: (closeEvent) => true,
	});

	// handle data from BakkesMod websocket
	const handleGameData = d => {
		// console.log(d);
		let data, dataParse = {};
		let event = "";

		try {
			dataParse = JSON.parse(d)
			if (!dataParse.hasOwnProperty("data") || !dataParse.hasOwnProperty("event")) {
				return;
			}
			event = dataParse.event;
			// console.log(dataParse.event);
			data = dataParse.data;
			// console.log(event, data);
		} catch(e) {
			console.error(e);
			return;
		}

		switch(event) {
			case "game:clock_stopped":
				setClockRunning(false);
				break;

			case "game:clock_started":
				setClockRunning(true);
				break;

			case "game:initialized":
				setClockRunning(false);
				// only trigger transition if not already on game view
				if (viewStateRef.current != "" && viewStateRef.current !== "live") {
					triggerTransition(
						activeConfig.general.hasOwnProperty("transition") && activeConfig.general.transition ? activeConfig.general.transition : transitionDefault.name,
						"GO!",
						activeConfig.general.hasOwnProperty("brandLogo") && activeConfig.general.brandLogo ?
							imageLocation(activeConfig.general.brandLogo, "images/logos")
							: null,
						null,
						0,
					);
					setTimeout(() => {
						setPlayerStats({});
						applyViewState("live");
					}, 750);
				}
				break;

			case "game:goal_scored":
				setLastGoal(data);
				setShowGoalTeam(true);
				triggerTransition(
					activeConfig.general.hasOwnProperty("transition") && activeConfig.general.transition ? activeConfig.general.transition : transitionDefault.name,
					"GOAL!",
					activeConfig.teams[data.scorer.teamnum].hasOwnProperty("logo") && activeConfig.teams[data.scorer.teamnum].logo ?
						imageLocation(activeConfig.teams[data.scorer.teamnum].logo, "images/logos/teams/")
						: activeConfig.general.hasOwnProperty("brandLogo") && activeConfig.general.brandLogo ?
							imageLocation(activeConfig.general.brandLogo, "images/logos")
						: null,
					data.scorer.teamnum,
					3,
				);
				setTimeout(() => {
					setShowGoalTeam(false);
				}, 3750);
			break;

			case "game:match_ended":
				setClockRunning(false);
				const winningTeam = gameData.teams[0].score > gameData.teams[1].score ? 0 : 1;
				setTimeout(() => {
					triggerTransition(
						activeConfig.general.hasOwnProperty("transition") && activeConfig.general.transition ? activeConfig.general.transition : transitionDefault.name,
						"WINNER!",
						activeConfig.teams[winningTeam].hasOwnProperty("logo") && activeConfig.teams[winningTeam].logo ?
							imageLocation(activeConfig.teams[winningTeam].logo, "images/logos/teams/")
							: activeConfig.general.hasOwnProperty("brandLogo") && activeConfig.general.brandLogo ?
								imageLocation(activeConfig.general.brandLogo, "images/logos")
							: null,
						winningTeam,
						0,
					);
				}, 4000);
				setTimeout(() => {
					const oldSeriesScore = [...seriesScore];
					setSeriesScore([
						oldSeriesScore[0] + (winningTeam === 0 ? 1 : 0),
						oldSeriesScore[1] + (winningTeam === 1 ? 1 : 0),
					]);
					applyViewState("postgame");
				}, 4500);
			break;

			case "game:pre_countdown_begin":
				clearAllPlayerEvents();
				break;

			case "game:statfeed_event":
				if (data.hasOwnProperty("event_name") && data.hasOwnProperty("main_target")) {
					const newEvents = [];

					switch(data.event_name) {
						case "Demolish":
							clearPlayerEvents(data.secondary_target.id);
							newEvents.push({
								playerId: data.secondary_target.id,
								name: "Dead",
							});

						case "Assist":
						case "EpicSave":
						// case "Exterminator":
						case "Goal":
						case "HatTrick":
						case "Save":
						// case "Savior":
						case "Shot":
							newEvents.push({
								playerId: data.main_target.id,
								name: data.event_name,
							});

						break;

					}

					if (newEvents.length) {
						addPlayerEvent(newEvents);
					}

				}
					// console.log("STATFEED", data);
				break;

			case "game:update_state":
				if (data.hasOwnProperty("players")) {
					setPlayerData(data.players);
					if (viewStateRef.current !== "postgame" && data.hasOwnProperty("game") && data.hasGame && !data.game.hasWinner) {
						updatePlayerStats(data.players);
					}
				}
				if (data.hasOwnProperty("game")) {
					expirePlayerEvents();
					if (viewStateRef.current !== "postgame") {
						setGameData(data.game);
					}
					if (viewState !== "postgame" && data.game.time_milliseconds % 1 !== 0) {
						applyViewState("live");
					} else if (viewStateRef.current === "") {
						applyViewState("matchup");
					}
					if (data.game.arena === "ShatterShot_P") {
						setGameMode("dropshot");
					} else {
						setGameMode("soccar");
					}

					// on first load of game data, send team data to local storage for control panel to see
					if (!teamDataSent) {
						localStorage.setItem("teamData", JSON.stringify(data.game.teams));
						setTeamDataSent(true);
					}
				}
				break;

			case "game:replay_will_end":
				triggerTransition(
					activeConfig.general.hasOwnProperty("transition") && activeConfig.general.transition ? activeConfig.general.transition : transitionDefault.name,
					"",
					activeConfig.general.hasOwnProperty("brandLogo") && activeConfig.general.brandLogo ?
						imageLocation(activeConfig.general.brandLogo, "images/logos")
						: null,
					null,
					2,
				);
				break;


			case "match:created":

				break;


			default:
				// console.log(event, data);
				break;



		}

	}

	const subscribeToServerFeed = () => {}

	// player point events
	const addPlayerEvent = (newEvents) => {
		let eventArray = [...playerEvents];

		for (const newEvent of newEvents) {
			eventArray = [...eventArray.filter(ps => !(ps.playerId === newEvent.playerId && ps.name === newEvent.name)),
				{
					playerId: newEvent.playerId,
					name: newEvent.name,
					exp: Date.now() + expireEventsInMs,
				},
			]
		}
		setPlayerEvents(eventArray);
	}

	const clearAllPlayerEvents = () => {
		setPlayerEvents([]);
	}

	const clearPlayerEvents = (playerId) => {
		setPlayerEvents(playerEvents.filter(ps => ps.playerId !== playerId))
	}

	const expirePlayerEvents = () => {
		if (playerEvents.filter(ps => ps.exp <= Date.now()).length > 0) {
			setPlayerEvents(playerEvents.filter(ps => ps.exp > Date.now()));
		}
	}

	const applyViewState = (state) => {
		setViewState(state);
		localStorage.setItem("viewstate", state);
	}

	// visual transitions
	const triggerTransition = (name, text, logo, team, delay) => {
		setTransition({
			delay,
			logo,
			name,
			show: true,
			team,
			text,
		});
		setTimeout(() => {
			setTransition(transitionDefault);
		}, delay ? 4600 : 1600);
	}

	const updatePlayerStats = (stats) => {
		const currentPlayerStats = {};

		for (const [key, value] of Object.entries(playerStatsRef.current)) {
			currentPlayerStats[key] =  Object.assign({}, JSON.parse(JSON.stringify({
				...value,
				inGame: false,
			})));
		}

		for (const [key, value] of Object.entries(stats)) {
			currentPlayerStats[value.name] = {
				...value,
				inGame: true,
			};
		}

		setPlayerStats(currentPlayerStats);

	}

	return (
		activeConfig.hasOwnProperty("teams") ?

		<div
			className={`App ${activeConfig?.general?.theme || "default"}`}
			id="Overlay"
			/* TODO: There's got to be some better way to get the alpha channel values into CSS without generating them all individually here */
			style={{
				"--team0": hexToRgba(
					activeConfig.teams[0].color ? activeConfig.teams[0].color
						: gameData.hasOwnProperty("teams")
							&& Array.isArray(gameData.teams)
							&& gameData.teams[0].hasOwnProperty("color_primary")
							? gameData.teams[0].color_primary
								: teamColorsDefault[0]
				, 100),
				"--team0tone": hexToRgba(
					activeConfig.teams[0].color ? activeConfig.teams[0].color
						: gameData.hasOwnProperty("teams")
							&& Array.isArray(gameData.teams)
							&& gameData.teams[0].hasOwnProperty("color_primary")
							? gameData.teams[0].color_primary
								: teamColorsDefault[0]
				, 70),
				"--team0fade": hexToRgba(
					activeConfig.teams[0].color ? activeConfig.teams[0].color
						: gameData.hasOwnProperty("teams")
							&& Array.isArray(gameData.teams)
							&& gameData.teams[0].hasOwnProperty("color_primary")
							? gameData.teams[0].color_primary
								: teamColorsDefault[0]
				, 25),
				"--team1": hexToRgba(
					activeConfig.teams[1].color ? activeConfig.teams[1].color
						: gameData.hasOwnProperty("teams")
							&& Array.isArray(gameData.teams)
							&& gameData.teams[1].hasOwnProperty("color_primary")
							? gameData.teams[1].color_primary
								: teamColorsDefault[1]
				, 100),
				"--team1tone": hexToRgba(
					activeConfig.teams[1].color ? activeConfig.teams[1].color
						: gameData.hasOwnProperty("teams")
							&& Array.isArray(gameData.teams)
							&& gameData.teams[1].hasOwnProperty("color_primary")
							? gameData.teams[1].color_primary
								: teamColorsDefault[1]
				, 70),
				"--team1fade": hexToRgba(
					activeConfig.teams[1].color ? activeConfig.teams[1].color
						: gameData.hasOwnProperty("teams")
							&& Array.isArray(gameData.teams)
							&& gameData.teams[1].hasOwnProperty("color_primary")
							? gameData.teams[1].color_primary
								: teamColorsDefault[1]
				, 25),
			}}
		>

			{viewStateRef.current === "postgame" ? (
				<Postgame
					config={activeConfigRef.current}
					gameData={gameDataRef.current}
					gameMode={gameMode}
					players={playerStatsRef.current}
					seriesScore={seriesScoreRef.current}
					seriesGame={seriesScore[0] + seriesScore[1]}
				/>
			) : viewStateRef.current ==="matchup" ? (
				<Matchup
					config={activeConfigRef.current}
					gameData={gameDataRef.current}
					seriesScore={seriesScoreRef.current}
					seriesGame={seriesScore[0] + seriesScore[1] + 1}
				/>
			) : viewStateRef.current ==="teamStats" ? (
				<TeamStats
					config={activeConfigRef.current}
					gameData={gameDataRef.current}
					pregameStats={pregameStatsRef.current}
					seriesScore={seriesScoreRef.current}
					seriesGame={seriesScore[0] + seriesScore[1] + 1}
				/>
			) : viewStateRef.current ==="playerStats0" ? (
				<PlayerStats
					config={activeConfigRef.current}
					gameData={gameDataRef.current}
					pregameStats={pregameStatsRef.current}
					seriesScore={seriesScoreRef.current}
					seriesGame={seriesScore[0] + seriesScore[1] + 1}
					team={0}
				/>
			) : viewStateRef.current ==="playerStats1" ? (
				<PlayerStats
					config={activeConfigRef.current}
					gameData={gameDataRef.current}
					pregameStats={pregameStatsRef.current}
					seriesScore={seriesScoreRef.current}
					seriesGame={seriesScore[0] + seriesScore[1] + 1}
					team={1}
				/>
			) : viewStateRef.current === "interview" ? (
				<Interview
					config={activeConfig}
					name={interviewRef.current.name}
					team={interviewRef.current.team}
				/>
			) : (
				<Live
					clockRunning={clockRunning}
					config={activeConfigRef.current}
					gameData={gameDataRef.current}
					gameMode={gameMode}
					lastGoal={lastGoal}
					playerData={playerData}
					playerEvents={playerEvents}
					seriesScore={seriesScoreRef.current}
					seriesGame={seriesScore[0] + seriesScore[1] + 1}
					showGoalTeam={showGoalTeam}
					splash={splash}
				/>
			)}

			<Transition
				transition={transition}
			/>
		</div>

	: null)

}

export default Overlay;
