import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";

const ControlPanel = lazy(() => import("@/views/ControlPanel") )
const Overlay = lazy(() => import("@/views/overlay/Overlay") )
const Statboard = lazy(() => import("@/views/statboard/Statboard") )

import ("@/style/appMain.scss");

const router = createBrowserRouter(
    createRoutesFromElements(
		<Route path="/">
			<Route
				path="/overlay"
				element={
                    <Suspense fallback={<>Loading app...</>}>
                        <Overlay />
                    </Suspense>
                }
			/>
			<Route
				path="/stats/:clientId"
				element={
                    <Suspense fallback={<>Loading app...</>}>
                        <Statboard />
                    </Suspense>
                }
			/>
			<Route
				path="/panel"
				element={
                    <Suspense fallback={<>Loading app...</>}>
                        <ControlPanel />
                    </Suspense>
				}
			/>
		</Route>
    )
)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
