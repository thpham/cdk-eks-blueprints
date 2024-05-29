"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBedrockPolicyDocument = void 0;
function getBedrockPolicyDocument() {
    const result = [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:*",
            ],
            "Resource": "*"
        }
    ];
    return result;
}
exports.getBedrockPolicyDocument = getBedrockPolicyDocument;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWFtLXBvbGljeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi90ZWFtcy9iZWRyb2NrLXRlYW0vaWFtLXBvbGljeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFNQSxTQUFnQix3QkFBd0I7SUFDcEMsTUFBTSxNQUFNLEdBQWdCO1FBQ3hCO1lBQ0ksUUFBUSxFQUFFLE9BQU87WUFDakIsUUFBUSxFQUFFO2dCQUNOLFdBQVc7YUFDZDtZQUNELFVBQVUsRUFBRSxHQUFHO1NBQ2xCO0tBQ0osQ0FBQztJQUNGLE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUM7QUFYRCw0REFXQyIsInNvdXJjZXNDb250ZW50IjpbImludGVyZmFjZSBTdGF0ZW1lbnQge1xuICAgIEVmZmVjdDogc3RyaW5nO1xuICAgIEFjdGlvbjogc3RyaW5nIHwgc3RyaW5nW107XG4gICAgUmVzb3VyY2U6IHN0cmluZyB8IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QmVkcm9ja1BvbGljeURvY3VtZW50KCkgOiBTdGF0ZW1lbnRbXSB7XG4gICAgY29uc3QgcmVzdWx0OiBTdGF0ZW1lbnRbXSA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgXCJFZmZlY3RcIjogXCJBbGxvd1wiLFxuICAgICAgICAgICAgXCJBY3Rpb25cIjogW1xuICAgICAgICAgICAgICAgIFwiYmVkcm9jazoqXCIsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCJSZXNvdXJjZVwiOiBcIipcIlxuICAgICAgICB9XG4gICAgXTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuIl19