"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ebsCollectorPolicy = void 0;
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
function ebsCollectorPolicy() {
    return new aws_iam_1.PolicyDocument({
        statements: [
            new aws_iam_1.PolicyStatement({
                actions: [
                    'ec2:DescribeVolumes',
                ],
                resources: ['*']
            })
        ]
    });
}
exports.ebsCollectorPolicy = ebsCollectorPolicy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWFtLXBvbGljeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9hZGRvbnMvY2xvdWQtd2F0Y2gtaW5zaWdodHMvaWFtLXBvbGljeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpREFBb0U7QUFFcEUsU0FBZ0Isa0JBQWtCO0lBQ2hDLE9BQU8sSUFBSSx3QkFBYyxDQUFDO1FBQ3hCLFVBQVUsRUFBRTtZQUNWLElBQUkseUJBQWUsQ0FBQztnQkFDbEIsT0FBTyxFQUFFO29CQUNQLHFCQUFxQjtpQkFDdEI7Z0JBQ0QsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDO2FBQ2pCLENBQUM7U0FDSDtLQUNGLENBQUMsQ0FBQztBQUNMLENBQUM7QUFYRCxnREFXQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UG9saWN5RG9jdW1lbnQsIFBvbGljeVN0YXRlbWVudH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1pYW1cIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGVic0NvbGxlY3RvclBvbGljeSgpOiBQb2xpY3lEb2N1bWVudCB7XG4gIHJldHVybiBuZXcgUG9saWN5RG9jdW1lbnQoe1xuICAgIHN0YXRlbWVudHM6IFtcbiAgICAgIG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgJ2VjMjpEZXNjcmliZVZvbHVtZXMnLFxuICAgICAgICBdLFxuICAgICAgICByZXNvdXJjZXM6IFsnKiddXG4gICAgICB9KVxuICAgIF1cbiAgfSk7XG59XG5cbiJdfQ==