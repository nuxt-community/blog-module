// @flow
export default class Container<T> {
  constructor(sort = (a: T, b: T) => a.id < b.id) {
    Object.defineProperties(this, {
      _sort: { value: sort },
      _items: { value: {} },
      _dirty: { value: false, writable: true },
      _sorted: { value: [], writable: true }
    })
  }

  get items(): T[] {
    if (this._dirty === true) {
      this._sorted = Object.values(this._items).sort(this._sort)
    }

    return this._sorted
  }

  get length(): number {
    return Object.keys(this._items).length
  }

  addItem(item: T) {
    this._items[item.id] = item
    this._dirty = true
  }

  getItem(id: string) {
    return this._items[id]
  }
}
