// Utility to get theme-aware colors for charts
export const getChartColors = (isDarkMode: boolean) => {
  if (isDarkMode) {
    return {
      axisStroke: '#cbd5e1', // light gray for axis lines - visible on dark bg
      textStroke: '#e2e8f0', // white-ish for text
      gridStroke: 'rgba(148,163,184,0.5)', // subtle gray grid
      tooltipBg: '#1e293b',
      tooltipText: '#f1f5f9',
    };
  }
  return {
    axisStroke: 'rgba(0,0,0,0.5)', // dark gray for axis lines - visible on light bg
    textStroke: 'rgba(0,0,0,0.5)', // dark for text
    gridStroke: 'rgba(0,0,0,0.1)', // subtle dark grid
    tooltipBg: '#ffffff',
    tooltipText: '#000000',
  };
};
