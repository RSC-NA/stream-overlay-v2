import React, { Fragment, useEffect, useState } from "react";

import TeamStatsTable from "@/components/TeamStatsTable";

import "@/style/statboard.scss";

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

	return (
		<div className="statboardTeamStats">

			<TeamStatsTable
				config={props.config}
				pregameStats={props.pregameStats}
				statList={statList}
				showLogos={false}
				teamColors={props.teamColors}
			></TeamStatsTable>

		</div>
	)

}

export default TeamStats;
