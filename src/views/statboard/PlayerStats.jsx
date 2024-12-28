import React from "react";

import PlayerStatsTable from "@/components/PlayerStatsTable";

import "@/style/statboard.scss";

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

const TeamStats = (props) => {

	return (
		<div className="statboardPlayerStats">

			<PlayerStatsTable
				config={props.config}
				pregameStats={props.pregameStats}
				statList={statList}
				showLogos={false}
				team={0}
				teamColors={props.teamColors}
			></PlayerStatsTable>

			<PlayerStatsTable
				config={props.config}
				pregameStats={props.pregameStats}
				statList={statList}
				showLogos={false}
				team={1}
				teamColors={props.teamColors}
			></PlayerStatsTable>

		</div>
	)

}

export default TeamStats;
