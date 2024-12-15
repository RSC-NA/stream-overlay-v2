import React from "react";

import Default from "@/components/themes/Default";

const Transition = (props) => {

	return (
		<>

			{props.theme === "rsc" ?

				import ("@/style/themes/rsc/main.scss")

			:
                <link rel="stylesheet" type="text/css" href="/style/themes/default/main.scss" />

				// import ("@/style/themes/default/main.scss")

			}

		</>
	)

};

export default Transition;
