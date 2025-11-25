import "../sass/framework.sass";

import announcement from "./components/announcement.js";
import customSelect from "./components/custom-select.js";
import navigation from "./components/navigation.js";
import floatingWidget from "./components/floating-widget.js";
import notifications from "./components/notifications.js";
import navigationFloating from "./components/navigation-floating.js";
import route from "./components/route.js";

const components = [
  announcement,
  customSelect,
  navigation,
  floatingWidget,
  notifications,
  navigationFloating,
  route,
];

const init = () => components.forEach((fn) => fn());

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
