import React from "react";

import StripeWipe from "@/views/transitions/StripeWipe";
import TriangleMerge from "@/views/transitions/TriangleMerge";

const Transition = (props) => {

	return (
		<div id="Transition"
			className={`${props.transition.name} ${props.transition.show ? "show" : ""} ${props.transition.team !== null ? `team${props.transition.team}` : ""}`}
			style={{
				"--transitionDelay": `${props.transition.delay}s`,
			}}
		>

			{props.transition.name === "stripeWipe" ?

				<StripeWipe transition={props.transition}/>

			: props.transition.name === "triangleMerge" ?

				<TriangleMerge transition={props.transition}/>

			: null}

		</div>
	)

};

export default Transition;
