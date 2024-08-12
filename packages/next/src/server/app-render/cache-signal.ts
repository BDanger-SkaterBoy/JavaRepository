/**
 * This class is used to detect when all cache reads for a given render are settled.
 * We do this to allow for cache warming the prerender without having to continue rendering
 * the remainder of the page. This feature is really only useful when the dynamicIO flag is on
 * and should only be used in codepaths gated with this feature.
 */

export class CacheSignal {
  private count: number
  private listeners: Array<() => void>

  constructor() {
    this.count = 0
    this.listeners = []
  }

  /**
   * If there are inflight cache reads this Promise can resolve in a microtask however
   * if there are no inflight cache reads then we wait at least one task to allow initial
   * cache reads to be initiated.
   */
  async cacheReady() {
    const promise = new Promise<void>((resolve) => {
      this.listeners.push(resolve)
      if (this.count === 0) {
        // We increment the count here in case a read begin/end cycle happens before the
        // next scheduled task. This ensures we only ever have one task scheduled at a time.
        this.count++
        setTimeout(() => {
          // We need to decrement our own increment here
          this.count--
          if (this.count === 0) {
            for (let i = 0; i < this.listeners.length; i++) {
              this.listeners[i]()
            }
            this.listeners.length = 0
          }
        })
      }
    })
    return promise
  }

  beginRead() {
    this.count++
  }

  endRead() {
    // If this is the last read we need to wait a task before we can claim the cache is settled.
    // The cache read will likely ping a Server Component which can read from the cache again and this
    // will play out in a microtask so we need to only resolve pending listeners if we're still at 0
    // after at least one task.
    // We only want one task scheduled at a time so when we hit count 1 we don't decrement the counter immediately.
    // If intervening reads happen before the scheduled task runs they will never observe count 1 preventing reentrency
    if (this.count === 1) {
      setTimeout(() => {
        // We deferred the decrement above and need to do it now for proper balancing
        this.count--
        if (this.count === 0) {
          for (let i = 0; i < this.listeners.length; i++) {
            this.listeners[i]()
          }
          this.listeners.length = 0
        }
      }, 0)
    } else {
      this.count--
    }
  }
}
