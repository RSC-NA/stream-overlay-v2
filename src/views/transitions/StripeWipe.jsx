import React from "react";

const StripeWipe = (props) => {

    return (
		<>
            <div className="bg">
                {props.transition.logo ? (
                    <div className="logo">
						<img src={props.transition.logo}></img>
                    </div>
                ): null}
            </div>
            <div className="stripe">
                {props.transition.text ? (
                    <div className="text">{props.transition.text}</div>
                ) : null}
            </div>
		</>
    )

}

export default StripeWipe;
