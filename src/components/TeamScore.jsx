import React from 'react';

const TeamScore = (props) => {

    const longScore = 20;

    return (
        <div className={`teamScore ${props.score >= longScore ? " long" : ""}`} id={`TeamScore${props.team}`}>
            {props.score}
        </div>
    )

}

export default TeamScore;
