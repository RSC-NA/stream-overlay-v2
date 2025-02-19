import React, { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useWebSocket from "react-use-websocket";

import LiveStats from "@/views/statboard/LiveStats";
import PlayerStats from "@/views/statboard/PlayerStats";
import TeamStats from "@/views/statboard/TeamStats";

import Header from "@/components/Header";

import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2";
import { styled } from "@mui/material/styles";

import "@/style/statboard.scss";

const socketServerUrl = "https://overlay.rscna.com/ws/"; // prod
// const socketServerUrl = "wss://rlws.kdoughboy.com:8321"; // testing on my server
// const socketServerUrl = "ws://localhost:8321"; // local testing

const Item = styled("div")(({ theme }) => ({
	background: "transparent",
	padding: theme.spacing(0),
	textAlign: "left",
	color: "#ffffff",
}));

const teamColorsDefault = ["206cff", "f88521"];

const Statboard = () => {

	const params = useParams();

	const [config, setConfig] = useState({});
	const [clockRunning, setClockRunning] = useState(false);
	const [dataReceived, setDataReceived] = useState(false);
	const [endGameData, setEndGameData] = useState({});
	const [gameData, setGameData] = useState({
		teams: [],
		time_seconds: 0,
	});
	const [gameMode, setGameMode] = useState("soccar");
	const [playerData, setPlayerData] = useState({});
	const [playerEvents, setPlayerEvents] = useState([]);
	const [pregameStats, setPregameStats] = useState([]);
	const [seriesScore, setSeriesScore] = useState([0,0]);
	const [splash, setSplash] = useState({});

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
		// console.log(d);
		let data, dataParse = {};
		let event = "";

		try {
			dataParse = JSON.parse(d)
			if (!dataParse.hasOwnProperty("clientId") || !dataParse.hasOwnProperty("event") || !dataParse.hasOwnProperty("data") || dataParse.clientId !== params.clientId) {
				console.error("Error handling server data");
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
				if (data.hasOwnProperty("endGameData")) {
					setEndGameData(data.endGameData);
				}
				if (data.hasOwnProperty("gameData")) {
					setGameData(data.gameData);
				}
				if (data.hasOwnProperty("gameMode")) {
					setGameMode(data.gameMode);
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
				if (data.hasOwnProperty("splash")) {
					setSplash(data.splash);
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

			<div className="statboardHeader">

				<Grid container>

					<Grid size={7} alignContent={"center"}>

						<Item>

							{config && config.hasOwnProperty("general") ?

								<Header
									headers={config.general.headers}
									streamType={config.general.streamType}
									season={config.general.headers[0] === "%%RSCHEADER%%" ? config.general.season : null}
									matchday={config.general.headers[0] === "%%RSCHEADER%%" ? config.general.matchday : null}
									tier={config.general.headers[0] === "%%RSCHEADER%%" ? config.general.tier : null}
								/>

							:null}

						</Item>

					</Grid>

					<Grid size={5} justifyItems={"end"}>

						<Item>

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

						</Item>

					</Grid>

				</Grid>

			</div>

			<div className="statboardContent">

				{dataReceived ?

					<>

						{statboardView === "live" ?

							<LiveStats
								config={config}
								gameData={gameData}
								gameMode={gameMode}
								playerData={endGameData.hasOwnProperty("playerData") ? endGameData.playerData : playerData}
								seriesScore={seriesScore}
								splash={splash}
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

						: null}

					</>

				:

					<div>No data received from producer overlay</div>

				}

			</div>

		</div>
	)

}

export default Statboard;
