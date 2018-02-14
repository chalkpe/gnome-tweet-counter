const St = imports.gi.St
const Clutter = imports.gi.Clutter

const Lang = imports.lang
const Main = imports.ui.main
const Mainloop = imports.mainloop
const Tweener = imports.ui.tweener

let loopId = null
let text, button, metadata, counter

function _hideHello() {
  Main.uiGroup.remove_actor(text)
  text = null
}

function _showHello(zzz) {
  if (!text) {
    text = new St.Label({
      text: zzz + ' zzz?',
      style_class: 'helloworld-label'
    })

    Main.uiGroup.add_actor(text)
  }

  let monitor = Main.layoutManager.primaryMonitor
  text.set_position(
    monitor.x + Math.floor(monitor.width / 2 - text.width / 2),
    monitor.y + Math.floor(monitor.height / 2 - text.height / 2)
  )

  text.opacity = 255
  Tweener.addTween(text, {
    time: 2,
    opacity: 0,
    transition: 'easeOutQuad',
    onComplete: _hideHello
  })
}

function init(meta) {
  let theme = imports.gi.Gtk.IconTheme.get_default()
  theme.append_search_path(meta.path + '/icons')

  button = new St.Bin({
    style_class: 'panel-button',
    reactive: true,
    can_focus: true,
    x_fill: true,
    y_fill: false,
    track_hover: true
  })

  let counter = new St.Label({
    y_align: Clutter.ActorAlign.CENTER
  })

  let icon = new St.Icon({
    icon_name: 'tweet-larry',
    style_class: 'system-status-icon'
  })

  let box = new St.BoxLayout()
  box.add_actor(icon)
  box.add_actor(counter)

  button.set_child(box)
  button.connect('button-press-event', _showHello)
}

function enable() {
  Main.panel._rightBox.insert_child_at_index(button, 0)
  loopId = Mainloop.timeout_add_seconds(3, onRefresh)
}

function onRefresh () {
  _showHello(Math.random())
  counter.set_text(Math.floor(Math.random() * 1000) + 'K')

  return true
}

function disable() {
  Main.panel._rightBox.remove_child(button)
  Mainloop.source_remove(loopId)
}
