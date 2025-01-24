import React from "react";

import displayDecimal from "@/utils/displayDecimal";
import imageLocation from "@/utils/imageLocation";

const longTeamName = 16;
const longFranchiseName = 25;

const TeamStatsTable = (props) => {

	const teamName = (teamnum) => props.config.teams[teamnum].name ? props.config.teams[teamnum].name : props.gameData.teams[teamnum].name;

	return (
		<table className="teamStatsTable">
			<thead>
				<tr>
					<th className="teamName team0" colSpan={2} style={props.teamColors ? {backgroundColor: `#${props.teamColors[0]}`} : null}>
						{props.showLogos ?
							<div className="logo">
								<img src={imageLocation(props.config.teams[0].logo, "images/logos/teams")}></img>
							</div>
						: null}
						<div className="teamText">
							<div className={`name ${teamName(0).length >= longTeamName ? "long" : ""}`}>{teamName(0)}</div>

							{props.config.teams[0].franchise ?
								<div className={`franchise ${props.config.teams[0].franchise.length >= longFranchiseName ? "long" : ""}`}>{props.config.teams[0].franchise}</div>
							: null}
						</div>
					</th>

					<td className="centerColumn"></td>

					<th className="teamName team1" colSpan={2} style={props.teamColors ? {backgroundColor: `#${props.teamColors[1]}`} : null}>
						{props.showLogos ?
							<div className="logo">
								<img src={imageLocation(props.config.teams[1].logo, "images/logos/teams")}></img>
							</div>
						: null}
						<div className="teamText">
							<div className={`name ${teamName(1).length >= longTeamName ? "long" : ""}`}>{teamName(1)}</div>

							{props.config.teams[1].franchise ?
								<div className={`franchise ${props.config.teams[1].franchise.length >= longFranchiseName ? "long" : ""}`}>{props.config.teams[1].franchise}</div>
							: null}
						</div>
					</th>
				</tr>
			</thead>

			<tbody>
				{props.statList.map((stat, statIndex) => (
					<tr key={`stat${statIndex}`}>
						{stat.name == "%%RECORD%%" ?
							props.pregameStats.teamStats[0] && props.pregameStats.teamStats[0].hasOwnProperty("wins") && props.pregameStats.teamStats[0].hasOwnProperty("loss") ?
								<td key={`team0${statIndex}`} className={`team0 ${props.pregameStats.teamStats[1] && props.pregameStats.teamStats[1].hasOwnProperty("wins") && props.pregameStats.teamStats[0].wins >= props.pregameStats.teamStats[1].wins ? "better" : ""}`}>
									{`${props.pregameStats.teamStats[0].wins}-${props.pregameStats.teamStats[0].loss}`}
								</td>
							:
								<td key={`team0${statIndex}na`} className={`team0`}>
									n/a
								</td>
						:
							props.pregameStats.teamStats[0] && props.pregameStats.teamStats[0].hasOwnProperty(stat.name) ?
								<td key={`team0${statIndex}`}
									className={`team0
										${props.pregameStats.teamStats[1] && props.pregameStats.teamStats[1].hasOwnProperty(stat.name) ?
											stat.best === "higher" && props.pregameStats.teamStats[0][stat.name] >= props.pregameStats.teamStats[1][stat.name]
											? "better"
											: stat.best === "lower" && props.pregameStats.teamStats[0][stat.name] <= props.pregameStats.teamStats[1][stat.name]
												? "better"
											: ""
										: ""}`}
								>
									{displayDecimal(props.pregameStats.teamStats[0][stat.name], stat.round)}
									{stat.name==="shotPct" ?
										<span className="pctSymbol">%</span>
									: null}
								</td>
							:
								<td key={`team0${statIndex}na`} className={`team0`}>
									n/a
								</td>
						}
						<th scope="row" className="centerColumn"  colSpan={2}><span>{stat.label}</span></th>
						{stat.name == "%%RECORD%%" ?
							props.pregameStats.teamStats[1] && props.pregameStats.teamStats[1].hasOwnProperty("wins") && props.pregameStats.teamStats[1].hasOwnProperty("loss") ?
							<td className={`team1 ${props.pregameStats.teamStats[0] && props.pregameStats.teamStats[0].wins <= props.pregameStats.teamStats[1].wins ? "better" : ""}`} key={`team1${statIndex}`}>
								{`${props.pregameStats.teamStats[1].wins}-${props.pregameStats.teamStats[1].loss}`}
							</td>
							:
							<td key={`team1${statIndex}`} className={`team1`}>
								n/a
							</td>
						:
							props.pregameStats.teamStats[1] && props.pregameStats.teamStats[1].hasOwnProperty(stat.name) ?
								<td key={`team1${statIndex}na`}
									className={`team1
										${props.pregameStats.teamStats[0] && props.pregameStats.teamStats[0].hasOwnProperty(stat.name) ?
											stat.best === "higher" && props.pregameStats.teamStats[1][stat.name] >= props.pregameStats.teamStats[0][stat.name]
											? "better"
											: stat.best === "lower" && props.pregameStats.teamStats[1][stat.name] <= props.pregameStats.teamStats[0][stat.name]
												? "better"
											: ""
										: ""}`}
								>
									{displayDecimal(props.pregameStats.teamStats[1][stat.name], stat.round)}
									{stat.name==="shotPct" ?
										<span className="pctSymbol">%</span>
									: null}
								</td>
							:
								<td key={`team1${statIndex}na`} className={`team1`}>
									n/a
								</td>
						}
					</tr>
				))}
			</tbody>

		</table>

	)

}

export default TeamStatsTable;
