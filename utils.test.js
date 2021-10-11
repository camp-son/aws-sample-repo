import { echo } from "./utils.js";

test('utils.js getUrl()', () => {
    expect(echo()).toBe('');
    expect(echo('Hello')).toBe('Hello');
    expect(echo(10)).toBe(10);
});
