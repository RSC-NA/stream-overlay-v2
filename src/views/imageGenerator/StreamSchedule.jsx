import React, { Fragment } from "react";

import imageLocation from "@/utils/imageLocation";

// TODO: make style for special events (handle teams without logos)

const StreamSchedule = (props) => {

	return (
		<div id={props.imageData.id} className={`generatedImage streamSchedule ${props.gameData.imageType} ${props.imageData.id}`}>

			<div className="header">

				<div className="leagueLogo">
					{props.gameData.imageType === "finals" ?
						<img src="/images/logos/rsc-s23-finals.png" />
					:
						<img src="/images/logos/rsc-splatter-logo.png" />
					}
				</div>

				<div className="leagueName">Rocket Soccar Confederation</div>

				<div className="header0 pipes">
					{props.gameData.imageType === "finals" ?
						<span className="season">Season {props.gameData.season} Tier Finals</span>
					:
						<>
							<span className="season">Season {props.gameData.season}</span>
							<span className="matchday">Matchday {props.gameData.matchday}</span>
						</>
					}
				</div>
			</div>

			<div className="scheduleHeader">Stream Schedule</div>

			<div className={`games gameCount${props.gameData.games.length}`}>
				{props.gameData.games.map((game, index) => (
					<div className="game" key={index}>
						<div className={`gameInfo tier${game.tier}`}>
							<div className="time">{game.time}</div>
							<div className="tier">{game.tier}{props.gameData.imageType === "finals" ? " Final" : ""}</div>
						</div>
						<div className="teams">
							{game.teams.map((team, index) => (
								<Fragment key={index}>
									<div className={`team team${index} hasLogo`}>
										<div className="teamText">
											<div className={`name ${team.id === "TBD" ? "tbd" : ""}`}>{team.name}</div>
											<div className="franchise">{team.franchise ? team.franchise.name : ""}</div>
										</div>
										<div className="logo">
											{team.logo ?
												<img src={imageLocation(team.logo, "images/logos/teams")}></img>
											: team.id === "TBD" ?
												<img src="/images/logos/rsc-splatter-logo.png" />
											: null}
										</div>
									</div>
									{index === 0 ?
										<div className="vs">vs</div>
									: null}
								</Fragment>
							))}
						</div>
					</div>
				))}
			</div>

			<div className="streamLocation">
				twitch.tv/rscsolar
			</div>

		</div>

	)

}

export default StreamSchedule;
