
import { MONTH_NAMES } from './data.js';

import {
  SETTINGS,
  temperatureColorScale,
  renderTemperatureLegend
} from './config.js';

import {
  showTooltip,
  hideTooltip
} from './tooltip.js';

/**
 * Render Level 2: Daily temperature variations.
 *
 * Each cell contains:
 * - A background encoding the monthly highest temperature.
 * - A green line representing daily maximum temperatures.
 * - A cyan line representing daily minimum temperatures.
 */
export function renderDailyCharts(
  container,
  legend,
  allMonths,
  metric = 'max',
  yearCount = SETTINGS.daily.years
) {
  container.selectAll('*').remove();
  legend.selectAll('*').remove();

  const config = SETTINGS.daily;
  const colorScale = temperatureColorScale();

  // Display the latest 10 years of data.
  const latestYear = d3.max(allMonths, month => month.year);

  const years = d3.range(
    latestYear - yearCount + 1,
    latestYear + 1
  );

  const months = allMonths.filter(month =>
    years.includes(month.year)
  );

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

  const yearPositions = new Map(
    years.map((year, index) => [
      year,
      config.left + index * horizontalStep
    ])
  );

  const monthPosition = month =>
    config.top + month * verticalStep;

  // Consistent temperature and day scales for all cells.
  const temperatureY = d3.scaleLinear()
    .domain(SETTINGS.temperatureDomain)
    .range([config.cellHeight - 6, 6]);

  const dayX = d3.scaleLinear()
    .domain([1, 31])
    .range([4, config.cellWidth - 4]);

  // Year labels.
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

  // Month labels.
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

  // Create one chart group per month.
  const cells = svg.selectAll('.month-chart')
    .data(months)
    .join('g')
    .attr('class', 'month-chart')
    .attr('transform', month =>
      `translate(
        ${yearPositions.get(month.year)},
        ${monthPosition(month.month)}
      )`
    );

  /**
   * Background color represents the actual highest
   * daily maximum recorded during the month.
   */
  cells.append('rect')
    .attr('class', 'mini-cell')
    .attr('width', config.cellWidth)
    .attr('height', config.cellHeight)
    .attr('fill', month => colorScale(month.highest));

  /**
   * Generate a daily temperature line.
   * X-axis: day of month.
   * Y-axis: temperature in Celsius.
   */
  function createTemperatureLine(temperatureMetric) {
    return d3.line()
      .defined(day =>
        Number.isFinite(day[temperatureMetric])
      )
      .x(day => dayX(day.day))
      .y(day => temperatureY(day[temperatureMetric]));
  }

  // Draw both daily maximum and minimum lines.
  for (const temperatureMetric of ['max', 'min']) {
    const lineGenerator =
      createTemperatureLine(temperatureMetric);

    cells.append('path')
      .attr('class', 'mini-line')
      .attr('fill', 'none')
      .attr(
        'stroke',
        SETTINGS.dailyLineColors[temperatureMetric]
      )
      .attr('stroke-width', 2)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', month => lineGenerator(month.days));
  }

  /**
   * Transparent interaction layer for daily tooltips.
   */
  cells.append('rect')
    .attr('class', 'mini-hitbox')
    .attr('width', config.cellWidth)
    .attr('height', config.cellHeight)
    .attr('fill', 'transparent')
    .on('mouseenter', (event, month) => {
      showTooltip(event, createDailyTooltip(event, month));
    })
    .on('mousemove', (event, month) => {
      showTooltip(event, createDailyTooltip(event, month));
    })
    .on('mouseleave', hideTooltip);

  // Temperature color legend.
  renderTemperatureLegend(
    svg,
    config.left + years.length * horizontalStep + 10,
    config.top,
    245
  );

  // Daily maximum and minimum line legend.
  for (const [temperatureMetric, label] of [
    ['max', 'Daily maximum'],
    ['min', 'Daily minimum']
  ]) {
    const item = legend.append('span');

    item.append('span')
      .attr('class', 'legend-line')
      .style(
        'background',
        SETTINGS.dailyLineColors[temperatureMetric]
      );

    item.append('span').text(label);
  }

  /**
   * Identify the recorded day nearest to the cursor.
   */
  function createDailyTooltip(event, month) {
    const mouseX = d3.pointer(
      event,
      event.currentTarget
    )[0];

    const selectedDay = Math.round(dayX.invert(mouseX));

    const nearestReading = month.days.reduce(
      (nearest, day) => {
        if (
          !nearest ||
          Math.abs(day.day - selectedDay) <
          Math.abs(nearest.day - selectedDay)
        ) {
          return day;
        }

        return nearest;
      },
      null
    );

    if (!nearestReading) {
      return 'No temperature data available';
    }

    const date = [
      month.year,
      String(month.month + 1).padStart(2, '0'),
      String(nearestReading.day).padStart(2, '0')
    ].join('-');

    return `
      <strong>Date: ${date}</strong>
      <br>Maximum: ${nearestReading.max}°C
      <br>Minimum: ${nearestReading.min}°C
    `;
  }
}
