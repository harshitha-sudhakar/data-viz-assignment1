
import { MONTH_NAMES } from './data.js';

import {
  SETTINGS,
  temperatureColorScale,
  renderTemperatureLegend
} from './config.js';

import {
  showTooltip,
  moveTooltip,
  hideTooltip
} from './tooltip.js';

/**
 * Render Level 1: Monthly temperature heatmap.
 *
 * Columns represent years and rows represent months.
 * Cell colors encode the actual highest or lowest
 * recorded temperature for each month.
 */
export function renderHeatmap(container, legend, months, metric) {
  container.selectAll('*').remove();
  legend.selectAll('*').remove();

  const config = SETTINGS.monthly;
  const colorScale = temperatureColorScale();

  const years = [...new Set(months.map(month => month.year))]
    .sort((a, b) => a - b);

  const horizontalStep = config.cellWidth + config.gapX;
  const verticalStep = config.cellHeight + config.gapY;

  const chartWidth =
    config.left + years.length * horizontalStep + config.right;

  const chartHeight =
    config.top + 12 * verticalStep + config.bottom;

  const svg = container.append('svg')
    .attr('width', chartWidth)
    .attr('height', chartHeight)
    .attr('viewBox', `0 0 ${chartWidth} ${chartHeight}`);

  // Map each year to its horizontal position.
  const yearPositions = new Map(
    years.map((year, index) => [
      year,
      config.left + index * horizontalStep
    ])
  );

  const monthPosition = month =>
    config.top + month * verticalStep;

  // Display year labels at the top.
  svg.selectAll('.year-label')
    .data(years)
    .join('text')
    .attr('class', 'axis-label')
    .attr('text-anchor', 'middle')
    .attr('x', year =>
      yearPositions.get(year) + config.cellWidth / 2
    )
    .attr('y', config.top - 15)
    .text(year => year);

  // Display month labels on the left.
  svg.selectAll('.month-label')
    .data(d3.range(12))
    .join('text')
    .attr('class', 'axis-label')
    .attr('text-anchor', 'end')
    .attr('x', config.left - 12)
    .attr('y', month =>
      monthPosition(month) + config.cellHeight / 2 + 4
    )
    .text(month => MONTH_NAMES[month]);

  /**
   * Select the actual monthly extreme.
   *
   * Maximum mode: highest daily maximum in the month.
   * Minimum mode: lowest daily minimum in the month.
   */
  function getTemperature(month) {
    return metric === 'min'
      ? month.lowest
      : month.highest;
  }

  // Draw the heatmap cells.
  svg.selectAll('.heat-cell')
    .data(months)
    .join('rect')
    .attr('class', 'heat-cell')
    .attr('x', month => yearPositions.get(month.year))
    .attr('y', month => monthPosition(month.month))
    .attr('width', config.cellWidth)
    .attr('height', config.cellHeight)
    .attr('fill', month => colorScale(getTemperature(month)))
    .on('mouseenter', (event, month) => {
      showTooltip(event, createTooltip(month));
    })
    .on('mousemove', moveTooltip)
    .on('mouseleave', hideTooltip);

  // Display the temperature legend.
  renderTemperatureLegend(
    svg,
    config.left + years.length * horizontalStep + 10,
    config.top,
    245
  );

  /**
   * Tooltip shows both actual monthly extremes.
   */
  function createTooltip(month) {
    return `
      <strong>${MONTH_NAMES[month.month]} ${month.year}</strong>
      <br>Highest recorded: ${month.highest}°C
      <br>Lowest recorded: ${month.lowest}°C
    `;
  }

}
