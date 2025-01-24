import React, { Fragment } from "react";

import Header from "@/components/Header";
import SeriesInfo from "@/components/SeriesInfo";

import PlayerStatsTable from "@/components/PlayerStatsTable";

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
    {
        name: "demos",
        label: "Demos",
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

			</div>

			<PlayerStatsTable
				config={props.config}
				pregameStats={props.pregameStats}
				statList={statList}
				showLogos={true}
				team={props.team}
			></PlayerStatsTable>

		</div>
	)

}

export default PlayerStats;
