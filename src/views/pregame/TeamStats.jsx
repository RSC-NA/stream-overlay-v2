import React, { Fragment } from "react";

import Header from "@/components/Header";
import SeriesInfo from "@/components/SeriesInfo";

import displayDecimal from "@/utils/displayDecimal";
import imageLocation from "@/utils/imageLocation";

const longTeamName = 16;
const longFranchiseName = 25;

const statList = [
    {
        name: "%%RECORD%%",
        label: "Record",
    },
    {
        name: "goals",
        label: "Goals For",
		round: 0,
		best: "higher",
    },
    {
        name: "shots",
        label: "Shots",
		round: 0,
		best: "higher",
    },
    {
        name: "shotPct",
        label: "Shot Pct",
		round: 2,
		best: "higher",
    },
    {
        name: "assists",
        label: "Assists",
		round: 0,
		best: "higher",
    },
    {
        name: "oppGoals",
        label: "Goals Vs",
		round: 0,
		best: "lower",
    },
    {
        name: "saves",
        label: "Saves",
		round: 0,
		best: "higher",
	},
];

const TeamStats = (props) => {

	const teamName = (teamnum) => props.config.teams[teamnum].name ? props.config.teams[teamnum].name : props.gameData.teams[teamnum].name;

	return (
		<div className={`teamStats ${(props.config.series.show && props.config.series.type !== "unlimited") || props.config.series.override ? "hasSeriesInfo" : ""}`}>

			<div className="teamStatsHeader">

				<div className="leagueLogo">
					{props.config.general.brandLogo ?
						<img src={imageLocation(props.config.general.brandLogo, "images/logos")}></img>
					: null}
				</div>
				<div className="teamStatsTitle">Team Comparison</div>

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

			<table className="teamStatsTable">
				<thead>
					<tr>
						<th className="teamName team0" colSpan={2}>
							<div className="logo">
								<img src={imageLocation(props.config.teams[0].logo, "images/logos/teams")}></img>
							</div>
							<div className="teamText">
								<div className={`name ${teamName(0).length >= longTeamName ? "long" : ""}`}>{teamName(0)}</div>

								{props.config.teams[0].franchise ?
									<div className={`franchise ${props.config.teams[0].franchise.length >= longFranchiseName ? "long" : ""}`}>{props.config.teams[0].franchise}</div>
								: null}
							</div>
						</th>

						<td className="centerColumn"></td>

						<th className="teamName team1" colSpan={2}>
							<div className="logo">
								<img src={imageLocation(props.config.teams[1].logo, "images/logos/teams")}></img>
							</div>
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
					{statList.map((stat, statIndex) => (
						<tr key={`stat${statIndex}`}>
							{stat.name == "%%RECORD%%" ?
								<td key={`team0${statIndex}`} className={`team0 ${props.pregameStats.teamStats[0].wins >= props.pregameStats.teamStats[1].wins ? "better" : ""}`}>
									{`${props.pregameStats.teamStats[0].wins}-${props.pregameStats.teamStats[0].loss}`}
								</td>
								:
								<td key={`team0${statIndex}`}
									className={`team0
										${stat.best === "higher" && props.pregameStats.teamStats[0][stat.name] >= props.pregameStats.teamStats[1][stat.name]
											? "better"
										: stat.best === "lower" && props.pregameStats.teamStats[0][stat.name] <= props.pregameStats.teamStats[1][stat.name]
											? "better"
											: ""}`}
								>
									{displayDecimal(props.pregameStats.teamStats[0][stat.name], stat.round)}
									{stat.name==="shotPct" ?
										<span className="pctSymbol">%</span>
									: null}
								</td>
							}
							<th scope="row" className="centerColumn"  colSpan={2}><span>{stat.label}</span></th>
							{stat.name == "%%RECORD%%" ?
								<td className={`team1 ${props.pregameStats.teamStats[0].wins <= props.pregameStats.teamStats[1].wins ? "better" : ""}`} key={`team1${statIndex}`}>
									{`${props.pregameStats.teamStats[1].wins}-${props.pregameStats.teamStats[1].loss}`}
								</td>
								:
								<td key={`team1${statIndex}`}
									className={`team1
										${stat.best === "higher" && props.pregameStats.teamStats[1][stat.name] >= props.pregameStats.teamStats[0][stat.name]
											? "better"
										: stat.best === "lower" && props.pregameStats.teamStats[1][stat.name] <= props.pregameStats.teamStats[0][stat.name]
											? "better"
											: ""}`}
								>
									{displayDecimal(props.pregameStats.teamStats[1][stat.name], stat.round)}
									{stat.name==="shotPct" ?
										<span className="pctSymbol">%</span>
									: null}
								</td>
							}
						</tr>
					))}
				</tbody>

			</table>

		</div>
	)

}

export default TeamStats;
