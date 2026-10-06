(function (d, w) {
  var r = d.documentElement;
  function get(k) { try { return w.localStorage.getItem(k); } catch (e) { return null; } }
  var m = get("prestige.mode"), c = get("prestige.scheme"), h = w.location.hash;
  var mode = (m === "performance" || m === "backstage") ? m : (r.getAttribute("data-default-mode") || "performance");
  if (/^#(backstage|step-\d+|trapdoor)$/.test(h)) mode = "backstage";
  else if (/^#(performance|result)$/.test(h)) mode = "performance";
  r.classList.add("js");
  r.setAttribute("data-mode", mode);
  if (c === "light" || c === "dark") r.setAttribute("data-scheme", c);
})(document, window);
