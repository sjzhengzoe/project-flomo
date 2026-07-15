type AsyncPageState = {
  active: boolean
  generation: number
}

const states = new WeakMap<object, AsyncPageState>()

function getState(page: object): AsyncPageState {
  let state = states.get(page)
  if (!state) {
    state = { active: false, generation: 0 }
    states.set(page, state)
  }
  return state
}

export function activateAsyncPage(page: object): void {
  getState(page).active = true
}

export function deactivateAsyncPage(page: object): void {
  const state = getState(page)
  state.active = false
  state.generation += 1
}

export function beginAsyncPageRequest(page: object): number {
  const state = getState(page)
  state.generation += 1
  return state.generation
}

export function invalidateAsyncPageRequests(page: object): void {
  getState(page).generation += 1
}

export function isAsyncPageActive(page: object): boolean {
  return getState(page).active
}

export function isAsyncPageRequestCurrent(page: object, generation: number): boolean {
  const state = getState(page)
  return state.active && state.generation === generation
}
