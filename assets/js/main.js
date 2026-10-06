// Prestige enhancement bundle (8). Content never lives here: the script applies the
// mode and scheme, switches layers and runs the step accordion.
import { initMode } from "./mode.js";
import { initScheme } from "./scheme.js";
import { initSteps } from "./steps.js";
import { initRoute } from "./route.js";

initMode();
initScheme();
initSteps();
initRoute();
