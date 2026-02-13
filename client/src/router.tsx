import { createBrowserRouter } from "react-router-dom";
import Admin from "./pages/Admin";
import Swipe from "./pages/Swipe";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  { path: "/", element: <Admin /> },
  { path: "/v/:slug", element: <Swipe /> },
  { path: "*", element: <NotFound /> },
]);
