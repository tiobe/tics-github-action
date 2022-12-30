export default undefined;
declare global {
  namespace jest {
    interface Matchers<R> {
      toContainTimes(matcher: string, times: number): R;
    }
  }
}

expect.extend({
  toContainTimes(received: string, matcher: string, times: number) {
    const regex = new RegExp(`(${matcher})`, 'g');
    const matches = received.match(regex);

    const timesFound = matches ? matches.length : 0;

    return timesFound === times
      ? {
          pass: true,
          message: () => ''
        }
      : {
          pass: false,
          message: () => {
            if (matches) return `Expected '${matcher}' ${times} times, but found it ${matches.length} times.`;
            return `Expected '${matcher}' ${times} times, but found it 0 times.`;
          }
        };
  }
});
