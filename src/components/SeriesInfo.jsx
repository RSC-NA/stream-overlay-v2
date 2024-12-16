import React from "react";

const SeriesInfo = (props) => {

    let message = "";

    return (
        <div className="seriesInfo">
            {props.seriesConfig.override ? (
                <>
                    {props.seriesConfig.override}
                </>
            ) : props.seriesConfig.type === "unlimited" ? (
                <>
                    {!props.pregame ? `Game ${props.seriesGame}` : ""}
                </>
            ) : props.seriesConfig.type === "bestof" ? (
                <>
                    {!props.pregame ? (
                        <>
                            Game {props.seriesGame}<span className="pipe"> | </span>
                        </>
                    ) : null}
                    Best of {props.seriesConfig.maxGames}
                </>
            ) : props.seriesConfig.type === "set" ? (
                <>
					{props.seriesConfig.maxGames} game series

                    {!props.pregame ? (
                        <>
                            <span className="pipe"> | </span>Game {props.seriesGame}
                        </>
                    ) : null}
                </>
            ) : null}
        </div>
    )

}

export default SeriesInfo;
