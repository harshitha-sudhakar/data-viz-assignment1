
/**
 * Shared visualization settings.
 *
 * Both Level 1 and Level 2 use the same temperature scale
 * so colors remain consistent across visualizations.
 */
export const SETTINGS = {
  temperatureDomain: [0, 40],

  // Discrete temperature color palette.
  // Cold temperatures are purple/blue.
  // Warm temperatures are orange/red.
  // Hot temperatures are dark pink.
  temperatureColors: [
    '#6550a4',
    '#4775aa',
    '#338db3',
    '#48aeb4',
    '#58bea4',
    '#91d3a4',
    '#c4e8a2',
    '#f6ffa5',
    '#ffe48a',
    '#ffd078',
    '#ffb061',
    '#ff9356',
    '#f46645',
    '#e64b4b',
    '#d73757',
    '#b71e52',
    '#990044'
  ],

  monthly: {
    cellWidth: 34,
    cellHeight: 31,
    gapX: 8,
    gapY: 8,
    left: 95,
    top: 48,
    right: 105,
    bottom: 25
  },

  daily: {
    cellWidth: 82,
    cellHeight: 60,
    gapX: 19,
    gapY: 14,
    left: 100,
    top: 48,
    right: 110,
    bottom: 25,
    years: 10
  },

  dailyLineColors: {
    max: '#29b46c',
    min: '#7bdbd7'
  }
};

/**
 * Create a discrete quantized color scale.
 *
 * Temperatures from 0 to 40°C are divided into
 * equal-sized intervals, each assigned one color.
 */
export function temperatureColorScale() {
  return d3.scaleQuantize()
    .domain(SETTINGS.temperatureDomain)
    .range(SETTINGS.temperatureColors);
}

/**
 * Draw a vertical, stepped temperature legend.
 *
 * Each rectangle represents one temperature interval.
 * Unlike a gradient, adjacent colors have clear boundaries.
 */
export function renderTemperatureLegend(svg, x, y, height) {
  const colors = SETTINGS.temperatureColors;
  const segmentHeight = height / colors.length;

  // Draw individual color blocks.
  svg.selectAll('.legend-segment')
    .data(colors)
    .join('rect')
    .attr('class', 'legend-segment')
    .attr('x', x)
    .attr('y', (color, index) => y + index * segmentHeight)
    .attr('width', 22)
    .attr('height', segmentHeight + 0.3)
    .attr('fill', color => color);

  // Label the minimum and maximum temperatures.
  svg.append('text')
    .attr('class', 'legend-label')
    .attr('x', x + 29)
    .attr('y', y + 5)
    .text(`${SETTINGS.temperatureDomain[0]}°C`);

  svg.append('text')
    .attr('class', 'legend-label')
    .attr('x', x + 29)
    .attr('y', y + height)
    .text(`${SETTINGS.temperatureDomain[1]}°C`);
}
