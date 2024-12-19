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
			{props.transition.logo ?
				<>
					<div className="logoLeft">
						<div className="logo">
							<img src={props.transition.logo}></img>
						</div>
					</div>
					<div className="logoRight">
						<div className="logo">
							<img src={props.transition.logo}></img>
						</div>
					</div>
				</>
			: null}

		</>
	)

}

export default TriangleMerge;
