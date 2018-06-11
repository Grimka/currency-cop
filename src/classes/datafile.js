const fs = window.require('fs')

class DataFile {
  constructor (type, filename, logger, defaultObj) {
    this.filename = filename
    this.log = (logger ? logger.topic : CC.Logger.topic)(type)
    this.wait = 300
    this.timeout = null
    this.load(defaultObj || {})
  }

  get (key) {
    return this.data[key]
  }

  set (key, value) {
    this.data[key] = value
    this.save(this.data)
    return this
  }

  load (defaultObj) {
    try {
      this.log.launch(`Loading file`, { name: this.filename })
      this.data = JSON.parse(fs.readFileSync(this.filename))
    } catch(error) {
      this.log.error(`unable to load file`, { name: this.filename, reason: error.message })
      this.data = defaultObj
    }

    return this
  }

  _write () {
    try {
      this.log.receive(`Save file request`, { name: this.filename })
      fs.writeFileSync(this.filename, JSON.stringify(this.data))
    } catch (error) {
      this.log.error(`unable to save file`, { name: this.filename, reason: error.message })
    }

    return this
  }

  save (data) {
    try {
      if (this.timeout) {
        clearTimeout(this.timeout)
        this.timeout = null
      }

      if (!this.timeout) {
        this.timeout = setTimeout(() => {
          this._write()
        }, this.wait)
      }
    } catch (e) {
      this.log.error('???', e)
    }

    this.data = data

    return this
  }
}

export default DataFile