import { System, InitEvent } from './systems'
import { Entity } from './Entity'
import { World } from './World'
import { EntityManager } from './EntityManager'

export function startGame (systems: System<any>[]) {
  const cleanups: (() => void)[] = []
  const events: any[] = []

  const entityManager = new EntityManager()

  let running = false

  function add (components: any[] = []) {
    return components.reduce(
      (e: Entity, c) => e.add(c),
      new Entity(entityManager.scheduleUpdate),
    )
  }

  function emit (event: any) {
    if (running) {
      events.push(event)
    } else {
      setTimeout(() => runSystems(event))
    }
  }

  function runSystems (event: any) {
    running = true
    const world = {
      event,
      query: entityManager.query,
      add,
      remove: entityManager.scheduleRemove,
      emit
    }
    systems.forEach(system => runSystem(system, world))
    entityManager.processUpdates()
    running = false
  }

  function runSystem (system: System<any>, world: World<any>) {
    try {
      const result = system(world)
      if (typeof result === 'function') {
        cleanups.push(result)
      }
    } catch (e) {
      console.error(e)
    }
  }

  setTimeout(() => runSystems(new InitEvent()))

  return () => {
    cleanups.forEach(cleanup => cleanup())
  }
}
