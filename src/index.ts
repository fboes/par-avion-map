import App from "./App.js";
const app = new App();

let resizeTimer: number;
if (location.hash) {
  const parts = location.hash.slice(1).split("-");
  app.elements.seedInput.value = parts[0];
  app.elements.mapDimensionInput.value = parts[1];
  app.elements.resolutionInput.value = parts[2];
}

// -----------------------------------------------------------------------------

app.elements.generateButton.addEventListener("click", () => {
  app.generateMap();
});
app.elements.seedInput.addEventListener("change", () => {
  app.generateMap();
});
app.elements.mapDimensionInput.addEventListener("change", () => {
  app.generateMap();
});
app.elements.resolutionInput.addEventListener("change", () => {
  app.generateMap();
});
app.elements.randomizeButton.addEventListener("click", () => {
  app.elements.seedInput.value = "";
  app.generateMap();
});
app.elements.mapHsiCanvas.addEventListener("click", (event) => {
  app.onClickPosition(event);
});
app.elements.changeLogCheckbox.addEventListener("change", (event) => {
  app.onChangeLogging(event);
});
window.addEventListener("popstate", (event) => {
  app.generateFromSeed(
    event.state.seed,
    event.state.dimension,
    event.state.resolution,
  );
});
window.requestAnimationFrame(app.onRequestAnimationFrame.bind(app));
