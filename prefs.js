/* eslint no-unused-vars:
  ["error", { "varsIgnorePattern": "^(init|buildPrefsWidget)$" }] */

const Gtk = imports.gi.Gtk
const ExtensionUtils = imports.misc.extensionUtils
const createPixbuf = imports.gi.GdkPixbuf.Pixbuf.new_from_file_at_scale

let path = null
let layout = null
let settings = null

function init () {
  const Me = ExtensionUtils.getCurrentExtension()
  const Convenience = Me.imports.convenience

  path = Me.path
  settings = Convenience.getSettings()
}

function addSetting ({ title, icon, control }) {
  const label = new Gtk.Label()
  label.set_markup(`<b>${title}</b>`)
  label.set_alignment(0, 0.5) // x: left, y: centre
  layout.add(label)

  if (!icon) return layout.add(control)

  const img = new Gtk.Image()
  img.set_margin_right(5)
  img.set_from_pixbuf(createPixbuf(`${path}/icons/${icon}.svg`, 20, 20, true))

  const field = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL })
  field.add(img)
  field.add(control)
  layout.add(field)
}

function buildPrefsWidget () {
  layout = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 10,
    border_width: 10
  })

  const username = new Gtk.Entry({ text: settings.get_string('username') })
  const compact = new Gtk.CheckButton({
    active: settings.get_boolean('compact'),
    label: 'Abbreviate large number. (81800 -> 81.8K)'
  })

  username.connect('changed', widget => settings.set_string('username', widget.get_text()))
  compact.connect('toggled', widget => settings.set_boolean('compact', widget.get_active()))

  addSetting({ control: username, title: 'Your Twitter username', icon: 'at' })
  addSetting({ control: compact, title: 'Compact count' })

  layout.show_all()
  return layout
}
