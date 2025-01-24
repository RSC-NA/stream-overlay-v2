import React, { Fragment } from "react";

import Header from "@/components/Header";
import SeriesInfo from "@/components/SeriesInfo";
import TeamStatsTable from "@/components/TeamStatsTable";

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

			</div>

			<TeamStatsTable
				config={props.config}
				pregameStats={props.pregameStats}
				statList={statList}
				showLogos={true}
			></TeamStatsTable>

		</div>
	)

}

export default TeamStats;
