import React, { Fragment } from "react";

import Ball from "@/components/Ball";
import Clock from "@/components/Clock";
import SeriesInfo from "@/components/SeriesInfo";
import Header from "@/components/Header";
import Replay from "@/components/Replay";
import TeamLogo from "@/components/TeamLogo";
import TeamName from "@/components/TeamName";
import TeamPlayerBoxes from "@/components/TeamPlayerBoxes";
import TeamScore from "@/components/TeamScore";
import TeamSeriesScore from "@/components/TeamSeriesScore";
import Watching from "@/components/Watching";

import imageLocation from "@/utils/imageLocation";

const longTeamScore = 100;

const Live = (props) => {

    const longScores = props.hasOwnProperty("gameData")
        && props.gameData.hasOwnProperty("teams")
        && props.gameData.teams.length > 0
        && (props.gameData.teams[0].score >= longTeamScore
            || props.gameData.teams[1].score >= longTeamScore)
        ? true : false;

	return (
		<div className={`livePlay ${props.gameData.isOT ? "overtime" : ""}`}>

			<div className="scoreboard">

				{/* TODO: Add to RSC3-event when S22 approaches */}
				<Header
					headers={props.config.general.streamType === "RSC3-regular" || props.config.general.streamType === "RSC3-final" ?
						[...props.config.general.headers, "%%RSCHEADER%%"]
						: props.config.general.headers
					}
					streamType={props.config.general.streamType}
					season={props.config.general.streamType === "RSC3-regular" || props.config.general.streamType === "RSC3-final" ? props.config.general.season : null}
					matchday={props.config.general.streamType === "RSC3-regular" || props.config.general.streamType === "RSC3-final" ? props.config.general.matchday : null}
					tier={props.config.general.streamType === "RSC3-regular" || props.config.general.streamType === "RSC3-final" ? props.config.general.tier : null}
				/>

				<Clock time={props.gameData.time_seconds} overtime={props.gameData.isOT} />

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

			{props.config.general.show.players ? (
				<Fragment>
					<TeamPlayerBoxes
						players={Object.values(props.playerData).filter(player => player.team === 0)}
						team={0}
						showStats={props.config.general.show.playerStats}
						playerEvents={props.playerEvents}
						watching={!props.gameData.isReplay && props.gameData.target && props.playerData.hasOwnProperty(props.gameData.target) ? props.gameData.target : null}
					/>
					<TeamPlayerBoxes
						players={Object.values(props.playerData).filter(player => player.team === 1)}
						team={1}
						showStats={props.config.general.show.playerStats}
						playerEvents={props.playerEvents}
						watching={!props.gameData.isReplay && props.gameData.target && props.playerData.hasOwnProperty(props.gameData.target) ? props.gameData.target : null}
					/>
				</Fragment>
			) : null }

			{props.config.general.hasOwnProperty("brandLogo") && props.config.general.brandLogo ?
				<div className="watermark">
					<img src={imageLocation(props.config.general.brandLogo, "images/logos")}></img>
				</div>
			: null }

            {!props.gameData.isReplay && props.gameData.target && props.playerData.hasOwnProperty(props.gameData.target) ? (
                <Watching
					player={props.playerData[props.gameData.target]}
					config={props.config}
				/>
            ) : null}

            {!props.gameData.isReplay && props.clockRunning && props.config.general.show.ball ? (
                <Ball ball={props.gameData.ball} />
            ) : null}

            <Replay
                lastGoal={props.lastGoal}
                show={props.gameData.isReplay && !props.gameData.hasWinner && props.lastGoal.hasOwnProperty("scorer") && props.lastGoal.scorer.hasOwnProperty("teamnum")}
            />

		</div>
	)

}

export default Live;
