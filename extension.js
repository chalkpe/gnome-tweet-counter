
const St = imports.gi.St
const Clutter = imports.gi.Clutter

const Main = imports.ui.main
const Tweener = imports.ui.tweener

let text, button, metadata;

function _hideHello() {
Main.uiGroup.remove_actor(text);
text = null;
}

function _showHello() {
  if (!text) {
    text = new St.Label({
      style_class: 'helloworld-label',
      text: 'wowzzzz' + JSON.stringify(metadata)
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
    y_align: Clutter.ActorAlign.CENTER,
    text: '31.5K'
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
}

function disable() {
  Main.panel._rightBox.remove_child(button)
}
