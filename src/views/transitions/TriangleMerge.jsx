import React from "react";

const TriangleMerge = (props) => {

	return (
		<>

			<div className="bgLeft">
			</div>
			<div className="bgRight">
			</div>
			<div className="highlight">
			</div>
			<div className="trianglesLeft">
			</div>
			<div className="trianglesRight">
			</div>
			<div className="logoLeft">
				<div className="logo">
					<img src={`/logos/${props.transition.logo}`}></img>
				</div>
			</div>
			<div className="logoRight">
				<div className="logo">
					<img src={`/logos/${props.transition.logo}`}></img>
				</div>
			</div>




{/* 			<div className="bg">
				{props.transition.logo && props.transition.logo !== null && props.transition.logo !== "" ? (
					<div className="logo">
						<img src={`/logos/${props.transition.logo}`}></img>
					</div>
				): null}
			</div>
			<div className="stripe">
				{props.transition.text ? (
					<div className="text">{props.transition.text}</div>
				) : null}
			</div>
 */}
		</>
	)

}

export default TriangleMerge;
