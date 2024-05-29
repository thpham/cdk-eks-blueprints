"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateConstraints = exports.InternetHostStringConstraint = exports.CompositeConstraint = exports.GenericRegexStringConstraint = exports.ArrayConstraint = exports.NumberConstraint = exports.UrlStringConstraint = exports.StringConstraint = void 0;
const zod_1 = require("zod");
/**
 * This validates if the given string (value) is within the bounds of min to max inclusive. If not a detailed Zod Error is thrown also utilizing the identifier for context.
 */
class StringConstraint {
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }
    validate(key, value, identifier) {
        var _a, _b;
        if (value != undefined)
            zod_1.z.string()
                .min((_a = this.min) !== null && _a !== void 0 ? _a : 0, { message: `${key} (${identifier}: ${value}) must be no less than ${this.min} characters long.` })
                .max((_b = this.max) !== null && _b !== void 0 ? _b : 63, { message: `${key} (${identifier}: ${value}) must be no more than ${this.max} characters long.` })
                .parse(value);
    }
}
exports.StringConstraint = StringConstraint;
/**
 * This is the same as StringConstraint, but also checks if the given string is a correctly formatted URL. If not a detailed Zod Error is thrown also utilizing the identifier for context.
 */
class UrlStringConstraint {
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }
    validate(key, value, identifier) {
        var _a, _b;
        if (value != undefined) {
            zod_1.z.string().url({ message: `${key} (${identifier}: ${value}) must be a URL formatted correctly.` }).parse(value);
            zod_1.z.string()
                .min((_a = this.min) !== null && _a !== void 0 ? _a : 0, { message: `${key} (${identifier}: ${value}) must be a URL no less than ${this.min} characters long.` })
                .max((_b = this.max) !== null && _b !== void 0 ? _b : 100, { message: `${key} (${identifier}: ${value}) must be a URL no more than ${this.max} characters long.` })
                .parse(value);
        }
    }
}
exports.UrlStringConstraint = UrlStringConstraint;
/**
 * This class checks if the given number (value) is within the bounds of the given min and max inclusive number bounds. If not a detailed Zod Error is thrown also utilizing the identifier for context.
 */
class NumberConstraint {
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }
    validate(key, value, identifier) {
        var _a, _b;
        if (value != undefined)
            zod_1.z.number()
                .gte((_a = this.min) !== null && _a !== void 0 ? _a : 1, { message: `${key} (${identifier}: ${value}) must be no less than ${this.min} nodes.` })
                .lte((_b = this.max) !== null && _b !== void 0 ? _b : 3, { message: `${key} (${identifier}: ${value}) must be no more than ${this.max} nodes.` })
                .parse(value);
    }
}
exports.NumberConstraint = NumberConstraint;
/**
 * This works just like NumberConstraint but checks the length of the given value for an expected array. If not a detailed Zod Error is thrown also utilizing the identifier for context.
 */
class ArrayConstraint {
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }
    validate(key, value, identifier) {
        var _a, _b;
        if (value != undefined)
            zod_1.z.number()
                .gte((_a = this.min) !== null && _a !== void 0 ? _a : 1, { message: `${key} (${identifier} of length: ${value.length}) must be no less than ${this.min} node groups.` })
                .lte((_b = this.max) !== null && _b !== void 0 ? _b : 3, { message: `${key} (${identifier} of length: ${value.length}) must be no more than ${this.max} node groups.` })
                .parse(value.length);
    }
}
exports.ArrayConstraint = ArrayConstraint;
/**
 * Checks whether a given string matches the regex.  If not, a detailed Zod Error is thrown.
 */
class GenericRegexStringConstraint {
    constructor(regex) {
        this.regex = regex;
    }
    validate(key, value, identifier) {
        var _a;
        if (value != undefined)
            zod_1.z.string()
                .regex((_a = this.regex) !== null && _a !== void 0 ? _a : new RegExp('.*'), { message: `${key} (${identifier}) must match regular expression ${this.regex}.` })
                .parse(value);
    }
}
exports.GenericRegexStringConstraint = GenericRegexStringConstraint;
/**
 * Contains a list of constraints and checks whether a given value meets each constraint.  If not, a detailed Zod Error is thrown for that constraint.
 */
