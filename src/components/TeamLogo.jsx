import React from "react";

const TeamLogo = (props) => {

    return (
        <div className={`teamLogo team${props.team}`}>
            <img
				src={
				props.logo.substr(0,8) === "https://" || props.logo.substr(0,10) === "data:image/" ? props.logo
				 : `/logos/teams/${props.logo}`
			} />
        </div>
    )

}

export default TeamLogo;
