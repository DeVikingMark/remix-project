'use strict'
var React = require('react')
var BasicPanel = require('./basicPanel')

module.exports = React.createClass({
  contextTypes: {
    traceManager: React.PropTypes.object,
    web3: React.PropTypes.object
  },

  getDefaultProps: function () {
    return {
      currentStepIndex: -1
    }
  },

  getInitialState: function () {
    return {
      data: null
    }
  },

  render: function () {
    return (
      <BasicPanel name='Memory' data={this.state.data} />
    )
  },

  componentWillReceiveProps: function (nextProps) {
    if (nextProps.currentStepIndex < 0) return
    if (window.ethDebuggerSelectedItem !== nextProps.currentStepIndex) return

    var self = this
    this.context.traceManager.getMemoryAt(nextProps.currentStepIndex, function (error, memory) {
      if (error) {
        console.log(error)
      } else if (window.ethDebuggerSelectedItem === nextProps.currentStepIndex) {
        self.setState({
          data: self.formatMemory(memory, 16)
        })
      }
    })
  },

  formatMemory: function (mem, width) {
    var ret = ''
    if (!mem) {
      return ret
    }

    if (!mem.substr) {
      mem = mem.join('') // geth returns an array, eth return raw string
    }

    for (var k = 0; k < mem.length; k += (width * 2)) {
      var memory = mem.substr(k, width * 2)
      var content = this.tryAsciiFormat(memory)
      ret += this.context.web3.toHex(k) + '   ' + content.raw + ' ' + content.ascii + '\n'
    }
    return ret
  },

  tryAsciiFormat: function (memorySlot) {
    var ret = { ascii: '', raw: '' }
    for (var k = 0; k < memorySlot.length; k += 2) {
      var raw = memorySlot.substr(k, 2)
      var ascii = this.context.web3.toAscii(raw)
      if (ascii === String.fromCharCode(0)) {
        ret.ascii += '?'
      } else {
        ret.ascii += ascii
      }
      ret.raw += ' ' + raw
    }
    return ret
  }
})
