#!/usr/bin/env node
/*eslint-disable */
require('babel-core/register')({
  presets: ['es2015', 'stage-3'],
})
require('babel-polyfill')

var program = require('commander')
var prettyjson = require('prettyjson')
var autopublish = require('./autopublish').default

program.version(require('./package').version)

program.command('readrss <feedurl>')
  .description('read rss and show items')
  .action(function(feedurl) {
    autopublish.read(feedurl).then(function(items) {
      console.log(prettyjson.render(items))
    })
  })

program.command('publish <feedurl> <pageId> <accessToken>')
  .description('publish items to fb')
  .action(function(feedurl, pageId, accessToken) {
    autopublish.publish(feedurl, pageId, accessToken)
  })

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}