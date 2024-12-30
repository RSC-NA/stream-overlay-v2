import React, { useEffect, useRef, useState } from "react";

const socialMediaList = [
	{
		icon: null,
		text: "rocketsoccarconfederation.com",
	},
	{
		icon: "/images/social/discord.png",
		text: "discord.gg/rsc",
	},
	{
		icon: "/images/social/twitch.png",
		text: "RSCSolar",
	},
	{
		icon: "/images/social/youtube.png",
		text: "rocketsoccarconfederation",
	},
	{
		icon: "/images/social/twitter.png",
		text: "rsconfederation",
	},
];

const rotationSeconds = 13;

const SocialMedia = (props) => {

	const [activeItem, _setActiveItem] = useState(0);

	const activeItemRef = useRef(activeItem);
	const setActiveItem = (data) => {
		activeItemRef.current = data;
		_setActiveItem(data);
	}

	const rotateItems = () => {
		if (activeItemRef.current === socialMediaList.length - 1) {
			setActiveItem(0);
		} else {
			setActiveItem(activeItemRef.current + 1);
		}
	}

	useEffect(() => {
		const socialMediaRotation = setInterval(() => rotateItems(), rotationSeconds * 1000);

		return () => clearInterval(socialMediaRotation);
	}, [])

	return (

		socialMediaList.map((item, index) =>

			<div key={index} className={`socialMedia ${index === activeItemRef.current ? "show" : ""}`}>

				<div className="socialItemText">
					{item.icon ?
						<img src={item.icon} />
					: null}
					{item.text}
				</div>

			</div>

		)

	)

}

export default SocialMedia;
