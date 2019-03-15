export default class Container {
  constructor (sort = (a, b) => a.id < b.id) {
    Object.defineProperties(this, {
      _sort: { value: sort },
      _items: { value: {} },
      _dirty: { value: false, writable: true },
      _sorted: { value: [], writable: true }
    })
  }

  get items () {
    if (this._dirty === true) {
      this._sorted = Object.values(this._items).sort(this._sort)
    }

    return this._sorted
  }

  get length () {
    return Object.keys(this._items).length
  }

  addItem (item) {
    this._items[item.id] = item
    this._dirty = true
  }

  getItem (id) {
    return this._items[id]
  }
}
