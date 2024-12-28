import React, { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useWebSocket from "react-use-websocket";

import LiveStats from "@/views/statboard/LiveStats";
import PlayerStats from "@/views/statboard/PlayerStats";

import TeamStats from "@/views/statboard/TeamStats";

import Button from "@mui/material/Button";

import "@/style/statboard.scss";

const teamColorsDefault = ["206cff", "f88521"];

// const expireEventsInMs = 7000;
const socketServerUrl = "wss://rlws.kdoughboy.com:8321";
// const socketServerUrl = "ws://localhost:8321";

const Statboard = () => {

	const params = useParams();

	const [config, setConfig] = useState({});
	const [clockRunning, setClockRunning] = useState(false);
	const [dataReceived, setDataReceived] = useState(false);
	const [gameData, setGameData] = useState({
		teams: [],
		time_seconds: 0,
	});
	const [playerData, setPlayerData] = useState({});
	const [playerEvents, setPlayerEvents] = useState([]);
	const [pregameStats, setPregameStats] = useState([]);
	const [seriesScore, setSeriesScore] = useState([0,0]);

	const [statboardView, setStatboardView] = useState("team");

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

	const subscribeToServerFeed = () => {
		sendJsonMessageServer({
			clientId: params.clientId,
			event: "register",
			data: "overlay:game_data"
		});

	}

	const handleServerData = d => {
		// console.log(d);
		let data, dataParse = {};
		let event = "";

		try {
			dataParse = JSON.parse(d)
			if (!dataParse.hasOwnProperty("clientId") || !dataParse.hasOwnProperty("event") || !dataParse.hasOwnProperty("data") || dataParse.clientId !== params.clientId) {
				console.log("error");
				return;
			}
			event = dataParse.event;
			data = dataParse.data;
			// console.log(event, data);

		} catch(e) {
			console.error(e);
			return;
		}

		switch(event) {

			case("overlay:game_data"):
				if (data.hasOwnProperty("clockRunning")) {
					setClockRunning(data.clockRunning);
				}
				if (data.hasOwnProperty("config")) {
					setConfig(data.config);
					setDataReceived(true);
				}
				if (data.hasOwnProperty("gameData")) {
					setGameData(data.gameData);
				}
				if (data.hasOwnProperty("playerData")) {
					setPlayerData(data.playerData);
				}
				// TODO: Not currently used
				if (data.hasOwnProperty("playerEvents")) {
					setPlayerEvents(data.playerEvents);
				}
				if (data.hasOwnProperty("pregameStats")) {
					setPregameStats(data.pregameStats);
				}
				if (data.hasOwnProperty("seriesScore")) {
					setSeriesScore(data.seriesScore);
				}
			break;

		}
	}

	const teamColor = (teamnum) =>
		config.teams[teamnum].color ? config.teams[teamnum].color
		: gameData.hasOwnProperty("teams")
			&& Array.isArray(gameData.teams)
			&& gameData.teams[teamnum].hasOwnProperty("color_primary")
			? gameData.teams[teamnum].color_primary
				: teamColorsDefault[teamnum];

	return (
		<div id="Statboard">

			<div className="statboardButtons">

				<Button
					size="small"
					variant={statboardView === "live"? "contained" : "outlined"}
					color={statboardView === "live"? "primary" : ""}
					onClick={() => {setStatboardView("live")}}
				>
					Live Game Stats
				</Button>
				<Button
					size="small"
					variant={statboardView === "team"? "contained" : "outlined"}
					color={statboardView === "team"? "primary" : ""}
					onClick={() => {setStatboardView("team")}}
				>
					Season Team Stats
				</Button>
				<Button
					size="small"
					variant={statboardView === "player"? "contained" : "outlined"}
					color={statboardView === "player"? "primary" : ""}
					onClick={() => {setStatboardView("player")}}
				>
					Season Player Stats
				</Button>

			</div>

			<div className="statboardContent">

				{dataReceived ?

					statboardView === "live" ?

						<LiveStats
							config={config}
							gameData={gameData}
							playerData={playerData}
							seriesScore={seriesScore}
							teamColors={[teamColor(0), teamColor(1)]}
						/>

					: statboardView === "team" && pregameStats.hasOwnProperty("teamStats") ?

						<TeamStats
							config={config}
							gameData={gameData}
							pregameStats={pregameStats}
							teamColors={[teamColor(0), teamColor(1)]}
						/>

					: statboardView === "player" && pregameStats.hasOwnProperty("playerStats") ?

						<PlayerStats
							config={config}
							gameData={gameData}
							pregameStats={pregameStats}
							teamColors={[teamColor(0), teamColor(1)]}
						/>

					: null

				:

					<div>No data received from producer overlay</div>

				}

			</div>

		</div>
	)

}

export default Statboard;
