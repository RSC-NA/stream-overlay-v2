import React from "react";
import Matchup from "@/views/pregame/Matchup";

import * as htmlToImage from "html-to-image";

import ("@/style/appMain.scss");
import ("@/style/imageGen.scss");

// import ("@/style/themes/rsc/main.scss");

const gen = (id) => {
	htmlToImage
		.toPng(document.getElementById(id), {
			width: 1920,
			height: 1080,
		})
		.then(function (dataUrl) {
			var img = new Image();
			img.className = "pants";
			img.src = dataUrl;
			document.getElementById("result").appendChild(img);
		})
		.catch(function (error) {
			console.error("oops, something went wrong!", error);
		});


	// const canvas = document.getElementById("canvas");
};

const ImageGenerator = () => {

	// const testimg = document.getElementById("testimg");
	// context = testimg.getContext('2d');

	// const image = new Image();
	// image.src = "https://api.rscna.com/media/franchises/7/Fifty-Fifty_Pizzeria.png";
	// context.drawImg(image, 0, 0);

	// console.log(testimg.toDataURL());

	return (
		<>
			<button
				style={{
					position: "absolute",
					zIndex: 15,
				}}
				onClick={() => {
					gen("Overlay");
				}}
			>
				Press me
			</button>

			<div id="Overlay" className="rsc">
					<div className="matchup hasSeriesInfo">
						<div className="matchupHeader">
							<div className="leagueLogo">
								<img src="/images/logos/rsc-splatter-logo.png" />
							</div>
							<div className="leagueName">Rocket Soccar Confederation</div>
							<div className="header header0 pipes  tierContender">
								<span className="season">Season 22</span>
								<span className="tier">Contender</span>
								<span className="matchday">Matchday 2</span>
							</div>
						</div>
						<div className="matchupTeams">
							<div className="team team0 hasLogo">
								<div className="logo">
									<img src="/images/logos/rsc-splatter-logo.png" />
								</div>
								<div className="teamText">
									<div className="name ">Bruschetta</div>
									<div className="franchise ">Fifty-Fifty Pizzeria</div>
								</div>
							</div>
							<div className="vs">VS</div>
							<div className="team team1 hasLogo">
								<div className="logo">
									{/* <img src="/images/logos/rsc-splatter-logo.png" /> */}
									<img src="https://api.rscna.com/media/franchises/7/Fifty-Fifty_Pizzeria.png" />
								</div>
								<div className="teamText">
									<div className="name ">Sketch Squad</div>
									<div className="franchise ">Art Club</div>
								</div>
							</div>
						</div>
					</div>
			</div>

			<div id="result"
				style={{
					position: "absolute",
					zIndex: 15,
					top: "30px",
					width: "300px",
				}}
			></div>


			<canvas id="testimg">
			</canvas>
		</>
	);
};

export default ImageGenerator;
