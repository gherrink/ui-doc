export function throttle<T extends unknown[]>(callback: (...args: T) => void, delay: number) {
  let timerFlag: number | null = null

  return (...args: T) => {
    if (timerFlag === null) {
      callback(...args)
      timerFlag = window.setTimeout(() => {
        timerFlag = null
      }, delay)
    }
  }
}
