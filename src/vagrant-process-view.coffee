{View} = require 'atom-space-pen-views';

class VagrantProcessView extends View
  @content: ->
    @div class: 'vagrant-status inline-block', =>
      @span class: 'icon-vagrant', outlet: 'status', tabindex: -1, ''

module.exports = VagrantProcessView
