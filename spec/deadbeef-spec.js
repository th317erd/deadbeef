/* eslint-disable no-magic-numbers */

'use strict';

/* global describe, expect, it */

const deadbeef = require('../lib');

describe('deadbeef', () => {
  describe('can create unique combo ids', () => {
    it('should work properly with strings', () => {
      expect(deadbeef('test')).not.toBe('test');
      expect(deadbeef('')).toBe(deadbeef(''));
      expect(deadbeef('')).not.toBe(deadbeef(' '));
      expect(deadbeef('', '')).not.toBe(deadbeef(''));
      expect(deadbeef('', '')).toBe(deadbeef('', ''));
      expect(deadbeef('test', 'test')).toBe(deadbeef('test', 'test'));
      expect(deadbeef('test', 'test')).not.toBe(deadbeef('test', 'test2'));
    });

    it('should work properly with numbers', () => {
      expect(deadbeef(0)).not.toBe(0);
      expect(deadbeef(0)).not.toBe(deadbeef(-0));
      expect(deadbeef(0)).not.toBe(deadbeef(-0));
      expect(deadbeef(1)).toBe('1:number:+1');
      expect(deadbeef(-1)).toBe('1:number:-1');
      expect(deadbeef(1)).toBe(deadbeef(1));
      expect(deadbeef(1, 2)).not.toBe(deadbeef(1, 1));
      expect(deadbeef(1, 2)).toBe(deadbeef(1, 2));
      expect(deadbeef(-0, +0)).toBe(deadbeef(-0, +0));
      expect(deadbeef(-0, +0)).not.toBe(deadbeef(+0, -0));
      expect(deadbeef(NaN)).not.toBe(deadbeef(Infinity));
      expect(deadbeef(NaN, Infinity)).not.toBe(deadbeef(Infinity));
      expect(deadbeef(NaN, Infinity)).not.toBe(deadbeef(NaN));
      expect(deadbeef(NaN)).toBe(deadbeef(NaN));
      expect(deadbeef(Infinity)).toBe(deadbeef(Infinity));
    });

    it('should work properly with bigint', () => {
      expect(deadbeef(BigInt(0))).not.toBe(0);
      expect(deadbeef(BigInt(0))).toBe(deadbeef(BigInt(-0)));
      expect(deadbeef(BigInt(0))).toBe('1:bigint:+0');
      expect(deadbeef(BigInt(-1))).toBe('1:bigint:-1');
      expect(deadbeef(BigInt(1))).not.toBe(deadbeef(1));
      expect(deadbeef(BigInt(1))).toBe(deadbeef(BigInt(1)));
      expect(deadbeef(BigInt(1), 2)).not.toBe(deadbeef(1, 1));
      expect(deadbeef(BigInt(1), 2)).toBe(deadbeef(BigInt(1), 2));
      expect(deadbeef(NaN)).not.toBe(deadbeef(Infinity));
      expect(deadbeef(NaN, Infinity)).not.toBe(deadbeef(Infinity));
      expect(deadbeef(NaN, Infinity)).not.toBe(deadbeef(NaN));
      expect(deadbeef(NaN)).toBe(deadbeef(NaN));
      expect(deadbeef(Infinity)).toBe(deadbeef(Infinity));
    });

    it('should work properly with booleans', () => {
      expect(deadbeef(0)).not.toBe(deadbeef(false));
      expect(deadbeef(true)).toBe(deadbeef(true));
      expect(deadbeef(true, true)).not.toBe(deadbeef(true, false));
      expect(deadbeef(false, true)).not.toBe(deadbeef(true, false));
      expect(deadbeef(false, true)).toBe(deadbeef(false, true));
      expect(deadbeef(false, true)).toBe(deadbeef(false, true));
    });

    it('should work properly with null and undefined', () => {
      expect(deadbeef(null)).not.toBe(deadbeef(undefined));
      expect(deadbeef(null)).toBe(deadbeef(null));
      expect(deadbeef(undefined)).toBe(deadbeef(undefined));
    });

    it('should work properly with functions', () => {
      const test1 = () => {};
      const test2 = () => {};

      expect(deadbeef(test1)).toBe(deadbeef(test1));
      expect(deadbeef(test1)).not.toBe(deadbeef(test1, test1));
      expect(deadbeef(test1, true)).toBe(deadbeef(test1, true));
      expect(deadbeef(test1, true)).not.toBe(deadbeef(test1, false));
      expect(deadbeef(test1)).not.toBe(deadbeef(test2));
      expect(deadbeef(test2)).toBe(deadbeef(test2));
    });

    it('should work properly with objects', () => {
      const test1 = {};
      const test2 = {};

      expect(deadbeef(test1)).toBe(deadbeef(test1));
      expect(deadbeef(test1)).not.toBe(deadbeef(test1, test1));
      expect(deadbeef(test1, true)).toBe(deadbeef(test1, true));
      expect(deadbeef(test1, true)).not.toBe(deadbeef(test1, false));
      expect(deadbeef(test1)).not.toBe(deadbeef(test2));
      expect(deadbeef(test2)).toBe(deadbeef(test2));
    });

    it('should work properly with symbols', () => {
      const test1 = Symbol.for('test1');
      const test2 = Symbol.for('test2');

      expect(deadbeef(test1)).toBe(deadbeef(test1));
      expect(deadbeef(test1)).not.toBe(deadbeef(test1, test1));
      expect(deadbeef(test1, true)).toBe(deadbeef(test1, true));
      expect(deadbeef(test1, true)).not.toBe(deadbeef(test1, false));
      expect(deadbeef(test1)).not.toBe(deadbeef(test2));
      expect(deadbeef(test2)).toBe(deadbeef(test2));
    });

    it('should work properly with custom id generators', () => {
      class Test1 {}

      let a = new Test1();
      let b = new Test1();

      expect(deadbeef(a)).not.toBe(deadbeef(b));

      b[deadbeef.idSym] = () => a;

      expect(deadbeef(a)).toBe(deadbeef(b));
    });

    it('shouldn\'t infinitely recurse with custom id generators', () => {
      class Test1 {}

      let a = new Test1();
      let b = new Test1();

      expect(deadbeef(a)).not.toBe(deadbeef(b));

      b[deadbeef.idSym] = () => b;

      expect(deadbeef(a)).not.toBe(deadbeef(b));
      expect(deadbeef(b)).toBe(deadbeef(b));
    });

    it('should work properly sorted', () => {
      const test1 = Symbol.for('test1');
      const test2 = Symbol.for('test2');

      expect(deadbeef.sorted(test1, test2)).toBe(deadbeef.sorted(test1, test2));
      expect(deadbeef.sorted(test1, test2)).toBe(deadbeef.sorted(test2, test1));
      expect(deadbeef.sorted(1, 2, 3, 4, 5, 6)).toBe(deadbeef.sorted(4, 2, 6, 1, 5, 3));
    });
  });

  // Needs a profiler to properly run
  // fdescribe('memory', () => {
  //   it('doesn\'t eat memory like a hungry hog...', async () => {
  //     const genCount = 10000;

  //     const next = async (index) => {
  //       if (index > 100)
  //         return;

  //       const genFunc = (i) => {
  //         var a = {};
  //         return () => a + i;
  //       };

  //       for (let i = 0; i < genCount; i++) {
  //         deadbeef(Math.random(), Math.random(), Math.random());
  //         deadbeef(i, `test${i}`);
  //         deadbeef(true, false);
  //         deadbeef(BigInt(i));
  //         deadbeef(genFunc(i));
  //       }

  //       return new Promise((resolve) => {
  //         setTimeout(async () => {
  //           await next(index + 1);
  //           resolve();
  //         }, 10);
  //       });
  //     };

  //     await next(0);
  //   });
  // });
});
