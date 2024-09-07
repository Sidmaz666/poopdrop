import { ReactP5Wrapper } from "@p5-wrapper/react";
import game_sketch from "../sketch/Game.jsx";

export default function App() {
  return <ReactP5Wrapper sketch={game_sketch} />;
}
