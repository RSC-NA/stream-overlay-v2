import React, { Fragment } from "react";

import Header from "@/components/Header";
import TeamLogo from "@/components/TeamLogo";

import hexToRgba from "@/utils/hexToRgba";
import imageLocation from "@/utils/imageLocation";

const longTeamName = 16;
const longFranchiseName = 25;

const Interview = ({ config, name, team }) => {

	const teamName = (teamnum) => team.name ? team.name : gameData.teams[teamnum].name;

	return (
		<div className="interview">

			<div className="interviewHeader">

				<div className="leagueLogo">
					{config.general.brandLogo ?
						<img src={imageLocation(config.general.brandLogo, "images/logos")} />
					: null}
				</div>
				<div className="interviewTitle">Interview</div>

				<Header
					theme={config.general.theme}
					headers={config.general.headers}
					streamType={config.general.streamType}
					season={config.general.season}
					matchday={config.general.matchday}
					round={config.general.round}
					tier={config.general.tier}
					view="interview"
				/>

			</div>

			<div className="interviewDisplay">

					<TeamLogo
						team={0}
						logo={team.hasOwnProperty("logo") && team.logo ? team.logo
							: config.general.brandLogo ? imageLocation(config.general.brandLogo, "images/logos")
							: null}
						bgColor={team.bgColor}
					/>

				<div className="interviewing">
					<div className="interviewingText">
					{/* <div className="title">Interviewing:</div> */}
					<div className={`name ${team.name ? "hasTeam" : ""}`}>{name}</div>

					{team.name ?

						<div className="teamText">
							<div className={`teamName ${team.name.length >= longTeamName ? "long" : ""}`}>{team.name}</div>

							{team.franchise ?
								<div className={`franchise ${team.franchise.length >= longFranchiseName ? "long" : ""}`}>{team.franchise}</div>
							: null}
						</div>

					: null }

					</div>
				</div>

			</div>

		</div>




	)

}

export default Interview;
