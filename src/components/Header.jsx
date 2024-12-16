import React from "react";

const Header = (props) => {

	return (
		<>

			{props.headers.map((header, index) =>

				header === "%%RSCHEADER%%" ?

					<div className={`header header${index} pipes ${props.streamType === "RSC3-final" ? "tierFinal" : ""} tier${props.tier}`} key={index}>

						{props.streamType === "RSC3-final" ?
							<span className="season">Season {props.season} {props.tier} Tier Final</span>
						:
							<>
								<span className="season">Season {props.season}</span>
								<span className="tier">{props.tier}</span>
								<span className="matchday">Matchday {props.matchday}</span>
							</>
						}

					</div>

				:

					<div className={`header header${index} pipes`} key={index}>

						{header.split("|").map((headerPart, hpindex) =>
							<span key={hpindex}>{headerPart}</span>
						)}

					</div>

			)}

		</>
    )

}

export default Header;
