let index = 0

export function component(componentConstructor) {
  const Component = function() {
    componentConstructor.apply(this, arguments)
  }
  Component.index = index++
  return Component
}

export function __test__resetIndex() {
  index = 0
}
