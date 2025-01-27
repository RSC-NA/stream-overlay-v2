import React, { Fragment } from "react";

import Header from "@/components/Header";
import SeriesInfo from "@/components/SeriesInfo";

import imageLocation from "@/utils/imageLocation";

const longTeamName = 16;
const longFranchiseName = 25;

const Matchup = (props) => {

	const teamName = (teamnum) => props.config.teams[teamnum].name ? props.config.teams[teamnum].name : props.gameData.teams[teamnum].name;

	return (
		<div className={`matchup ${(props.config.series.show && props.config.series.type !== "unlimited") || props.config.series.override ? "hasSeriesInfo" : ""}`}>

			<div className="matchupHeader">

				{props.config.general.streamType === "RSC3-regular" || props.config.general.streamType === "RSC3-final" || props.config.general.streamType === "RSC3-event" ?
					<>
						<div className="leagueLogo">
							{props.config.general.brandLogo ?
								<img src={imageLocation(props.config.general.brandLogo, "images/logos")}></img>
							: null}
						</div>
						<div className="leagueName">Rocket Soccar Confederation</div>
					</>
				: null}

				<Header
					headers={props.config.general.headers}
					streamType={props.config.general.streamType}
					season={props.config.general.headers[0] === "%%RSCHEADER%%" ? props.config.general.season : null}
					matchday={props.config.general.headers[0] === "%%RSCHEADER%%" ? props.config.general.matchday : null}
					tier={props.config.general.headers[0] === "%%RSCHEADER%%" ? props.config.general.tier : null}
				/>

			</div>

			<div className="matchupTeams">

				{props.gameData.teams.map((team, teamnum) => (
					<Fragment key={`matchupTeam${teamnum}`}>
						<div className={`team team${teamnum} ${props.config.teams[teamnum].hasOwnProperty("logo") && props.config.teams[teamnum].logo ? "hasLogo" : ""}`}>
							{props.config.teams[teamnum].logo ? (
								<div className="logo">
									<img src={imageLocation(props.config.teams[teamnum].logo, "images/logos/teams")}></img>
								</div>
							) :
								<div className="logo"></div>
							}

							<div className="teamText">
								<div className={`name ${teamName(teamnum).length >= longTeamName ? "long" : ""}`}>{teamName(teamnum)}</div>

								{props.config.teams[teamnum].franchise ?
									<div className={`franchise ${props.config.teams[teamnum].franchise.length >= longFranchiseName ? "long" : ""}`}>{props.config.teams[teamnum].franchise}</div>
								: null}
							</div>

						</div>

						{teamnum === 0 ?

							props.config.general.streamType === "RSC3-regular" || props.config.general.streamType === "RSC3-final" || props.config.general.streamType === "RSC3-event" ?
								<div className="vs">VS</div>
							:
								<div className="matchupCenter">
									{props.config.general.brandLogo ?
										<img src={imageLocation(props.config.general.brandLogo, "images/logos")}></img>
									:
										<div className="vs">VS</div>
									}
								</div>

						: null}

					</Fragment>
				))}

			</div>

		</div>
	)

}

export default Matchup;