class CompositeConstraint {
    constructor(...constraints) {
        this.constraints = constraints;
    }
    validate(key, value, identifier) {
        this.constraints.forEach(constraint => {
            constraint.validate(key, value, identifier);
        });
    }
}
exports.CompositeConstraint = CompositeConstraint;
/**
 * Checks whether a given string matches the regex for RFC 1123.  If not, a detailed Zod Error is thrown.
 */
class InternetHostStringConstraint extends CompositeConstraint {
    constructor() {
        super(new GenericRegexStringConstraint(new RegExp('^(?![0-9]+$)(?!.*-$)(?!-)[a-zA-Z0-9-]*$')), new StringConstraint(1, 63));
    }
}
exports.InternetHostStringConstraint = InternetHostStringConstraint;
/**
 * This function validates the given object by the given constraints, and returns an error that uses the given context if needed.
 * @param constraints This is the keys of the object with specified values for validation.
 * @param context Object type name for error context purposes.
 * @param object The given object type, an array of or only a single object, to be validated.
 * @returns throws a Zod Error if validations are broken.
 */
function validateConstraints(constraints, context, ...object) {
    if (object != undefined)
        for (let i = 0; i < object.length; i++) {
            for (let k in constraints) {
                const constraint = constraints[k];
                constraint.validate(context + "." + k, object[i][k], k);
            }
        }
}
exports.validateConstraints = validateConstraints;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RyYWludHMtdXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvdXRpbHMvY29uc3RyYWludHMtdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkJBQXdCO0FBU3hCOztHQUVHO0FBQ0gsTUFBYSxnQkFBZ0I7SUFFekIsWUFBcUIsR0FBWSxFQUFXLEdBQVk7UUFBbkMsUUFBRyxHQUFILEdBQUcsQ0FBUztRQUFXLFFBQUcsR0FBSCxHQUFHLENBQVM7SUFBSSxDQUFDO0lBRTdELFFBQVEsQ0FBQyxHQUFXLEVBQUUsS0FBVSxFQUFFLFVBQWtCOztRQUVoRCxJQUFJLEtBQUssSUFBSSxTQUFTO1lBQ2xCLE9BQUMsQ0FBQyxNQUFNLEVBQUU7aUJBQ0wsR0FBRyxDQUFDLE1BQUEsSUFBSSxDQUFDLEdBQUcsbUNBQUksQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLEdBQUcsR0FBRyxLQUFLLFVBQVUsS0FBSyxLQUFLLDBCQUEwQixJQUFJLENBQUMsR0FBRyxtQkFBbUIsRUFBRSxDQUFDO2lCQUNySCxHQUFHLENBQUMsTUFBQSxJQUFJLENBQUMsR0FBRyxtQ0FBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsR0FBRyxHQUFHLEtBQUssVUFBVSxLQUFLLEtBQUssMEJBQTBCLElBQUksQ0FBQyxHQUFHLG1CQUFtQixFQUFFLENBQUM7aUJBQ3RILEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMxQixDQUFDO0NBQ0o7QUFaRCw0Q0FZQztBQUVEOztHQUVHO0FBQ0gsTUFBYSxtQkFBbUI7SUFFNUIsWUFBcUIsR0FBWSxFQUFXLEdBQVk7UUFBbkMsUUFBRyxHQUFILEdBQUcsQ0FBUztRQUFXLFFBQUcsR0FBSCxHQUFHLENBQVM7SUFBSSxDQUFDO0lBRTdELFFBQVEsQ0FBQyxHQUFXLEVBQUUsS0FBVSxFQUFFLFVBQWtCOztRQUVoRCxJQUFJLEtBQUssSUFBSSxTQUFTLEVBQUUsQ0FBQztZQUVyQixPQUFDLENB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R0FBZSxXQUFXLENBQUMsQ0FBQyxDQUFFLENBQUM7Z0JBQy9DLFVBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFHLEdBQUcsR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzVELENBQUM7UUFDTCxDQUFDO0FBQ1QsQ0FBQztBQVRELGtEQVNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgeiB9IGZyb20gXCJ6b2RcIjtcblxuLyoqXG4gKiBUaGlzIGlzIGludGVyZmFjZSBmb3IgdGhlIGNvbnN0cmFpbnRzIG5lZWRlZCB0byB0ZXN0IGFza2luZyBmb3IgdGhlIGtleSBuYW1lIG9mIHRoZSBvYmplY3QsIHRoZSB2YWx1ZSBiZWluZyB0ZXN0ZWQsIGFuZCBjb250ZXh0IGZvciBkZXRhaWxlZCBab2QgZXJyb3JzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbnN0cmFpbnQge1xuICAgIHZhbGlkYXRlKGtleTogc3RyaW5nLCB2YWx1ZTogYW55LCBpZGVudGlmaWVyOiBzdHJpbmcpOiBhbnk7XG59XG5cbi8qKlxuICogVGhpcyB2YWxpZGF0ZXMgaWYgdGhlIGdpdmVuIHN0cmluZyAodmFsdWUpIGlzIHdpdGhpbiB0aGUgYm91bmRzIG9mIG1pbiB0byBtYXggaW5jbHVzaXZlLiBJZiBub3QgYSBkZXRhaWxlZCBab2QgRXJyb3IgaXMgdGhyb3duIGFsc28gdXRpbGl6aW5nIHRoZSBpZGVudGlmaWVyIGZvciBjb250ZXh0LlxuICovXG5leHBvcnQgY2xhc3MgU3RyaW5nQ29uc3RyYWludCBpbXBsZW1lbnRzIENvbnN0cmFpbnQge1xuXG4gICAgY29uc3RydWN0b3IocmVhZG9ubHkgbWluPzogbnVtYmVyLCByZWFkb25seSBtYXg/OiBudW1iZXIpIHsgfVxuXG4gICAgdmFsaWRhdGUoa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnksIGlkZW50aWZpZXI6IHN0cmluZykge1xuXG4gICAgICAgIGlmICh2YWx1ZSAhPSB1bmRlZmluZWQpXG4gICAgICAgICAgICB6LnN0cmluZygpXG4gICAgICAgICAgICAgICAgLm1pbih0aGlzLm1pbiA/PyAwLCB7IG1lc3NhZ2U6IGAke2tleX0gKCR7aWRlbnRpZmllcn06ICR7dmFsdWV9KSBtdXN0IGJlIG5vIGxlc3MgdGhhbiAke3RoaXMubWlufSBjaGFyYWN0ZXJzIGxvbmcuYCB9KVxuICAgICAgICAgICAgICAgIC5tYXgodGhpcy5tYXggPz8gNjMsIHsgbWVzc2FnZTogYCR7a2V5fSAoJHtpZGVudGlmaWVyfTogJHt2YWx1ZX0pIG11c3QgYmUgbm8gbW9yZSB0aGFuICR7dGhpcy5tYXh9IGNoYXJhY3RlcnMgbG9uZy5gIH0pXG4gICAgICAgICAgICAgICAgLnBhcnNlKHZhbHVlKTtcbiAgICB9XG59XG5cbi8qKlxuICogVGhpcyBpcyB0aGUgc2FtZSBhcyBTdHJpbmdDb25zdHJhaW50LCBidXQgYWxzbyBjaGVja3MgaWYgdGhlIGdpdmVuIHN0cmluZyBpcyBhIGNvcnJlY3RseSBmb3JtYXR0ZWQgVVJMLiBJZiBub3QgYSBkZXRhaWxlZCBab2QgRXJyb3IgaXMgdGhyb3duIGFsc28gdXRpbGl6aW5nIHRoZSBpZGVudGlmaWVyIGZvciBjb250ZXh0LlxuICovXG5leHBvcnQgY2xhc3MgVXJsU3RyaW5nQ29uc3RyYWludCBpbXBsZW1lbnRzIFN0cmluZ0NvbnN0cmFpbnQge1xuXG4gICAgY29uc3RydWN0b3IocmVhZG9ubHkgbWluPzogbnVtYmVyLCByZWFkb25seSBtYXg/OiBudW1iZXIpIHsgfVxuXG4gICAgdmFsaWRhdGUoa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnksIGlkZW50aWZpZXI6IHN0cmluZykge1xuXG4gICAgICAgIGlmICh2YWx1ZSAhPSB1bmRlZmluZWQpIHtcblxuICAgICAgICAgICAgei5zdHJpbmcoKS51cmwoeyBtZXNzYWdlOiBgJHtrZXl9ICgke2lkZW50aWZpZXJ9OiAke3ZhbHVlfSkgbXVzdCBiZSBhIFVSTCBmb3JtYXR0ZWQgY29ycmVjdGx5LmAgfSkucGFyc2UodmFsdWUpO1xuXG4gICAgICAgICAgICB6LnN0cmluZygpXG4gICAgICAgICAgICAgICAgLm1pbih0aGlzLm1pbiA/PyAwLCB7IG1lc3NhZ2U6IGAke2tleX0gKCR7aWRlbnRpZmllcn06ICR7dmFsdWV9KSBtdXN0IGJlIGEgVVJMIG5vIGxlc3MgdGhhbiAke3RoaXMubWlufSBjaGFyYWN0ZXJzIGxvbmcuYCB9KVxuICAgICAgICAgICAgICAgIC5tYXgodGhpcy5tYXggPz8gMTAwLCB7IG1lc3NhZ2U6IGAke2tleX0gKCR7aWRlbnRpZmllcn06ICR7dmFsdWV9KSBtdXN0IGJlIGEgVVJMIG5vIG1vcmUgdGhhbiAke3RoaXMubWF4fSBjaGFyYWN0ZXJzIGxvbmcuYCB9KVxuICAgICAgICAgICAgICAgIC5wYXJzZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogVGhpcyBjbGFzcyBjaGVja3MgaWYgdGhlIGdpdmVuIG51bWJlciAodmFsdWUpIGlzIHdpdGhpbiB0aGUgYm91bmRzIG9mIHRoZSBnaXZlbiBtaW4gYW5kIG1heCBpbmNsdXNpdmUgbnVtYmVyIGJvdW5kcy4gSWYgbm90IGEgZGV0YWlsZWQgWm9kIEVycm9yIGlzIHRocm93biBhbHNvIHV0aWxpemluZyB0aGUgaWRlbnRpZmllciBmb3IgY29udGV4dC5cbiAqL1xuZXhwb3J0IGNsYXNzIE51bWJlckNvbnN0cmFpbnQgaW1wbGVtZW50cyBDb25zdHJhaW50IHtcblxuICAgIGNvbnN0cnVjdG9yKHJlYWRvbmx5IG1pbj86IG51bWJlciwgcmVhZG9ubHkgbWF4PzogbnVtYmVyKSB7IH1cblxuICAgIHZhbGlkYXRlKGtleTogc3RyaW5nLCB2YWx1ZTogYW55LCBpZGVudGlmaWVyOiBzdHJpbmcpIHtcblxuICAgICAgICBpZiAodmFsdWUgIT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgei5udW1iZXIoKVxuICAgICAgICAgICAgICAgIC5ndGUodGhpcy5taW4gPz8gMSwgeyBtZXNzYWdlOiBgJHtrZXl9ICgke2lkZW50aWZpZXJ9OiAke3ZhbHVlfSkgbXVzdCBiZSBubyBsZXNzIHRoYW4gJHt0aGlzLm1pbn0gbm9kZXMuYCB9KVxuICAgICAgICAgICAgICAgIC5sdGUodGhpcy5tYXggPz8gMywgeyBtZXNzYWdlOiBgJHtrZXl9ICgke2lkZW50aWZpZXJ9OiAke3ZhbHVlfSkgbXVzdCBiZSBubyBtb3JlIHRoYW4gJHt0aGlzLm1heH0gbm9kZXMuYCB9KVxuICAgICAgICAgICAgICAgIC5wYXJzZSh2YWx1ZSk7XG4gICAgfVxufVxuXG4vKipcbiAqIFRoaXMgd29ya3MganVzdCBsaWtlIE51bWJlckNvbnN0cmFpbnQgYnV0IGNoZWNrcyB0aGUgbGVuZ3RoIG9mIHRoZSBnaXZlbiB2YWx1ZSBmb3IgYW4gZXhwZWN0ZWQgYXJyYXkuIElmIG5vdCBhIGRldGFpbGVkIFpvZCBFcnJvciBpcyB0aHJvd24gYWxzbyB1dGlsaXppbmcgdGhlIGlkZW50aWZpZXIgZm9yIGNvbnRleHQuXG4gKi9cbmV4cG9ydCBjbGFzcyBBcnJheUNvbnN0cmFpbnQgaW1wbGVtZW50cyBDb25zdHJhaW50IHtcblxuICAgIGNvbnN0cnVjdG9yKHJlYWRvbmx5IG1pbj86IG51bWJlciwgcmVhZG9ubHkgbWF4PzogbnVtYmVyKSB7IH1cblxuICAgIHZhbGlkYXRlKGtleTogc3RyaW5nLCB2YWx1ZTogYW55LCBpZGVudGlmaWVyOiBzdHJpbmcpIHtcblxuICAgICAgICBpZiAodmFsdWUgIT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgei5udW1iZXIoKVxuICAgICAgICAgICAgICAgIC5ndGUodGhpcy5taW4gPz8gMSwgeyBtZXNzYWdlOiBgJHtrZXl9ICgke2lkZW50aWZpZXJ9IG9mIGxlbmd0aDogJHt2YWx1ZS5sZW5ndGh9KSBtdXN0IGJlIG5vIGxlc3MgdGhhbiAke3RoaXMubWlufSBub2RlIGdyb3Vwcy5gIH0pXG4gICAgICAgICAgICAgICAgLmx0ZSh0aGlzLm1heCA/PyAzLCB7IG1lc3NhZ2U6IGAke2tleX0gKCR7aWRlbnRpZmllcn0gb2YgbGVuZ3RoOiAke3ZhbHVlLmxlbmd0aH0pIG11c3QgYmUgbm8gbW9yZSB0aGFuICR7dGhpcy5tYXh9IG5vZGUgZ3JvdXBzLmAgfSlcbiAgICAgICAgICAgICAgICAucGFyc2UodmFsdWUubGVuZ3RoKTtcbiAgICB9XG59XG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIGEgZ2l2ZW4gc3RyaW5nIG1hdGNoZXMgdGhlIHJlZ2V4LiAgSWYgbm90LCBhIGRldGFpbGVkIFpvZCBFcnJvciBpcyB0aHJvd24uXG4gKi9cbmV4cG9ydCBjbGFzcyBHZW5lcmljUmVnZXhTdHJpbmdDb25zdHJhaW50IGltcGxlbWVudHMgQ29uc3RyYWludCB7XG4gICAgY29uc3RydWN0b3IgKHJlYWRvbmx5IHJlZ2V4PzogUmVnRXhwKSB7IH1cblxuICAgIHZhbGlkYXRlKGtleTogc3RyaW5nLCB2YWx1ZTogYW55LCBpZGVudGlmaWVyOiBzdHJpbmcpIHtcbiAgICAgICAgXG4gICAgICAgIGlmICh2YWx1ZSAhPSB1bmRlZmluZWQpXG4gICAgICAgICAgICB6LnN0cmluZygpXG4gICAgICAgICAgICAgICAgLnJlZ2V4KHRoaXMucmVnZXggPz8gbmV3IFJlZ0V4cCgnLionKSwgeyBtZXNzYWdlOiBgJHtrZXl9ICgke2lkZW50aWZpZXJ9KSBtdXN0IG1hdGNoIHJlZ3VsYXIgZXhwcmVzc2lvbiAke3RoaXMucmVnZXh9LmB9KVxuICAgICAgICAgICAgICAgIC5wYXJzZSh2YWx1ZSk7XG4gICAgICAgIFxuICAgIH1cblxufVxuXG4vKipcbiAqIENvbnRhaW5zIGEgbGlzdCBvZiBjb25zdHJhaW50cyBhbmQgY2hlY2tzIHdoZXRoZXIgYSBnaXZlbiB2YWx1ZSBtZWV0cyBlYWNoIGNvbnN0cmFpbnQuICBJZiBub3QsIGEgZGV0YWlsZWQgWm9kIEVycm9yIGlzIHRocm93biBmb3IgdGhhdCBjb25zdHJhaW50LlxuICovXG5leHBvcnQgY2xhc3MgQ29tcG9zaXRlQ29uc3RyYWludCBpbXBsZW1lbnRzIENvbnN0cmFpbnQge1xuICAgIHJlYWRvbmx5IGNvbnN0cmFpbnRzOiBBcnJheTxDb25zdHJhaW50PjtcbiAgICBjb25zdHJ1Y3RvciAoLi4uY29uc3RyYWludHM6IEFycmF5PENvbnN0cmFpbnQ+KSB7IFxuICAgICAgICB0aGlzLmNvbnN0cmFpbnRzID0gY29uc3RyYWludHM7XG4gICAgfVxuICAgIFxuICAgIHZhbGlkYXRlKGtleTogc3RyaW5nLCB2YWx1ZTogYW55LCBpZGVudGlmaWVyOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5jb25zdHJhaW50cy5mb3JFYWNoKGNvbnN0cmFpbnQgPT4ge1xuICAgICAgICAgICAgY29uc3RyYWludC52YWxpZGF0ZShrZXksIHZhbHVlLCBpZGVudGlmaWVyKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgYSBnaXZlbiBzdHJpbmcgbWF0Y2hlcyB0aGUgcmVnZXggZm9yIFJGQyAxMTIzLiAgSWYgbm90LCBhIGRldGFpbGVkIFpvZCBFcnJvciBpcyB0aHJvd24uXG4gKi9cbmV4cG9ydCBjbGFzcyBJbnRlcm5ldEhvc3RTdHJpbmdDb25zdHJhaW50IGV4dGVuZHMgQ29tcG9zaXRlQ29uc3RyYWludCB7XG4gICAgY29uc3RydWN0b3IgKCkgeyBcbiAgICAgICAgc3VwZXIoXG4gICAgICAgICAgICBuZXcgR2VuZXJpY1JlZ2V4U3RyaW5nQ29uc3RyYWludChuZXcgUmVnRXhwKCdeKD8hWzAtOV0rJCkoPyEuKi0kKSg/IS0pW2EtekEtWjAtOS1dKiQnKSksIFxuICAgICAgICAgICAgbmV3IFN0cmluZ0NvbnN0cmFpbnQoMSw2MyksXG4gICAgICAgICk7IFxuICAgIH1cbn1cblxuLyoqXG4gKiBUaGUgdHlwZSB0aGF0IGRlcml2ZXMgZnJvbSBhIGdlbmVyaWMgaW5wdXQgc3RydWN0dXJlLCByZXRhaW5pbmcgdGhlIGtleXMuIEVuYWJsZXMgdG8gZGVmaW5lIG1hcHBpbmcgYmV0d2VlbiB0aGUgaW5wdXQgc3RydWN0dXJlIGtleXMgYW5kIGNvbnN0cmFpbnRzLlxuICovXG5leHBvcnQgdHlwZSBDb25zdHJhaW50c1R5cGU8VD4gPSBQYXJ0aWFsPFJlY29yZDxrZXlvZiBULCBDb25zdHJhaW50Pj47XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiB2YWxpZGF0ZXMgdGhlIGdpdmVuIG9iamVjdCBieSB0aGUgZ2l2ZW4gY29uc3RyYWludHMsIGFuZCByZXR1cm5zIGFuIGVycm9yIHRoYXQgdXNlcyB0aGUgZ2l2ZW4gY29udGV4dCBpZiBuZWVkZWQuXG4gKiBAcGFyYW0gY29uc3RyYWludHMgVGhpcyBpcyB0aGUga2V5cyBvZiB0aGUgb2JqZWN0IHdpdGggc3BlY2lmaWVkIHZhbHVlcyBmb3IgdmFsaWRhdGlvbi5cbiAqIEBwYXJhbSBjb250ZXh0IE9iamVjdCB0eXBlIG5hbWUgZm9yIGVycm9yIGNvbnRleHQgcHVycG9zZXMuXG4gKiBAcGFyYW0gb2JqZWN0IFRoZSBnaXZlbiBvYmplY3QgdHlwZSwgYW4gYXJyYXkgb2Ygb3Igb25seSBhIHNpbmdsZSBvYmplY3QsIHRvIGJlIHZhbGlkYXRlZC5cbiAqIEByZXR1cm5zIHRocm93cyBhIFpvZCBFcnJvciBpZiB2YWxpZGF0aW9ucyBhcmUgYnJva2VuLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVDb25zdHJhaW50czxUPihjb25zdHJhaW50czogQ29uc3RyYWludHNUeXBlPFQ+LCBjb250ZXh0OiBzdHJpbmcsIC4uLm9iamVjdDogYW55KSB7XG5cbiAgICBpZiAob2JqZWN0ICE9IHVuZGVmaW5lZClcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvYmplY3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IGsgaW4gY29uc3RyYWludHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb25zdHJhaW50OiBDb25zdHJhaW50ID0gY29uc3RyYWludHNba10hO1xuICAgICAgICAgICAgICAgIGNvbnN0cmFpbnQudmFsaWRhdGUoY29udGV4dCArIFwiLlwiICsgaywgb2JqZWN0W2ldW2tdLCBrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxufVxuIl19