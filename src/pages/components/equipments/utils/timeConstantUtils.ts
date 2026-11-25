export function parseTimeConstant(timeConstant: string): number {
  // Convert time constant string to milliseconds
  const value = parseFloat(timeConstant);
  const unit = timeConstant.replace(/[\d.\s]/g, '');

  switch (unit) {
    case 'μs':
      return value * 0.001; // Convert microseconds to milliseconds
    case 'ms':
      return value;
    case 's':
      return value * 1000;
    case 'ks':
      return value * 1000000;
    default:
      return 0;
  }
}

// Get wait time based on time constant (typically 5-7 time constants for full settling)
export function getWaitTime(timeConstant: string): number {
  const baseTime = parseTimeConstant(timeConstant);
  return baseTime;
}

// Sleep function that returns a promise that resolves after the specified time
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
