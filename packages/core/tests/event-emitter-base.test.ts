import type { EventArgs, EventMap } from '../src/EventEmitter.types'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EventEmitterBase } from '../src/EventEmitterBase'

// Define test event map
interface TestEvents extends EventMap {
  [key: string]: unknown[]
  noArgs: []
  oneArg: [value: string]
  multipleArgs: [id: number, name: string, active: boolean]
  objectArg: [data: { key: string, nested: { value: number } }]
}

// Concrete test class that extends EventEmitterBase
class TestEmitter extends EventEmitterBase<TestEvents> {
  // Expose emit as public for testing
  public emitPublic<K extends keyof TestEvents>(
    eventName: K,
    ...args: EventArgs<TestEvents, K>
  ): void {
    this.emit(eventName, ...args)
  }
}

describe('eventEmitterBase', () => {
  let emitter: TestEmitter

  beforeEach(() => {
    vi.clearAllMocks()
    emitter = new TestEmitter()
  })

  describe('on', () => {
    it('should register a single listener and emit event with arguments', () => {
      const listener = vi.fn()

      emitter.on('multipleArgs', listener)
      emitter.emitPublic('multipleArgs', 42, 'test', true)

      expect(listener).toHaveBeenCalledWith(42, 'test', true)
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should register listener for event with no arguments', () => {
      const listener = vi.fn()

      emitter.on('noArgs', listener)
      emitter.emitPublic('noArgs')

      expect(listener).toHaveBeenCalledWith()
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should register multiple listeners for the same event and call in order', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      const listener3 = vi.fn()
      const callOrder: number[] = []

      listener1.mockImplementation(() => callOrder.push(1))
      listener2.mockImplementation(() => callOrder.push(2))
      listener3.mockImplementation(() => callOrder.push(3))

      emitter.on('oneArg', listener1)
      emitter.on('oneArg', listener2)
      emitter.on('oneArg', listener3)

      emitter.emitPublic('oneArg', 'value')

      expect(listener1).toHaveBeenCalledWith('value')
      expect(listener2).toHaveBeenCalledWith('value')
      expect(listener3).toHaveBeenCalledWith('value')
      expect(callOrder).toEqual([1, 2, 3])
    })

    it('should register listeners for different events', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      const listener3 = vi.fn()

      emitter.on('noArgs', listener1)
      emitter.on('oneArg', listener2)
      emitter.on('multipleArgs', listener3)

      emitter.emitPublic('noArgs')
      emitter.emitPublic('oneArg', 'test')
      emitter.emitPublic('multipleArgs', 1, 'name', false)

      expect(listener1).toHaveBeenCalledWith()
      expect(listener2).toHaveBeenCalledWith('test')
      expect(listener3).toHaveBeenCalledWith(1, 'name', false)
    })

    it('should allow same listener to be registered for multiple events', () => {
      const listener = vi.fn()

      emitter.on('oneArg', listener)
      emitter.on('multipleArgs', listener)

      emitter.emitPublic('oneArg', 'test')
      emitter.emitPublic('multipleArgs', 99, 'foo', true)

      expect(listener).toHaveBeenCalledTimes(2)
      expect(listener).toHaveBeenNthCalledWith(1, 'test')
      expect(listener).toHaveBeenNthCalledWith(2, 99, 'foo', true)
    })

    it('should support method chaining with multiple on calls', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      const listener3 = vi.fn()

      const result = emitter
        .on('noArgs', listener1)
        .on('oneArg', listener2)
        .on('multipleArgs', listener3)

      expect(result).toBe(emitter)

      emitter.emitPublic('noArgs')
      emitter.emitPublic('oneArg', 'value')
      emitter.emitPublic('multipleArgs', 1, 'test', true)

      expect(listener1).toHaveBeenCalledTimes(1)
      expect(listener2).toHaveBeenCalledTimes(1)
      expect(listener3).toHaveBeenCalledTimes(1)
    })
  })

  describe('off', () => {
    it('should remove a registered listener', () => {
      const listener = vi.fn()

      emitter.on('oneArg', listener)
      emitter.emitPublic('oneArg', 'first')

      expect(listener).toHaveBeenCalledWith('first')

      emitter.off('oneArg', listener)
      emitter.emitPublic('oneArg', 'second')

      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should remove one listener while others remain', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      const listener3 = vi.fn()

      emitter.on('oneArg', listener1)
      emitter.on('oneArg', listener2)
      emitter.on('oneArg', listener3)

      emitter.off('oneArg', listener2)
      emitter.emitPublic('oneArg', 'test')

      expect(listener1).toHaveBeenCalledWith('test')
      expect(listener2).not.toHaveBeenCalled()
      expect(listener3).toHaveBeenCalledWith('test')
    })

    it('should remove only first instance when listener is registered multiple times', () => {
      const listener = vi.fn()

      emitter.on('oneArg', listener)
      emitter.on('oneArg', listener)
      emitter.on('oneArg', listener)

      emitter.off('oneArg', listener)
      emitter.emitPublic('oneArg', 'test')

      expect(listener).toHaveBeenCalledTimes(2)
    })

    it('should not throw when removing listener that was never registered', () => {
      const listener = vi.fn()

      expect(() => {
        emitter.off('oneArg', listener)
      }).not.toThrow()

      emitter.emitPublic('oneArg', 'test')
      expect(listener).not.toHaveBeenCalled()
    })

    it('should not throw when removing listener for event with no listeners', () => {
      const listener = vi.fn()

      expect(() => {
        emitter.off('noArgs', listener)
      }).not.toThrow()
    })

    it('should support method chaining', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      emitter.on('oneArg', listener1)
      emitter.on('multipleArgs', listener2)

      const result = emitter.off('oneArg', listener1).off('multipleArgs', listener2)

      expect(result).toBe(emitter)

      emitter.emitPublic('oneArg', 'test')
      emitter.emitPublic('multipleArgs', 1, 'name', true)

      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).not.toHaveBeenCalled()
    })

    it('should support chaining on and off calls', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      const listener3 = vi.fn()

      const result = emitter
        .on('oneArg', listener1)
        .on('oneArg', listener2)
        .off('oneArg', listener1)
        .on('multipleArgs', listener3)

      expect(result).toBe(emitter)

      emitter.emitPublic('oneArg', 'test')
      emitter.emitPublic('multipleArgs', 1, 'name', false)

      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).toHaveBeenCalledWith('test')
      expect(listener3).toHaveBeenCalledWith(1, 'name', false)
    })
  })

  describe('emit', () => {
    it('should not throw when emitting event with no registered listeners', () => {
      expect(() => {
        emitter.emitPublic('noArgs')
      }).not.toThrow()

      expect(() => {
        emitter.emitPublic('oneArg', 'test')
      }).not.toThrow()

      expect(() => {
        emitter.emitPublic('multipleArgs', 1, 'name', true)
      }).not.toThrow()
    })

    it('should propagate error when listener throws during execution', () => {
      const error = new Error('Listener error')
      const listener = vi.fn().mockImplementation(() => {
        throw error
      })

      emitter.on('oneArg', listener)

      expect(() => {
        emitter.emitPublic('oneArg', 'test')
      }).toThrow('Listener error')
    })

    it('should pass complex object arguments by reference', () => {
      const listener = vi.fn()
      const complexObject = {
        key: 'value',
        nested: {
          value: 42,
        },
      }

      emitter.on('objectArg', listener)
      emitter.emitPublic('objectArg', complexObject)

      expect(listener).toHaveBeenCalledWith(complexObject)
      expect(listener.mock.calls[0][0]).toBe(complexObject)
    })
  })

  describe('integration', () => {
    it('should handle complex workflow with multiple events and listeners', () => {
      const noArgsListener = vi.fn()
      const oneArgListener1 = vi.fn()
      const oneArgListener2 = vi.fn()
      const multipleArgsListener = vi.fn()

      emitter
        .on('noArgs', noArgsListener)
        .on('oneArg', oneArgListener1)
        .on('oneArg', oneArgListener2)
        .on('multipleArgs', multipleArgsListener)

      emitter.emitPublic('noArgs')
      emitter.emitPublic('oneArg', 'test1')

      expect(noArgsListener).toHaveBeenCalledTimes(1)
      expect(oneArgListener1).toHaveBeenCalledWith('test1')
      expect(oneArgListener2).toHaveBeenCalledWith('test1')
      expect(multipleArgsListener).not.toHaveBeenCalled()

      emitter.off('oneArg', oneArgListener1)
      emitter.emitPublic('oneArg', 'test2')

      expect(oneArgListener1).toHaveBeenCalledTimes(1)
      expect(oneArgListener2).toHaveBeenCalledTimes(2)
      expect(oneArgListener2).toHaveBeenLastCalledWith('test2')

      emitter.emitPublic('multipleArgs', 100, 'final', true)

      expect(multipleArgsListener).toHaveBeenCalledWith(100, 'final', true)
      expect(multipleArgsListener).toHaveBeenCalledTimes(1)
    })
  })
})
