import React, { Fragment, useEffect, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

import Footer from "@/components/Footer";
import FranchiseName from "@/components/FranchiseName";
import Header from "@/components/Header";
import TeamLogo from "@/components/TeamLogo";
import TeamName from "@/components/TeamName";
import TeamScore from "@/components/TeamScore";
import TeamSeriesScore from "@/components/TeamSeriesScore";

import "@/style/gamestats.css";

const longPlayerName = 16;
const longTeamScore = 20;
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
        label: "Shots",
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

const GameStats = (props) => {

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
		<div id="GameStats">
            <Header message={props.config.header} />
            <Footer message={props.config.footer} />

            {props.gameData.teams.map((team, index) => (
                <Fragment key={index}>
                    <TeamName name={team.name} team={index} />
                    {props.config.show.franchise ? (
                        <FranchiseName name={props.config.teams[index].franchise} team={index} />
                    ) : null}
                    {props.config.show.teamLogos && props.config.teams[index].hasOwnProperty("logo") ? (
                        <TeamLogo team={index} logo={props.config.teams[index].logo} />
                    ) : null}
                    <TeamScore score={team.score} team={index} long={longScores} />
                    {props.config.show.seriesScore ? (
                        <TeamSeriesScore score={props.config.teams[index].seriesScore} team={index} />

                    ) : null}
                </Fragment>
            ))}

            <div className="title">Game Stats</div>

            <table className="statTable">
                <thead>
                    <tr>
                        {teams[0].map((player, playerIndex) => (
                            <th className={`playerName team0 ${player.name.length > longPlayerName ? "long" : ""}`} key={`team0player${playerIndex}`}>
                                {winningTeam === 0 && playerIndex === 0 ? (
                                    <FontAwesomeIcon className="mvpIcon" icon={faStar} />
                                ) : null}
                                {player.name}
                            </th>
                        ))}
                        <th className="separator"></th>
                        {teams[1].map((player, playerIndex) => (
                            <th className={`playerName team1 ${player.name.length > longPlayerName ? "long" : ""}`} key={`team1player${playerIndex}`}>
                                {winningTeam === 1 && playerIndex === 0 ? (
                                    <FontAwesomeIcon className="mvpIcon" icon={faStar} />
                                ) : null}
                                {player.name}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {statList.map((stat, statIndex) => (
                        <tr key={`stat${statIndex}`}>
                            {teams[0].map((player, playerIndex) => (
                                <td className={`playerName ${winningTeam === 0 && playerIndex === 0 ? "mvp" : ""}`} key={`team0player${playerIndex}stat${statIndex}`}>
                                    {player[stat.name]}
                                </td>
                            ))}
                            <th scope="row" className="separator">{stat.label}</th>
                            {teams[1].map((player, playerIndex) => (
                                <td className={`playerName ${winningTeam === 1 && playerIndex === 1 ? "mvp" : ""}`} key={`team1player${playerIndex}stat${statIndex}`}>
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

export default GameStats;
