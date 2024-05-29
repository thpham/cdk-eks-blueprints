"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeTextBetweenTokens = exports.escapeDots = exports.kebabToCamel = exports.atob = exports.btoa = void 0;
/**
 * Encode utf8 to Base64.
 * @param str
 * @returns
 */
function btoa(str) { return Buffer.from(str).toString('base64'); }
exports.btoa = btoa;
/**
 * Decode from base64 (to utf8).
 * @param b64Encoded
 * @returns
 */
function atob(b64Encoded) { return Buffer.from(b64Encoded, 'base64').toString(); }
exports.atob = atob;
/**
 * Convert kebab case string to camel case
 * @param string
 * @returns
 */
function kebabToCamel(str) { return str.replace(/-./g, x => x[1].toUpperCase()); }
exports.kebabToCamel = kebabToCamel;
/**
 * Escape the dots in the string
 * @param string
 * @returns
 */
function escapeDots(str) { return str.replace(/\./g, '\\.'); }
exports.escapeDots = escapeDots;
/**
 * Removes either text between given tokens or just the tokens themselves.
 * Example use case: YAML manipulation similar to Helm: openToken = "{{ if ... }}", closeToken = "{{ end }}""
 * @param string
 * @returns
 */
function changeTextBetweenTokens(str, openToken, closeToken, keep) {
    let regex;
    let regexString;
    if (keep) {
        regexString = ".*(" + openToken + "|" + closeToken + ").*\r?\n";
        regex = new RegExp(regexString, "g");
    }
    else {
        regexString = openToken + ".*" + closeToken;
        regex = new RegExp(regexString, "sg");
    }
    return str.replace(regex, '');
}
exports.changeTextBetweenTokens = changeTextBetweenTokens;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaW5nLXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL3V0aWxzL3N0cmluZy11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQTs7OztHQUlHO0FBQ0gsU0FBZ0IsSUFBSSxDQUFDLEdBQVcsSUFBSSxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUFqRixvQkFBaUY7QUFHakY7Ozs7R0FJRztBQUNILFNBQWdCLElBQUksQ0FBQyxVQUFrQixJQUFJLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQWpHLG9CQUFpRztBQUVqRzs7OztHQUlHO0FBQ0gsU0FBZ0IsWUFBWSxDQUFDLEdBQVcsSUFBSSxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQWpHLG9DQUFpRztBQUVqRzs7OztHQUlHO0FBQ0gsU0FBZ0IsVUFBVSxDQUFDLEdBQVcsSUFBSSxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUE3RSxnQ0FBNkU7QUFFN0U7Ozs7O0dBS0c7QUFDSCxTQUFnQix1QkFBdUIsQ0FBQyxHQUFXLEVBQUUsU0FBaUIsRUFBRSxVQUFrQixFQUFFLElBQWE7SUFDckcsSUFBSSxLQUFhLENBQUM7SUFDbEIsSUFBSSxXQUFtQixDQUFDO0lBQ3hCLElBQUksSUFBSSxFQUFDLENBQUM7UUFDTixXQUFXLEdBQUcsS0FBSyxHQUFHLFNBQVMsR0FBRyxHQUFHLEdBQUcsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUNoRSxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7U0FBTSxDQUFDO1FBQ0osV0FBVyxHQUFHLFNBQVMsR0FBRyxJQUFJLEdBQUcsVUFBVSxDQUFDO1FBQzVDLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVELE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDbEMsQ0FBQztBQVpELDBEQVlDIiwic291cmNlc0NvbnRlbnQiOlsiXG4vKipcbiAqIEVuY29kZSB1dGY4IHRvIEJhc2U2NC5cbiAqIEBwYXJhbSBzdHIgXG4gKiBAcmV0dXJucyBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ0b2Eoc3RyOiBzdHJpbmcpIHsgcmV0dXJuIEJ1ZmZlci5mcm9tKHN0cikudG9TdHJpbmcoJ2Jhc2U2NCcpOyB9XG5cblxuLyoqXG4gKiBEZWNvZGUgZnJvbSBiYXNlNjQgKHRvIHV0ZjgpLlxuICogQHBhcmFtIGI2NEVuY29kZWQgXG4gKiBAcmV0dXJucyBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGF0b2IoYjY0RW5jb2RlZDogc3RyaW5nKSB7IHJldHVybiBCdWZmZXIuZnJvbShiNjRFbmNvZGVkLCAnYmFzZTY0JykudG9TdHJpbmcoKTsgfVxuXG4vKipcbiAqIENvbnZlcnQga2ViYWIgY2FzZSBzdHJpbmcgdG8gY2FtZWwgY2FzZVxuICogQHBhcmFtIHN0cmluZ1xuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGtlYmFiVG9DYW1lbChzdHI6IHN0cmluZykgeyByZXR1cm4gc3RyLnJlcGxhY2UoLy0uL2csIHggPT4geFsxXS50b1VwcGVyQ2FzZSgpKTsgfVxuXG4vKipcbiAqIEVzY2FwZSB0aGUgZG90cyBpbiB0aGUgc3RyaW5nXG4gKiBAcGFyYW0gc3RyaW5nXG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlRG90cyhzdHI6IHN0cmluZykgeyByZXR1cm4gc3RyLnJlcGxhY2UoL1xcLi9nLCAnXFxcXC4nKTsgfVxuXG4vKipcbiAqIFJlbW92ZXMgZWl0aGVyIHRleHQgYmV0d2VlbiBnaXZlbiB0b2tlbnMgb3IganVzdCB0aGUgdG9rZW5zIHRoZW1zZWx2ZXMuXG4gKiBFeGFtcGxlIHVzZSBjYXNlOiBZQU1MIG1hbmlwdWxhdGlvbiBzaW1pbGFyIHRvIEhlbG06IG9wZW5Ub2tlbiA9IFwie3sgaWYgLi4uIH19XCIsIGNsb3NlVG9rZW4gPSBcInt7IGVuZCB9fVwiXCJcbiAqIEBwYXJhbSBzdHJpbmdcbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGFuZ2VUZXh0QmV0d2VlblRva2VucyhzdHI6IHN0cmluZywgb3BlblRva2VuOiBzdHJpbmcsIGNsb3NlVG9rZW46IHN0cmluZywga2VlcDogYm9vbGVhbikge1xuICAgIGxldCByZWdleDogUmVnRXhwO1xuICAgIGxldCByZWdleFN0cmluZzogc3RyaW5nO1xuICAgIGlmIChrZWVwKXtcbiAgICAgICAgcmVnZXhTdHJpbmcgPSBcIi4qKFwiICsgb3BlblRva2VuICsgXCJ8XCIgKyBjbG9zZVRva2VuICsgXCIpLipcXHI/XFxuXCI7XG4gICAgICAgIHJlZ2V4ID0gbmV3IFJlZ0V4cChyZWdleFN0cmluZywgXCJnXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJlZ2V4U3RyaW5nID0gb3BlblRva2VuICsgXCIuKlwiICsgY2xvc2VUb2tlbjtcbiAgICAgICAgcmVnZXggPSBuZXcgUmVnRXhwKHJlZ2V4U3RyaW5nLCBcInNnXCIpO1xuICAgIH1cblxuICAgIHJldHVybiBzdHIucmVwbGFjZShyZWdleCwgJycpO1xufVxuIl19