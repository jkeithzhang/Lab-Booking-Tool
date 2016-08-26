/*
 * This example is dependent upon ssh2
 * 
 * https://github.com/mscdex/ssh2
 */

var Connection = require('ssh2')
var expect = require('../index')

var c = new Connection()
c.on('ready', function() {
  c.shell(function(err, stream) {
    if (err) throw err

    // Use ssh Connection as read and write stream
    var exp = expect.createExpect(stream)
    
    // Expect shell prompt
    exp.expect(/> |\$ |# /, function(err, output, match) {
      if (err) throw err
      console.log('OUTPUT:\n' + output)
      exp.send('ls\n')
      exp.expect(/> |\$ |# /, function(err, output, match) {
          if (err) throw err
          console.log('OUTPUT:\n' + output)
          stream.destroy()
        })
    })

    stream.on('exit', function(code, signal) {
      c.end()
    })
  })
})
c.connect({
  host: '127.0.0.1',
  port: 22,
  username: 'youruser',
  password: 'yourpass'
})