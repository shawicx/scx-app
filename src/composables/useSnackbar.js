import { reactive } from 'vue'

const state = reactive({
  snackbars: []
})

let nextId = 0

function add({ color, text, timeout = 3000 }) {
  const id = nextId++
  state.snackbars.push({ id, color, text, timeout, visible: true })
  return id
}

function remove(id) {
  const index = state.snackbars.findIndex(s => s.id === id)
  if (index > -1) state.snackbars.splice(index, 1)
}

function success(text, timeout = 3000) {
  return add({ color: 'success', text, timeout })
}

function error(text, timeout = 5000) {
  return add({ color: 'error', text, timeout })
}

function warning(text, timeout = 3000) {
  return add({ color: 'warning', text, timeout })
}

function info(text, timeout = 3000) {
  return add({ color: 'info', text, timeout })
}

export function useSnackbar() {
  return { state, add, remove, success, error, warning, info }
}
