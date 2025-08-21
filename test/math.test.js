const test = require('node:test');
const assert = require('assert');
const math = require('../math');

test('firstBuyMath returns 0 on invalid input', () => {
  assert.strictEqual(math.firstBuyMath(undefined), 0);
  assert.strictEqual(math.firstBuyMath(''), 0);
});

test('calculateSuiForFirstBuy increases with desired tokens', () => {
  const a = math.calculateSuiForFirstBuy(1_000);
  const b = math.calculateSuiForFirstBuy(2_000);
  assert.ok(b > a);
});


