export function throttle(callback: (...args: any[]) => void, delay: number) {
  let timerFlag: number | null = null

  return (...args: any[]) => {
    if (timerFlag === null) {
      callback(...args)
      timerFlag = window.setTimeout(() => {
        timerFlag = null
      }, delay)
    }
  }
}
