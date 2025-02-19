import React from "react";
import BoostDisplay from "@/components/BoostDisplay";

const Watching = (props) => {

    const longName = 30;

    return (
        <div className={`watchingView team${props.player.team}`}>

            <div className="stats">
                <div className={`name ${props.player.name.length >= longName ? " long" : ""}`}>{props.player.name}</div>
                <div className="statLine">
                    <div className="stat">
                        <span className="label">G</span>
                        <span className="value">{props.player.goals}</span>
                    </div>
                    <div className="stat">
                        <span className="label">A</span>
                        <span className="value">{props.player.assists}</span>
                    </div>
                    <div className="stat">
                        <span className="label">{props.gameMode === "dropshot" ? "DMG" : "SH"}</span>
                        <span className="value">{props.player.shots}</span>
                    </div>
                    <div className="stat">
                        <span className="label">SV</span>
                        <span className="value">{props.player.saves}</span>
                    </div>
                    <div className="stat">
                        <span className="label">DM</span>
                        <span className="value">{props.player.demos}</span>
                    </div>

{/* remove touches for now
                     <div className="stat">
                        <span className="label">T</span>
                        <span className="value">{props.player.touches}</span>
                    </div>
*/}
                </div>
            </div>

            <BoostDisplay
				boost={props.player.boost}
				theme={props.config.general.theme}
			/>

        </div>
    )

}

export default Watching;
