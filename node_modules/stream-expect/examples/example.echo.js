var expect = require('../index')

var exp = expect.spawn('echo', ['test'])
exp.expect(/test/, function(err, output, match) {
  console.log('OUTPUT ---\n' + output)
})
