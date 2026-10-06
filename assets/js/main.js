// Prestige enhancement bundle (8). Content never lives here: the script applies the
// mode and scheme, switches layers, runs the step accordion and copies the email address.
import { initMode } from "./mode.js";
import { initScheme } from "./scheme.js";
import { initSteps } from "./steps.js";
import { initRoute } from "./route.js";
import { initCopy } from "./copy.js";

initMode();
initScheme();
initSteps();
initCopy();
initRoute();
