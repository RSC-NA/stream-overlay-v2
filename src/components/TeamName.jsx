import React from "react";

const TeamName = (props) => {

    const longTeamName = 12;
    const longFranchiseName = 25;

    return (
        <div className={`teamNameBox team${props.team}`}>

			{props.goalScored ?
				<div className="goal">Goal!</div>
			: null}

            <div className={`teamName ${props.name.length >= longTeamName ? "long" : ""} ${props.franchiseName ? "withFranchise" : ""}`}>
				{props.name}
			</div>
			{props.franchiseName ?
	            <div className={`franchiseName ${props.franchiseName.length >= longFranchiseName ? "long" : ""}`}>
					{props.franchiseName}
				</div>
			: null}

        </div>
    )

}

export default TeamName;
