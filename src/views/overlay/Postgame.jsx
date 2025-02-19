import React, { Fragment, useEffect, useState } from "react";
import { ReactSVG } from "react-svg";

import SeriesInfo from "@/components/SeriesInfo";
import Header from "@/components/Header";
import TeamLogo from "@/components/TeamLogo";
import TeamName from "@/components/TeamName";
import TeamScore from "@/components/TeamScore";
import TeamSeriesScore from "@/components/TeamSeriesScore";

import imageLocation from "@/utils/imageLocation";

const longPlayerName = 14;
const longTeamScore = 100;

const Postgame = (props) => {

	const statList = [
		{
			name: "score",
			label: "Score",
		},
		{
			name: "goals",
			label: "Goals",
		},
		{
			name: "assists",
			label: "Assists",
		},
		{
			name: "saves",
			label: "Saves",
		},
		{
			name: "shots",
			label: props.gameMode === "dropshot" ? "Damage" : "Shots",
		},
		{
			name: "demos",
			label: "Demos",
		},
		{
			name: "touches",
			label: "Touches",
		},
	];

    let longScores = false;
    if (props.hasOwnProperty("gameData") && props.gameData.hasOwnProperty("teams") && props.gameData.teams.length > 0) {
        longScores = props.gameData.teams[0].score >= longTeamScore || props.gameData.teams[1].score >= longTeamScore;
    }

    const winningTeam = props.gameData.teams[0].score > props.gameData.teams[1].score ? 0 : 1;

    const getSortedTeamPlayers = (team) => Object.values(props.players)
        .filter(p => p.team === team)
        .sort((a, b) => parseInt(a.score) < parseInt(b.score) ? 1 : parseInt(a.score) > parseInt(b.score) ? -1 : 1)
    const teams = [];

    for (let t = 0; t <= 1; t++) {
        teams[t] = getSortedTeamPlayers(t);
    }

	return (
		<div className="postgame">

			<div className="scoreboard">

				<Header
					headers={props.config.general.headers}
					streamType={props.config.general.streamType}
					season={props.config.general.headers[0] === "%%RSCHEADER%%" ? props.config.general.season : null}
					matchday={props.config.general.headers[0] === "%%RSCHEADER%%" ? props.config.general.matchday : null}
					tier={props.config.general.headers[0] === "%%RSCHEADER%%" ? props.config.general.tier : null}
				/>

				<div className="clock"><div className="time long">FINAL</div></div>

				{props.config.series.show || props.config.series.override ? (
					<SeriesInfo seriesScore={props.seriesScore} seriesGame={props.seriesGame} seriesConfig={props.config.series} />
				) : null}

				{props.gameData.teams.map((team, teamnum) => (
					<Fragment key={teamnum}>

						<TeamName name={props.config.teams[teamnum].name ? props.config.teams[teamnum].name : team.name} team={teamnum} franchiseName={props.config.teams[teamnum].franchise} />

						{props.config.teams[teamnum].hasOwnProperty("logo") && props.config.teams[teamnum].logo ? (
							<TeamLogo team={teamnum} logo={props.config.teams[teamnum].logo} />
						) : null}

						<TeamScore score={team.score} team={teamnum} long={longScores} />

						{props.config.series.show ? (
							<TeamSeriesScore score={props.seriesScore[teamnum]} seriesConfig={props.config.series} team={teamnum} />
						) : null}

					</Fragment>
				))}

			</div>

			{props.config.general.hasOwnProperty("brandLogo") && props.config.general.brandLogo ?

				<div className="branding">
					<div className="brandLogo">
						<img src={imageLocation(props.config.general.brandLogo, "images/logos")}></img>
					</div>
					<div className="brandLogo">
						<img src={imageLocation(props.config.general.brandLogo, "images/logos")}></img>
					</div>
				</div>

			: null }

			<div className="seriesScoreText">
				{
					props.seriesScore[0] > props.seriesScore[1] ?
						`${props.config.teams[0].name} ${
							(props.config.series.type === "bestof" && props.seriesScore[0] === Math.ceil(props.config.series.maxGames / 2)
								|| (props.config.series.type === "set" && props.seriesScore[0] + props.seriesScore[1] === props.config.series.maxGames)
							) ?
								"win"
							: "lead"
						} series ${props.seriesScore[0]}-${props.seriesScore[1]}`
					: props.seriesScore[1] > props.seriesScore[0] ?
						`${props.config.teams[1].name} ${
							(props.config.series.type === "bestof" && props.seriesScore[1] === Math.ceil(props.config.series.maxGames / 2)
								|| (props.config.series.type === "set" && props.seriesScore[0] + props.seriesScore[1] === props.config.series.maxGames)
							) ?
								"win"
							: "lead"
						} series ${props.seriesScore[1]}-${props.seriesScore[0]}`
					: `Series tied ${props.seriesScore[0]}-${props.seriesScore[1]}`
				}
			</div>


            <div className="title">Game Stats</div>

            <table className="statTable">
                <thead>
                    <tr>
                        {teams[0].map((player, playerIndex) => (
                            <th className={`playerName team0 ${player.name.length > longPlayerName ? "long" : ""}`} key={`team0player${playerIndex}`}>
                                {winningTeam === 0 && playerIndex === 0 ? (
									<ReactSVG className="mvpIcon" src="/images/eventIcons/mvp.svg" />
                                ) : null}
								<span>{player.name}</span>
                            </th>
                        ))}
                        <th className="centerColumn"></th>
                        {teams[1].map((player, playerIndex) => (
                            <th className={`playerName team1 ${player.name.length > longPlayerName ? "long" : ""}`} key={`team1player${playerIndex}`}>
                                {winningTeam === 1 && playerIndex === 0 ? (
									<ReactSVG className="mvpIcon" src="/images/eventIcons/mvp.svg" />
                                ) : null}
								<span>{player.name}</span>
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {statList.map((stat, statIndex) => (
                        <tr key={`stat${statIndex}`}>
                            {teams[0].map((player, playerIndex) => (
                                <td className={`team0 ${winningTeam === 0 && playerIndex === 0 ? "mvp" : ""}`} key={`team0player${playerIndex}stat${statIndex}`}>
                                    {player[stat.name]}
                                </td>
                            ))}
                            <th scope="row" className="centerColumn"><span>{stat.label}</span></th>
                            {teams[1].map((player, playerIndex) => (
                                <td className={`team1 ${winningTeam === 1 && playerIndex === 1 ? "mvp" : ""}`} key={`team1player${playerIndex}stat${statIndex}`}>
                                    {player[stat.name]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

		</div>

	)

}

export default Postgame;
