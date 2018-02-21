/* eslint no-unused-vars:
  ["error", { "varsIgnorePattern": "^(init|enable|disable)$" }] */

const Lang = imports.lang
const Mainloop = imports.mainloop

// gi
const St = imports.gi.St
const Gtk = imports.gi.Gtk
const Soup = imports.gi.Soup
const Clutter = imports.gi.Clutter

// ui
const Main = imports.ui.main
const PanelMenu = imports.ui.panelMenu
const PopupMenu = imports.ui.popupMenu

// pref
const Util = imports.misc.util
const ExtensionUtils = imports.misc.extensionUtils
const Me = ExtensionUtils.getCurrentExtension()

let schema = null
let loopId = null
let counter = null
let session = new Soup.SessionAsync()

const url = 'https://twitter.com/'
const regex = /ProfileNav-item--tweets[\s\S]*?data-count=(\d+)[\s\S]*?data-is-compact="(.*?)"[\s\S]*?>[\s\S]*?(.*)[\s\S]*?<\/span>/g

const TweetCounter = Lang.Class({
  Name: 'TweetCounter',
  Extends: PanelMenu.Button,

  _init: function () {
    this.parent(null, 'TweetCounter')
    const id = '@' + schema.get_string('username')

    this.box = new St.BoxLayout()
    this.actor.add_actor(this.box)

    this.box.add_actor(this.icon = new St.Icon({
      icon_name: 'tweet-larry',
      style_class: 'system-status-icon'
    }))

    this.box.add_actor(this.label = new St.Label({
      text: ':thinking:',
      y_align: Clutter.ActorAlign.CENTER
    }))

    this.menuItem = new PopupMenu.PopupMenuItem('Twitter Settings', {})
    this.menuItem.connect('activate', () => Util.spawn(['gnome-shell-extension-prefs', Me.metadata.uuid]))

    this.menu.addMenuItem(new PopupMenu.PopupMenuItem(id, {}))
    this.menu.addMenuItem(this.menuItem)
  },

  _refresh: function () {
    const username = schema.get_string('username')
    const req = Soup.Message.new('GET', url + username)

    session.queue_message(req, () => {
      const m = regex.exec(req.response_body.data)
      if (m !== null) this.label.set_text(m[1])
    })

    return true
  }
})

function init (meta) {
  const Theme = Gtk.IconTheme.get_default()
  Theme.append_search_path(meta.path + '/icons')
  schema = Me.imports.convenience.getSettings()
}

function enable () {
  if (counter === null) counter = new TweetCounter()
  Main.panel.addToStatusArea('tweet-counter', counter, 0)
  loopId = Mainloop.timeout_add_seconds(3, () => counter._refresh())
}

function disable () {
  if (counter !== null) counter.destroy()
  if (loopId !== null) Mainloop.source_remove(loopId)
}
