import React, { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useWebSocket from "react-use-websocket";

import LiveStats from "@/views/statboard/LiveStats";

import Button from "@mui/material/Button";

import "@/style/statboard.scss";

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

	const [statboardView, setStatboardView] = useState("live");

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
		// console.log("got something from server");
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
				if (data.hasOwnProperty("playerEvents")) {
					// TODO: Not currently used
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

	return (
		<div id="Statboard">

			<div class="statboardButtons">

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
					Team Stats
				</Button>
				<Button
					size="small"
					variant={statboardView === "player"? "contained" : "outlined"}
					color={statboardView === "player"? "primary" : ""}
					onClick={() => {setStatboardView("player")}}
				>
					Player Stats
				</Button>

			</div>

			<div class="statboardContent">

				{statboardView === "live" ?

					<LiveStats
						config={config}
						dataReceived={dataReceived}
						gameData={gameData}
						playerData={playerData}
						seriesScore={seriesScore}
					/>

				: null}

			</div>

		</div>
	)

}

export default Statboard;
