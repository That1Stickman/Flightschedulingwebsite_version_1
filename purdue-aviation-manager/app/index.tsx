import { Platform } from "react-native";
import AppNative from "./src/App.native";
import AppWeb from "./src/App";

// Pick platform-appropriate root to avoid web DOM components loading in native bundles.
export default function Index() {

  return <AppWeb />;
}
