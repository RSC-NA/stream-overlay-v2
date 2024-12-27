import React, { Fragment } from "react";

import Header from "@/components/Header";
import SeriesInfo from "@/components/SeriesInfo";

import displayDecimal from "@/utils/displayDecimal";
import imageLocation from "@/utils/imageLocation";

const longTeamName = 16;
const longFranchiseName = 25;

const statList = [
    {
        name: "gp",
        label: "Games",
		round: 0,
    },
    {
        name: "goals",
        label: "Goals",
		round: 0,
    },
    {
        name: "shots",
        label: "Shots",
		round: 0,
    },
    {
        name: "shotPct",
        label: "Shot %",
		round: 2,
    },
    {
        name: "assists",
        label: "Assists",
		round: 0,
    },
    {
        name: "saves",
        label: "Saves",
		round: 0,
	},
];

const PlayerStats = (props) => {

	const teamName = (teamnum) => props.config.teams[teamnum].name ? props.config.teams[teamnum].name : props.gameData.teams[teamnum].name;

	return (
		<div className={`playerStats team${props.team}`}>

			<div className="playerStatsHeader">

				<div className="leagueLogo">
					{props.config.general.brandLogo ?
						<img src={imageLocation(props.config.general.brandLogo, "images/logos")}></img>
					: null}
				</div>
				<div className="playerStatsTitle">Player Stats</div>

				<Header
					headers={props.config.general.headers}
					streamType={props.config.general.streamType}
					season={props.config.general.headers[0] === "%%RSCHEADER%%" ? props.config.general.season : null}
					matchday={props.config.general.headers[0] === "%%RSCHEADER%%" ? props.config.general.matchday : null}
					tier={props.config.general.headers[0] === "%%RSCHEADER%%" ? props.config.general.tier : null}
				/>

				{(props.config.series.show && props.config.general.headers[0] !== "%%RSCHEADER%%" && props.config.series.type !== "unlimited") || props.config.series.override ? (
					<SeriesInfo seriesScore={props.seriesScore} seriesGame={props.seriesGame} seriesConfig={props.config.series} pregame={true} />
				) : null}

			</div>

			<table className="playerStatsTable">
				<thead>
					<tr>
						<th className={`teamName team${props.team}`} colSpan={statList.length + 1}>
							<div className="logo">
								<img src={imageLocation(props.config.teams[props.team].logo, "images/logos/teams")}></img>
							</div>
							<div className="teamText">
								<div className={`name ${teamName(props.team).length >= longTeamName ? "long" : ""}`}>{teamName(props.team)}</div>

								{props.config.teams[props.team].franchise ?
									<div className={`franchise ${props.config.teams[props.team].franchise.length >= longFranchiseName ? "long" : ""}`}>{props.config.teams[props.team].franchise}</div>
								: null}
							</div>
						</th>
					</tr>

					<tr>
						<th scope="col" className="statHeader playerName"></th>
						{statList.map((stat, statIndex) => (
							<th scope="col" className={`statHeader ${stat.name==="shotPct" ? "pct" : ""}`} key={statIndex}>{stat.label}</th>
						))}
					</tr>

				</thead>

				<tbody>

					{props.pregameStats.playerStats[props.team].sort((a, b) => a.playerName > b.playerName ? 1 : a.playerName < b.playerName ? -1 : 0)
						.map((player, playerIndex) => (
							<tr key={playerIndex} className={`team${props.team}`}>
								<th scope="row" className="playerName">{player.playerName}</th>

								{statList.map((stat, statIndex) => (
									<td scope="col" className={stat.name==="shotPct" ? "pct" : ""} key={statIndex}>
										{player[stat.name]}
										{stat.name==="shotPct" ?
											<span className="pctSymbol">%</span>
										: null}
									</td>
								))}

							</tr>
					))}


				</tbody>

			</table>

		</div>
	)

}

export default PlayerStats;
