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
app.elements.mapCanvas.addEventListener('click', (event) => { app.updatePosition(event); });
app.elements.mapCanvas.addEventListener('mousemove', (event) => { app.updatePosition(event); });
app.elements.mapCanvas.addEventListener('wheel', (event) => { event.preventDefault(); app.changeHeading(event); });
app.elements.course1Input.addEventListener('change', (event) => { app.changeCourse(event, 0); });
app.elements.course2Input.addEventListener('change', (event) => { app.changeCourse(event, 1); });
app.elements.headingSelectInput.addEventListener('change', (event) => { app.changeHeadingSelect(event); });
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
