/**
 * Utitlity functions for Vuex store modules.
 *
 * @module store/utils
 */

/**
 * Compare callback to find item in array.
 *
 * @callback compareFind
 * @param {*} item
 * @returns {bool}
 */

/**
 * @param {*} any
 * @returns {compareFind}
 */
function createCompare(any) {
  if (typeof any === 'object' && 'id' in any) {
    return item => item.id === any.id
  }

  return item => item === any
}

/**
 * Check if it is function.
 * @param {*} any
 * @returns {bool}
 *
 * TODO: Extract it to global utils.
 */
function isFunction(any) {
  return typeof any === 'function'
}

/**
 * Symbol factory.
 *
 * @param {string} name
 */
export const symbol = name => Symbol(name)

/**
 * Insert (replace/push) item in array.
 *
 * @param {Array} target
 * @param {*} item
 * @param [compareFind} [compare]
 */
export const insert = (target, item, compare) => {
  if (!isFunction(compare)) {
    insert(target, item, createCompare(item))

    return
  }

  const index = target.findIndex(compare)

  if (index > -1) target.splice(index, 1, item)
  else target.push(item)
}

/**
 * Remove item from array.
 *
 * @param {*} target
 * @param {*} item
 * @param {*} compare
 */
export const remove = (target, item, compare) => {
  if (!isFunction(compare)) {
    remove(target, item, createCompare(item))

    return
  }

  const index = target.findIndex(compare)

  if (index > -1) target.splice(index, 1)
}
