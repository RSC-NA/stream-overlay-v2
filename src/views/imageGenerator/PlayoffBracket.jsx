import React, { Fragment, useEffect } from "react";

import imageLocation from "@/utils/imageLocation";

const seedArray = {
	1: [1],
	2: [1,2],
	4: [1,4,2,3],
	8: [1,8,4,5,2,7,3,6],
};

const nonSeedArray = {
	1: [0],
	2: [0, 2],
	4: [0, 2, 4, 6],
}

const PlayoffBracket = ({bracketData, imageData}) => {

	const franchiseLogo = (team) => {
		const filteredTeam = bracketData.franchiseList.filter(franchise => franchise.id === team.franchise.id);

		if (filteredTeam.length === 1) {
			return filteredTeam[0].logo;
		} else {
			return "";
		}

	}

	return (

		<div id={imageData.id} className={`generatedImage playoffBracket ${bracketData.tier} ${imageData.id} tier${bracketData.tier}`}>

			<div className="header">

				<div className="leagueLogo">
						<img src="/images/logos/rsc-s24-finals.png" />
				</div>

				<div className="leagueName">Rocket Soccar Confederation</div>

				<div className="header0 pipes">
					<span className="season">Season {bracketData.season} {bracketData.tier} Tier Playoffs</span>
				</div>
			</div>

			<div className="bracket">

				{bracketData.config.conferences ?

					<div className="conferences">
						<div className="conf">Lunar</div>
						<div className="conf">Solar</div>
					</div>

				: null}

				{bracketData.config.teams > 8 ?

					<div className="round showSeeds">

						{bracketData.config.conferences ?

							seedArray[4].map((higherSeed, gameIndex) =>

								<div className="game" key={gameIndex}>

									<div className="team team0">
										<div className="logo">
											<img src={imageLocation(franchiseLogo(bracketData.lunarTeams[higherSeed - 1]), "images/logos/teams")}></img>
										</div>
										<div className="seed">{higherSeed}</div>
										<div className="name">{bracketData.lunarTeams[higherSeed - 1].name}</div>
									</div>

									{bracketData.config.teams / 2 >= 9 - higherSeed ?

										<div className="team team1">
											<div className="logo">
												<img src={imageLocation(franchiseLogo(bracketData.lunarTeams[8 - higherSeed]), "images/logos/teams")}></img>
											</div>
											<div className="seed">{9 - higherSeed}</div>
											<div className="name">{bracketData.lunarTeams[8 - higherSeed].name}</div>
										</div>

									:

										<div className="team noTeam">
											<div className="name">Bye</div>
										</div>

									}

								</div>

							)

						: null}

						{seedArray[bracketData.config.conferences ? 4 : 8].map((higherSeed, gameIndex) =>

							<div className="game" key={gameIndex}>

								<div className="team team0">
									<div className="logo">
										<img src={imageLocation(franchiseLogo(bracketData.solarTeams[higherSeed - 1]), "images/logos/teams")}></img>
									</div>
									<div className="seed">{higherSeed}</div>
									<div className="name">{bracketData.solarTeams[higherSeed - 1].name}</div>
								</div>

								{(bracketData.config.conferences && bracketData.config.teams / 2 >= 9 - higherSeed)
									|| (!bracketData.config.conferences && bracketData.config.teams >= 17 - higherSeed) ?

									<div className="team team1">
										<div className="logo">
											<img src={imageLocation(franchiseLogo(bracketData.solarTeams[(bracketData.config.conferences ? 8 : 16) - higherSeed]), "images/logos/teams")}></img>
										</div>
										<div className="seed">{(bracketData.config.conferences ? 9 : 17) - higherSeed}</div>
										<div className="name">{bracketData.solarTeams[(bracketData.config.conferences ? 8 : 16) - higherSeed].name}</div>
									</div>

								:

									<div className="team noTeam">
										<div className="name">Bye</div>
									</div>

								}

							</div>

						)}


					</div>

				: null }

				{bracketData.config.teams > 4 && bracketData.config.teams <= 8 ?

					<div className="round showSeeds">

						{bracketData.config.conferences ?

							seedArray[2].map((higherSeed, gameIndex) =>

								<div className="game" key={gameIndex}>

									<div className="team team0">
										<div className="logo">
											<img src={imageLocation(franchiseLogo(bracketData.lunarTeams[higherSeed - 1]), "images/logos/teams")}></img>
										</div>
										<div className="seed">{higherSeed}</div>
										<div className="name">{bracketData.lunarTeams[higherSeed - 1].name}</div>
									</div>

									{bracketData.config.teams / 2 >= 5 - higherSeed ?

										<div className="team team1">
											<div className="logo">
												<img src={imageLocation(franchiseLogo(bracketData.lunarTeams[4 - higherSeed]), "images/logos/teams")}></img>
											</div>
											<div className="seed">{5 - higherSeed}</div>
											<div className="name">{bracketData.lunarTeams[4 - higherSeed].name}</div>
										</div>

									:

										<div className="team noTeam">
											<div className="name">Bye</div>
										</div>


									}

								</div>

							)

						: null}

						{seedArray[bracketData.config.conferences ? 2 : 4].map((higherSeed, gameIndex) =>

							<div className="game" key={gameIndex}>

								<div className="team team0">
									<div className="logo">
										<img src={imageLocation(franchiseLogo(bracketData.solarTeams[higherSeed - 1]), "images/logos/teams")}></img>
									</div>
									<div className="seed">{higherSeed}</div>
									<div className="name">{bracketData.solarTeams[higherSeed - 1].name}</div>
								</div>

								{(bracketData.config.conferences && bracketData.config.teams / 2 >= 5 - higherSeed)
									|| (!bracketData.config.conferences && bracketData.config.teams >= 9 - higherSeed) ?

									<div className="team team1">
										<div className="logo">
											<img src={imageLocation(franchiseLogo(bracketData.solarTeams[(bracketData.config.conferences ? 4 : 8) - higherSeed]), "images/logos/teams")}></img>
										</div>
										<div className="seed">{(bracketData.config.conferences ? 5 : 9) - higherSeed}</div>
										<div className="name">{bracketData.solarTeams[(bracketData.config.conferences ? 4 : 8) - higherSeed].name}</div>
									</div>

								:

									<div className="team noTeam">
										<div className="name">Bye</div>
									</div>

								}

							</div>

						)}


					</div>

				: bracketData.config.teams > 8 ?

					<div className="round">

						{nonSeedArray[4].map((teamNumber, gameIndex) =>

							<div className="game" key={gameIndex}>

								<div className="team team0">

									{bracketData.rd2Teams[teamNumber] ?

										<>
											<div className="logo">
												<img src={imageLocation(franchiseLogo(bracketData.rd2Teams[teamNumber]), "images/logos/teams")}></img>
											</div>
											<div className="name">{bracketData.rd2Teams[teamNumber].name}</div>
										</>

									: null}
								</div>

								<div className="team team1">

									{bracketData.rd2Teams[teamNumber + 1] ?

										<>
											<div className="logo">
												<img src={imageLocation(franchiseLogo(bracketData.rd2Teams[teamNumber + 1]), "images/logos/teams")}></img>
											</div>
											<div className="name">{bracketData.rd2Teams[teamNumber + 1].name}</div>
										</>

									: null}

								</div>

							</div>

						)}

					</div>

				: null}

				{bracketData.config.teams <= 4 ?

					<div className="round showSeeds">

						{bracketData.config.conferences ?

							<div className="game">

								<div className="team team0">
									<div className="logo">
										<img src={imageLocation(franchiseLogo(bracketData.lunarTeams[0]), "images/logos/teams")}></img>
									</div>
									<div className="seed">1</div>
									<div className="name">{bracketData.lunarTeams[0].name}</div>
								</div>

								{bracketData.config.teams / 2 >= 1 ?

									<div className="team team1">
										<div className="logo">
											<img src={imageLocation(franchiseLogo(bracketData.lunarTeams[1]), "images/logos/teams")}></img>
										</div>
										<div className="seed">2</div>
										<div className="name">{bracketData.lunarTeams[1].name}</div>
									</div>

								:

									<div className="team noTeam">
										<div className="name">Bye</div>
									</div>


								}

							</div>

						: null}

						{seedArray[bracketData.config.conferences ? 1 : 2].map((higherSeed, gameIndex) =>

							<div className="game" key={gameIndex}>

								<div className="team team0">
									<div className="logo">
										<img src={imageLocation(franchiseLogo(bracketData.solarTeams[higherSeed - 1]), "images/logos/teams")}></img>
									</div>
									<div className="seed">{higherSeed}</div>
									<div className="name">{bracketData.solarTeams[higherSeed - 1].name}</div>
								</div>

								{(bracketData.config.conferences && bracketData.config.teams / 2 >= 3 - higherSeed)
									|| (!bracketData.config.conferences && bracketData.config.teams >= 5 - higherSeed) ?

									<div className="team team1">
										<div className="logo">
											<img src={imageLocation(franchiseLogo(bracketData.solarTeams[(bracketData.config.conferences ? 2 : 4) - higherSeed]), "images/logos/teams")}></img>
										</div>
										<div className="seed">{(bracketData.config.conferences ? 3 : 5) - higherSeed}</div>
										<div className="name">{bracketData.solarTeams[(bracketData.config.conferences ? 2 : 4) - higherSeed].name}</div>
									</div>

								:

									<div className="team noTeam">
										<div className="name">Bye</div>
									</div>

								}

							</div>

						)}


					</div>

				:

					<div className="round">

						{nonSeedArray[2].map((teamNumber, gameIndex) =>

							<div className="game" key={gameIndex}>

								<div className="team team0">

									{bracketData.semiTeams[teamNumber] ?

										<>
											<div className="logo">
												<img src={imageLocation(franchiseLogo(bracketData.semiTeams[teamNumber]), "images/logos/teams")}></img>
											</div>
											<div className="name">{bracketData.semiTeams[teamNumber].name}</div>
										</>

									: null}
								</div>

								<div className="team team1">

									{bracketData.semiTeams[teamNumber + 1] ?

										<>
											<div className="logo">
												<img src={imageLocation(franchiseLogo(bracketData.semiTeams[teamNumber + 1]), "images/logos/teams")}></img>
											</div>
											<div className="name">{bracketData.semiTeams[teamNumber + 1].name}</div>
										</>

									: null}

								</div>

							</div>

						)}

					</div>

				}

				<div className="round">

					<div className="game">

						<div className="team team0">

							{bracketData.finalTeams[0] ?

								<>
									<div className="logo">
										<img src={imageLocation(franchiseLogo(bracketData.finalTeams[0]), "images/logos/teams")}></img>
									</div>
									<div className="name">{bracketData.finalTeams[0].name}</div>
								</>

							: null}
						</div>

						<div className="team team1">

							{bracketData.finalTeams[1] ?

								<>
									<div className="logo">
										<img src={imageLocation(franchiseLogo(bracketData.finalTeams[1]), "images/logos/teams")}></img>
									</div>
									<div className="name">{bracketData.finalTeams[1].name}</div>
								</>

							: null}

						</div>

					</div>

				</div>

			</div>

		</div>

	)

}

export default PlayoffBracket;
