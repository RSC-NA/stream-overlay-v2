import React, { Fragment, useEffect, useState } from "react";

import Clock from "@/components/Clock";
import SeriesInfo from "@/components/SeriesInfo";

import hexToRgba from "@/utils/hexToRgba";

import "@/style/statboard.scss";

const LiveStats = (props) => {

	const teamStatTotal = (teamnum, stat) =>
		Object.values(props.playerStats)
			.filter(player => player.team === teamnum)
			.reduce((sum, player) => sum + Number(player[stat]), 0);

	return (
		<div className="statboardLiveStats">

			<Clock time={props.gameData.time_seconds} overtime={props.gameData.isOT} />

			{props.config.series.show || props.config.series.override ? (
				<SeriesInfo seriesScore={props.seriesScore} seriesGame={props.seriesScore[0] + props.seriesScore[1] + 1} seriesConfig={props.config.series} />
			) : null}

			<table className="statboardLiveStatsTable">
				{props.gameData.teams.map((team, teamnum) => (
					<Fragment key={teamnum}>
						<tbody>
							<tr className="teamNameHeader" style={{background: hexToRgba(props.teamColors[teamnum], 100)}}>
								<th className="teamIdentification" colSpan={8}>
									<span className="teamName">{props.config.teams[teamnum].name ? props.config.teams[teamnum].name : team.name}</span>
									{ props.config.teams[teamnum].franchise ?
										<span className="franchiseName">{props.config.teams[teamnum].franchise}</span>
									: ""}
								</th>
								<th className="teamScore" colSpan={2}>{team.score}</th>
								{ props.config.series.show ?
									<th className="seriesScore">{props.seriesScore[teamnum]}</th>
								: null}
							</tr>
							<tr className="teamHeader">
								<th>Boost</th>
								<th className="tableAlignText">Player</th>
								<th>Score</th>
								<th>Goals</th>
								<th>Assists</th>
								<th>{props.gameMode === "dropshot" ? "Damage" : "Shots"}</th>
								<th>Saves</th>
								<th>Touches</th>
								<th>Demos</th>
								<th>Bumps</th>
							</tr>
							{Object.values(props.playerStats)
								.filter(player => player.team === teamnum)
								.sort((a, b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0 )
								.map((player, playerIndex) => (
								<tr
									key={playerIndex}
									style={{
										background: hexToRgba(props.teamColors[teamnum], 30 + 20 * playerIndex
									)}}
									className={!player.inGame ? "out" : ""}
								>
                                    <td className="playerBoost">{player.inGame ? player.boost : "-"}</td>
									<td className="playerName tableAlignText">{player.name}</td>
									<td>{player.score}</td>
									<td>{player.goals}</td>
									<td>{player.assists}</td>
									<td>{player.shots}</td>
									<td>{player.saves}</td>
									<td>{player.touches}</td>
									<td>{player.demos}</td>
									<td>{player.cartouches}</td>
								</tr>
							))}
							<tr className="teamTotals">
								<td colSpan={2}>Totals</td>
								<td>
									{teamStatTotal(teamnum, "score")}
								</td>
								<td>
									{teamStatTotal(teamnum, "goals")}
								</td>
								<td>
									{teamStatTotal(teamnum, "assists")}
								</td>
								<td>
									{teamStatTotal(teamnum, "shots")}
								</td>
								<td>
									{teamStatTotal(teamnum, "saves")}
								</td>
								<td>
									{teamStatTotal(teamnum, "touches")}
								</td>
								<td>
									{teamStatTotal(teamnum, "demos")}
								</td>
								<td>
									{teamStatTotal(teamnum, "cartouches")}
								</td>
							</tr>
						</tbody>
					</Fragment>
				))}
			</table>

			{props.splash && props.splash.show ?
				<div className="splashCount">Splash Count: {props.splash.count}</div>
			: null }

		</div>
	)

}

export default LiveStats;
