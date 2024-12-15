import React from "react";

const Header = (props) => {

    return (
		<>

			{props.headers.map((text, index) => (

				<div className={`header${index}`} key={index}>
					{text}
				</div>

			))}

		</>
    )

}

export default Header;
