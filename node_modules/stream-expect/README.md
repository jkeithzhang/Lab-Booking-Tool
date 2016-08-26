[![Build Status](https://travis-ci.org/rsolomo/node-stream-expect.png?branch=master)](https://travis-ci.org/rsolomo/node-stream-expect)

# node-stream-expect

stream-expect is a tool for controlling interactive streams.

## Installation

```shell
$ npm install stream-expect
```
## Usage

Checkout the [examples](https://github.com/rsolomo/node-stream-expect/tree/master/examples) for some sample usage.

### expect.createExpect(ReadStream, WriteStream, [options])

Returns a new Expect object.

- `ReadStream` - Object - A readable stream
- `WriteStream` - Object - A writeable stream
- `options` - Object
  - timeout - Number - Sets how long to wait before timing out, defaults to 10000

---
### expect.createExpect(DuplexStream, [options])

Similar to above, but stream is both readable and writeable.

---
### expect.spawn(command, [args], [options])

Convenience method for spawning a process, creating an Expect object, 
and using stdin and stdout for the read and write streams.

In other words this:

```javascript
var child = require('child_process').spawn(command)
var exp = expect.createExpect(child.stdin, child.stdout)
```

Could optionally be replaced with this:

```javascript
var exp = expect.spawn(command)
```

---
### .expect(regex, callback)
Watch stream for data matching regex. Here are the callback's arguments:

- `err` - Error|null - An error object will be returned if expect times out
- `output` - String - The output of the stream since method was called
- `match` - Array - The results of the successful regex
 
It's worth noting that regex matches will be non-greedy.

---
### .send(string)
Write to the writeable stream

## License
MIT