import React from "react";

import imageLocation from "@/utils/imageLocation";

const longTeamName = 16;
const longFranchiseName = 25;

const PlayerStatsTable = (props) => {

	const teamName = (teamnum) => props.config.teams[teamnum].name ? props.config.teams[teamnum].name : props.gameData.teams[teamnum].name;

	return (

		<table className="playerStatsTable">
			<thead>
				<tr>

					<th className={`teamName team${props.team}`} colSpan={props.statList.length + 1} style={props.teamColors ? {backgroundColor: `#${props.teamColors[props.team]}`} : null}>
						{props.showLogos ?
							<div className="logo">
								<img src={imageLocation(props.config.teams[props.team].logo, "images/logos/teams")}></img>
							</div>
						: null}
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
					{props.statList.map((stat, statIndex) => (
						<th scope="col" className={`statHeader ${stat.name==="shotPct" ? "pct" : ""}`} key={statIndex}>{stat.label}</th>
					))}
				</tr>

			</thead>

			<tbody>

				{props.pregameStats.playerStats[props.team].sort((a, b) => Number(a.gp) < Number(b.gp) ? 1 : Number(a.gp) > Number(b.gp) ? -1 : Number(a.goals) < Number(b.goals) ? 1 : Number(a.goals) > Number(b.goals) ? -1 : 0)
					.map((player, playerIndex) => (
						<tr key={playerIndex} className={`team${props.team}`}>
							<th scope="row" className="playerName">{player.playerName}</th>

							{props.statList.map((stat, statIndex) => (
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

	)

}

export default PlayerStatsTable;
