/**
 * Run function when dom is ready
 *
 * @param callback function to run when dom is ready
 */
export function ready(callback: (this: Document) => void): void {
  if (document.readyState !== 'loading') {
    callback.call(document)
  } else {
    document.addEventListener('DOMContentLoaded', callback)
  }
}

/**
 * Animate an element using css animations/transitions. This function will add the necessary classes to the element to trigger the animation.
 * When doing an entering animation following classes will be added:
 * - `[animation-name]-enter-active`
 * - `[animation-name]-enter-from`
 * - `[animation-name]-enter-to`
 * When doing a leaving animation following classes will be added:
 * - `[animation-name]-leave-active`
 * - `[animation-name]-leave-from`
 * - `[animation-name]-leave-to`
 *
 * The animation classes will be removed after the animation is done. If a callback is provided it will be called after the animation is done.
 *
 * The `-active` class will stay on the element until the animation is done. The `-from` class will be removed after the first frame and the `-to`
 * class will be added after the first frame.
 *
 * @param target html element to animate
 * @param animationName animation name to be used
 * @param entering determine if the elements animation should be entering or leaving
 * @param callback to be called after the animation is done
 */
export function animate(
  target: HTMLElement,
  animationName: string,
  entering: boolean,
  callback?: () => void,
): void {
  const animationState = entering ? 'enter' : 'leave'
  const animateClassActive = `${animationName}-${animationState}-active`
  const animateClassTo = `${animationName}-${animationState}-to`
  const animateClassFrom = `${animationName}-${animationState}-from`
  const afterAnimation = () => {
    target.classList.remove(animateClassTo, animateClassActive)
    target.removeEventListener('animationend', afterAnimation)
    target.removeEventListener('transitionend', afterAnimation)

    if (callback) {
      callback()
    }
  }

  target.addEventListener('animationend', afterAnimation)
  target.addEventListener('transitionend', afterAnimation)

  target.addEventListener('animationcancel', afterAnimation)
  target.addEventListener('transitioncancel', afterAnimation)

  target.classList.add(animateClassActive, animateClassFrom)
  requestAnimationFrame(() => {
    const styles = window.getComputedStyle(target)

    // if the element has no transition or animation we can call the afterAnimation function in the next frame
    if (['all', 'none'].includes(styles.transition) && styles.animationName === 'none') {
      requestAnimationFrame(afterAnimation)
    }

    target.classList.remove(animateClassFrom)
    target.classList.add(animateClassTo)
  })
}
