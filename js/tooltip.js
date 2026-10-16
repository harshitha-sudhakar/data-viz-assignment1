const tooltip = d3.select('#tooltip');
export function showTooltip(event, html) {
  tooltip.html(html).style('opacity', 1);
  moveTooltip(event);
}
export function moveTooltip(event) {
  const node = tooltip.node();
  const x = Math.min(event.clientX + 14, window.innerWidth - node.offsetWidth - 12);
  const y = Math.max(8, Math.min(event.clientY + 14, window.innerHeight - node.offsetHeight - 12));
  tooltip.style('left', `${x}px`).style('top', `${y}px`);
}
export function hideTooltip() { tooltip.style('opacity', 0); }
