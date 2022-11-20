import React from "react";

import "@/style/transition.css";

const Transition = (props) => {

    return (
        <div id="Transition" className={`${props.transition.styleClass} ${props.transition.show ? "show" : ""}`}>

            <div className="bg">
                {props.transition.logo ? (
                    <div className="logo">
                        <img src={`./src/assets/logos/${props.transition.logo}`}></img>
                    </div>
                ): null}
            </div>
            <div className="stripe">
                {props.transition.text ? (
                    <div className="text">{props.transition.text}</div>
                ) : null}
            </div>

        </div>
    )

}

export default Transition;
