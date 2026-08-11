// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { initExample } from '../../scripts/services/example'
import { initExpand } from '../../scripts/services/expand'
import { initSidebar } from '../../scripts/services/sidebar'
import { ready } from '../../scripts/utils/dom'

vi.mock('../../scripts/services/example', () => ({ initExample: vi.fn<() => void>() }))
vi.mock('../../scripts/services/expand', () => ({ initExpand: vi.fn<() => void>() }))
vi.mock('../../scripts/services/sidebar', () => ({ initSidebar: vi.fn<() => void>() }))
vi.mock('../../scripts/utils/dom', () => ({ ready: vi.fn<() => void>() }))

describe('app', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('should defer all setup until the document is ready', async () => {
    await import('../../scripts/app')

    expect(ready).toHaveBeenCalledTimes(1)
    expect(initExpand).not.toHaveBeenCalled()
    expect(initExample).not.toHaveBeenCalled()
    expect(initSidebar).not.toHaveBeenCalled()
  })

  it('should initialise expand, example and sidebar in that order once ready', async () => {
    const order: string[] = []

    vi.mocked(initExpand).mockImplementation(() => order.push('expand'))
    vi.mocked(initExample).mockImplementation(() => order.push('example'))
    vi.mocked(initSidebar).mockImplementation(() => order.push('sidebar'))

    await import('../../scripts/app')

    const [callback] = vi.mocked(ready).mock.calls[0]

    callback.call(document)

    expect(order).toEqual(['expand', 'example', 'sidebar'])
  })
})
