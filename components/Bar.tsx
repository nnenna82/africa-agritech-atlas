import { getAtlas } from "@/lib/data";
import { toLite } from "@/lib/scope";
import BarControls from "./BarControls";

/** Loads the country list for the bar on the server, then hands it to the interactive bar. */
export default async function Bar() {
  const atlas = await getAtlas();
  return <BarControls countries={atlas.countries.map(toLite)} />;
}
