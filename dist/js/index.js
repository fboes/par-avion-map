import App from './App.js';
const app = new App();
let resizeTimer;
if (location.hash) {
    const parts = location.hash.slice(1).split('-');
    app.elements.seedInput.value = parts[0];
    app.elements.mapDimensionInput.value = parts[1];
    app.elements.resolutionInput.value = parts[2];
}
// -----------------------------------------------------------------------------
app.elements.generateButton.addEventListener('click', () => { app.generateMap(); });
app.elements.seedInput.addEventListener('change', () => { app.generateMap(); });
app.elements.mapDimensionInput.addEventListener('change', () => { app.generateMap(); });
app.elements.resolutionInput.addEventListener('change', () => { app.generateMap(); });
app.elements.randomizeButton.addEventListener('click', () => {
    app.elements.seedInput.value = '';
    app.generateMap();
});
app.elements.mapCanvas.addEventListener('click', (event) => { app.pointer(event); });
app.elements.mapCanvas.addEventListener('mousemove', (event) => { app.pointer(event); });
app.elements.mapCanvas.addEventListener('wheel', (event) => { event.preventDefault(); app.heading(event); });
window.addEventListener('resize', () => {
    // simple debouncer
    if (resizeTimer !== undefined) {
        clearTimeout(resizeTimer);
    }
    resizeTimer = setTimeout(function () {
        app.generateMap();
    }, 250);
});
window.addEventListener('popstate', (event) => {
    app.generateFromSeed(event.state.seed, event.state.dimension, event.state.resolution);
});
