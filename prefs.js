/* eslint no-unused-vars:
  ["error", { "varsIgnorePattern": "^(init|buildPrefsWidget)$" }] */

const Gtk = imports.gi.Gtk
const GdkPixbuf = imports.gi.GdkPixbuf
const ExtensionUtils = imports.misc.extensionUtils

let atPath = null
let schema = null

function init () {
  const Me = ExtensionUtils.getCurrentExtension()
  const Convenience = Me.imports.convenience

  schema = Convenience.getSettings()
  atPath = Me.path + '/icons/at.svg'
}

function buildPrefsWidget () {
  const label = new Gtk.Label()
  label.set_markup('<b>Your Twitter username</b>')
  label.set_alignment(0, 0.5) // x: left, y: centre

  const img = new Gtk.Image()
  img.set_margin_right(5)
  img.set_from_pixbuf(GdkPixbuf.Pixbuf.new_from_file_at_scale(atPath, 20, 20, true))

  const input = new Gtk.Entry({ text: schema.get_string('username') })
  input.set_sensitive(true)
  input.connect('changed', widget => schema.set_string('username', widget.get_text()))

  const field = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL })
  field.add(img)
  field.add(input)

  const layout = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 10,
    border_width: 10
  })

  layout.add(label)
  layout.add(field)
  layout.show_all()

  return layout
}
