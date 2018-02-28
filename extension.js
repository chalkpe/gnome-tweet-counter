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

let loopId = null
let counter = null
let settings = null

// networking
const url = 'https://twitter.com/'
const session = new Soup.SessionAsync()
const cookies = [Soup.Cookie.parse('lang=en-gb;', new Soup.URI(url))]
const regex = /ProfileNav-item--tweets[\s\S]*?data-count=(\d+)[\s\S]*?data-is-compact="(.*?)"[\s\S]*?>[\s\S]*?(.*)[\s\S]*?<\/span>/g

// widget
const TweetCounter = Lang.Class({
  Name: 'TweetCounter',
  Extends: PanelMenu.Button,

  _init: function () {
    this.parent(null, 'TweetCounter')
    this.counts = [':thinking_face:', ':thinking:']

    this.box = new St.BoxLayout()
    this.actor.add_actor(this.box)

    this.box.add_actor(this.icon = new St.Icon({
      icon_name: 'tweet-larry',
      style_class: 'system-status-icon'
    }))

    this.box.add_actor(this.countLabel = new St.Label({
      y_align: Clutter.ActorAlign.CENTER
    }))

    this.profileMenu = new PopupMenu.PopupMenuItem('@thinking', {})
    this.settingsMenu = new PopupMenu.PopupMenuItem('Twitter Settings', {})

    this.profileMenu.connect('activate', () => Util.spawn(['xdg-open', url + this.username]))
    this.settingsMenu.connect('activate', () => Util.spawn(['gnome-shell-extension-prefs', Me.metadata.uuid]))

    this.menu.addMenuItem(this.profileMenu)
    this.menu.addMenuItem(this.settingsMenu)

    this._setup('compact')
    this._setup('username')
  },

  _setup: function (key) {
    if (key === 'username') {
      this.username = settings.get_string('username')
      this.profileMenu.label.set_text('@' + this.username)
    } else if (key === 'compact') {
      this.compact = settings.get_boolean('compact')
      this.countLabel.set_text(this.counts[+this.compact])
    }
  },

  _refresh: function () {
    const req = Soup.Message.new('GET', url + this.username)
    Soup.cookies_to_request(cookies, req)

    session.queue_message(req, () => {
      const m = regex.exec(req.response_body.data)
      if (m === null) return // this.countLabel.set_text(':cry:')

      this.counts = [m[1], m[m[2] === 'true' ? 3 : 1]]
      this.countLabel.set_text(this.counts[+this.compact])
    })

    return true
  }
})

function init (meta) {
  const Theme = Gtk.IconTheme.get_default()
  Theme.append_search_path(meta.path + '/icons')

  settings = Me.imports.convenience.getSettings()
  settings.connect('changed', (settings, key) => counter._setup(key))
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
