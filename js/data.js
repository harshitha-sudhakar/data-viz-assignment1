
/**
 * Load daily Hong Kong temperature observations.
 *
 * Each observation contains a date, daily maximum temperature,
 * and daily minimum temperature.
 *
 * The data is grouped by year and month so it can be reused
 * in both visualization levels.
 */
export async function loadTemperatureData(path) {
  const parseDate = d3.utcParse('%Y-%m-%d');

  // Load and validate daily temperature records.
  const rows = await d3.csv(path, row => {
    const date = parseDate(row.date);
    const max = Number(row.max_temperature);
    const min = Number(row.min_temperature);

    if (
      !date ||
      !Number.isFinite(max) ||
      !Number.isFinite(min)
    ) {
      return null;
    }

    return {
      date,
      year: date.getUTCFullYear(),
      month: date.getUTCMonth(),
      day: date.getUTCDate(),
      max,
      min
    };
  });

  // Organize daily records by year and month.
  const grouped = d3.group(
    rows.filter(Boolean),
    observation => observation.year,
    observation => observation.month
  );

  const months = [];

  for (const [year, monthsInYear] of grouped) {
    for (const [month, days] of monthsInYear) {

      // Keep daily observations in chronological order.
      days.sort((a, b) => a.day - b.day);

      // Monthly averages are used for the heatmap colors.
      const averageMaximum = d3.mean(days, day => day.max);
      const averageMinimum = d3.mean(days, day => day.min);

      // Actual monthly extremes are used in the tooltips.
      const highestTemperature = d3.max(days, day => day.max);
      const lowestTemperature = d3.min(days, day => day.min);

      months.push({
        year,
        month,
        days,

        // Average temperatures for visualization colors.
        max: averageMaximum,
        min: averageMinimum,

        // Actual highest and lowest daily observations.
        highest: highestTemperature,
        lowest: lowestTemperature
      });
    }
  }

  // Sort by year first, then by month.
  return months.sort(
    (a, b) => a.year - b.year || a.month - b.month
  );
}

/**
 * Month names used for chart labels and tooltips.
 * Month indexes are zero-based (January = 0).
 */
export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr',
  'May', 'Jun', 'Jul', 'Aug',
  'Sep', 'Oct', 'Nov', 'Dec'
];
