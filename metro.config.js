import { dirname } from "path";
import { fileURLToPath } from "url";
import { getDefaultConfig } from "expo/metro-config";
import { withNativeWind } from "nativewind/metro";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const config = getDefaultConfig(projectRoot);

export default withNativeWind(config, { input: "./global.css" });
