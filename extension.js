/* global imports */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^(init|enable|disable)$" }] */

const Lang = imports.lang
const Mainloop = imports.mainloop

// gi
const St = imports.gi.St
const Gtk = imports.gi.Gtk
const Clutter = imports.gi.Clutter

// ui
const Main = imports.ui.main
const PanelMenu = imports.ui.panelMenu
const PopupMenu = imports.ui.popupMenu

let loopId = null
let counter = null

const TweetCounter = Lang.Class({
  Name: 'TweetCounter',
  Extends: PanelMenu.Button,

  _init: function () {
    this.parent(null, 'TweetCounter')

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

    this.menuItem = new PopupMenu.PopupMenuItem('Tweet Counter', {})
    this.menu.addMenuItem(this.menuItem)
  },

  // TODO: Update *real* information
  _refresh: function () {
    this.label.set_text(Math.floor(Math.random() * 1000) + 'K')
    return true
  }
})

function init (meta) {
  const Theme = Gtk.IconTheme.get_default()
  Theme.append_search_path(meta.path + '/icons')
  if (counter === null) counter = new TweetCounter()
}

function enable () {
  Main.panel.addToStatusArea('tweet-counter', counter, 0)
  loopId = Mainloop.timeout_add_seconds(1, () => counter._refresh())
}

function disable () {
  if (counter !== null) counter.destroy()
  if (loopId !== null) Mainloop.source_remove(loopId)
}
