
import { loadTemperatureData } from './data.js';
import { renderHeatmap } from './heatmap.js';
import { renderDailyCharts } from './dailyCharts.js';

// Select the chart container and legend.
const chart = d3.select('#chart');
const legend = d3.select('#legend');

// Temperature selector is used only in Level 1.
const metricSelect = document.getElementById('metric');
const level1Controls = document.getElementById('level1Controls');

const tabs = [
  document.getElementById('level1Tab'),
  document.getElementById('level2Tab')
];

let currentLevel = 1;

try {
  // Load and process the Hong Kong temperature dataset.
  const months = await loadTemperatureData(
    './data/temperature_daily.csv'
  );

  if (!months.length) {
    throw new Error('No valid temperature observations were found.');
  }

  const firstYear = d3.min(months, month => month.year);
  const lastYear = d3.max(months, month => month.year);

  /**
   * Update the visualization when switching levels
   * or changing the temperature metric.
   */
  function update() {

    // Highlight the currently selected level.
    tabs.forEach((button, index) => {
      button.classList.toggle(
        'active',
        currentLevel === index + 1
      );
    });

    // Only Level 1 needs a maximum/minimum dropdown.
    level1Controls.hidden = currentLevel !== 1;

    // Update the visualization title.
    document.getElementById('chartTitle').textContent =
      currentLevel === 1
        ? 'Monthly temperature heatmap'
        : 'Daily temperature variations by month';

    // Update the description to match the actual colors.
    document.getElementById('chartDescription').textContent =
      currentLevel === 1
        ? 'Monthly maximum and minimum temperatures in Hong Kong. Hover for details.'
        : 'Each cell shows daily maximum (green) and minimum (light blue) temperatures.';

    // Explain the date range displayed in each level.
    document.getElementById('chartNote').textContent = '';

    // Render the selected visualization.
    if (currentLevel === 1) {

      // Level 1: Allow switching between maximum and minimum.
      renderHeatmap(
        chart,
        legend,
        months,
        metricSelect.value
      );

    } else {

      // Level 2: Always show both daily temperature lines.
      // The background represents monthly average daily highs.
      renderDailyCharts(
        chart,
        legend,
        months,
        'max',
        10
      );
    }
  }

  // Switch between Level 1 and Level 2.
  tabs.forEach((button, index) => {
    button.addEventListener('click', () => {
      currentLevel = index + 1;
      update();
    });
  });

  // Re-render Level 1 when the temperature metric changes.
  metricSelect.addEventListener('change', () => {
    if (currentLevel === 1) {
      update();
    }
  });

  // Display Level 1 when the page first loads.
  update();

} catch (error) {
  chart.text(
    `Unable to load data: ${error.message}. ` +
    'Run a local web server (see README).'
  );

  console.error(error);
}
