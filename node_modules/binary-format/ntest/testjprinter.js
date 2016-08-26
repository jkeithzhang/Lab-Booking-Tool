var should = require('should');

var jp = require('../src/jprinter');

var tbuffer = jDataView.createBuffer(0x00,
	0xff, 0xfe, 0xfd, 0xfc,
	0xfa, 0x00, 0xba, 0x01);

var buffer = new Buffer(9);
var view = new jDataView(buffer, 1, undefined, true);
var printer = new jPrinter(view);

function chr (x) {
	return String.fromCharCode(x);
}

describe('write uint', function() {
    describe('writeUint8', function() {
        it('writes to buffer', function() {
        	printer.seek(0);
			printer.parse('uint8', 255);
			printer.parse('uint8', 254);
            buffer.slice(1,3).should.eql(tbuffer.slice(1,3));
        });
    });
    describe('writeUint16', function() {
        it('writes to buffer', function() {
        	printer.seek(1);
			printer.parse('uint16', 65022);
            buffer.slice(2,4).should.eql(tbuffer.slice(2,4));
        });
    });
    describe('writeUint32', function() {
        it('writes to buffer', function() {
        	printer.seek(3);
        	printer.parse('uint32', 3120626428);
            buffer.slice(4,8).should.eql(tbuffer.slice(4,8));
        });
    });
});

describe('write int', function() {
    describe('writeInt8', function() {
        it('writes to buffer', function() {
        	printer.seek(0);
			printer.parse('int8', -1);
            buffer.slice(1,2).should.eql(tbuffer.slice(1,2));
        });
    });
    describe('writeInt16', function() {
        it('writes to buffer', function() {
        	printer.seek(1);
			printer.parse('int16', -514);
            buffer.slice(2,4).should.eql(tbuffer.slice(2,4));
        });
    });
    describe('writeInt32', function() {
        it('writes to buffer', function() {
        	printer.seek(3);
        	printer.parse('int32', -1174340868);
            buffer.slice(4,8).should.eql(tbuffer.slice(4,8));
        });
    });
});

describe('write float', function() {
    describe('writeFloat32', function() {
        it('writes to buffer', function() {
        	printer.seek(0);
			printer.parse('float32', -1.055058432344064e+37);
            buffer.slice(1,5).should.eql(tbuffer.slice(1,5));
            printer.seek(0);
            printer.parse('float32', -3.555058432344064e+37);
            buffer.slice(1,5).should.not.eql(tbuffer.slice(1,5));
        });
    });
    describe('writeFloat64', function() {
        it('writes to buffer', function() {
        	printer.seek(0);
        	printer.parse('float64', 2.426842827241402e-300);
            buffer.slice(1,9).should.eql(tbuffer.slice(1,9));
        });
    });
});

describe('write string', function() {
    describe('single char', function() {
        it('writes to buffer', function() {
        	printer.seek(5);
        	printer.parse('char', chr(0x00));
            buffer.slice(6,7).should.eql(tbuffer.slice(6,7));
        });
    });
    describe('string', function() {
        it('with chars > 128', function() {
        	printer.seek(6);
        	printer.parse(['string', 2], chr(0xba) + chr(0x01));
            buffer.slice(7,9).should.eql(tbuffer.slice(7,9));
        });
    });
});

describe('write array', function() {
    describe('with uint8', function() {
        it('writes to buffer', function() {
        	printer.seek(0);
			printer.parse(['array', 'uint8', 8],
				[0xff, 0xff, 0xfd, 0xfc, 0xfa, 0x00, 0xba, 0x01]);
            buffer.slice(1,9).should.not.eql(tbuffer.slice(1,9));
            printer.seek(0);
			printer.parse(['array', 'uint8', 8],
				[0xff, 0xfe, 0xfd, 0xfc, 0xfa, 0x00, 0xba, 0x01]);
            buffer.slice(1,9).should.eql(tbuffer.slice(1,9));
        });
    });
    describe('with int32', function() {
        it('writes to buffer', function() {
        	printer.seek(0);
			printer.parse(['array', 'int32', 2],[-50462977, 28967162]);
            buffer.slice(1,9).should.eql(tbuffer.slice(1,9));
        });
    });
});


describe('write object', function() {
    describe('with uint8', function() {
        it('writes to buffer', function() {
        	printer.seek(0);
			printer.parse({
				a: 'int32',
				b: 'int8',
				c: ['array', 'uint8', 2]
			}, {
				a: -5044977,
				b: -1,
				c: [0, 136]
			});
            buffer.slice(1,9).should.not.eql(tbuffer.slice(1,9));

            printer.seek(0);
			printer.parse({
				a: 'int32',
				b: 'int8',
				c: ['array', 'uint8', 2]
			}, {
				a: -50462977,
				b: -6,
				c: [0, 186]
			});
            buffer.slice(1,9).should.eql(tbuffer.slice(1,9));
        });
    });
});

describe('seek', function() {
    it('seeking', function() {
    	printer.seek(5);
		printer.tell().should.eql(5);
		printer.seek(printer.tell() - 2);
		printer.tell().should.eql(3);

		printer.seek(5, function () {
			printer.tell().should.eql(5);
			printer.seek(0);
			printer.tell().should.eql(0);
		});
		printer.tell().should.eql(3);
    });
});
/*
describe('bitfield', function() {
    it('writing', function() {
    	printer.seek(6);
		printer.parse({
			first5: 5,
			next5: function () {
				return this.parse(5);
			},
			last6: {
				first3: 3,
				last3: 3
			}
		}, {
			first5: 0x13,
			next5: 0x08,
			last6: {
				first3: 0,
				last3: 1
			}
		});
		buffer.slice(7,9).should.not.eql(tbuffer.slice(7,9));
		printer.seek(6);
		printer.parse({
			first5: 5,
			next5: function () {
				return this.parse(5);
			},
			last6: {
				first3: 3,
				last3: 3
			}
		}, {
			first5: 0x17,
			next5: 0x08,
			last6: {
				first3: 0,
				last3: 1
			}
		});
		buffer.slice(7,9).should.eql(tbuffer.slice(7,9));
    });
});
*/

describe('custom composite', function() {
    it('writing', function() {
		var printer2 = new jPrinter(view, {
			byte2 : ['array', 'uint8', 2],
			byte3 : ['array', 'uint8', 3],
			byte22 : ['array', 'byte2', 2],
			varstring : {
				len : 'uint8',
				str : ['array','byte2', function() {
					return this.current.len;
				}]
			}
		});
		printer2.seek(0);
		printer2.parse({
			a : 'byte2',
			b : 'byte22'
		}, {
			a : [0xff, 0xff],
			b : [[0xfd, 0xfc],[0xfa, 0x00]]
		});
		buffer.slice(1,7).should.not.eql(tbuffer.slice(1,7));
		printer2.seek(0);
		printer2.parse({
			a : 'byte2',
			b : 'byte22'
		}, {
			a : [0xff, 0xfe],
			b : [[0xfd, 0xfc],[0xfa, 0x00]]
		});
		buffer.slice(1,7).should.eql(tbuffer.slice(1,7));
		printer2.seek(1);
		printer2.parse('varstring', {
			len : 2,
			str : [[0xfd, 0xfe],[0xfa, 0x00]]
		});
		buffer.slice(3,7).should.not.eql(tbuffer.slice(3,7));

		printer2.seek(1);
		printer2.parse('varstring', {
			len : 2,
			str : [[0xfd, 0xfc],[0xfa, 0x00]]
		});
		buffer.slice(3,7).should.eql(tbuffer.slice(3,7));
    });
});
