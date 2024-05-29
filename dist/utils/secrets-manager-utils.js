"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSecret = exports.getSecretValue = void 0;
const client_secrets_manager_1 = require("@aws-sdk/client-secrets-manager");
/**
 * Gets secret value from AWS Secret Manager. Requires access rights to the secret, specified by the secretName parameter.
 * @param secretName name of the secret to retrieve
 * @param region
 * @returns
*/
async function getSecretValue(secretName, region) {
    const secretManager = new client_secrets_manager_1.SecretsManager({ region });
    let secretString = "";
    try {
        let response = await secretManager.getSecretValue({ SecretId: secretName });
        if (response) {
            if (response.SecretString) {
                secretString = response.SecretString;
            }
            else if (response.SecretBinary) {
                throw new Error(`Invalid secret format for ${secretName}. Expected string value, received binary.`);
            }
        }
        return secretString;
    }
    catch (error) {
        console.log(`error getting secret ${secretName}: ` + error);
        throw error;
    }
}
exports.getSecretValue = getSecretValue;
/**
 * Throws an error if secret is undefined in the target region.
 * @returns ARN of the secret if exists.
 */
async function validateSecret(secretName, region) {
    const secretManager = new client_secrets_manager_1.SecretsManager({ region });
    try {
        const response = await secretManager.describeSecret({ SecretId: secretName });
        return response.ARN;
    }
    catch (error) {
        console.log(`Secret ${secretName} is not defined: ` + error);
        throw error;
    }
}
exports.validateSecret = validateSecret;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjcmV0cy1tYW5hZ2VyLXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL3V0aWxzL3NlY3JldHMtbWFuYWdlci11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw0RUFBaUU7QUFDakU7Ozs7O0VBS0U7QUFDTSxLQUFLLFVBQVUsY0FBYyxDQUFDLFVBQWtCLEVBQUUsTUFBYztJQUNwRSxNQUFNLGFBQWEsR0FBRyxJQUFJLHVDQUFjLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ3JELElBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQztJQUN0QixJQUFJLENBQUM7UUFDRCxJQUFJLFFBQVEsR0FBRyxNQUFNLGFBQWEsQ0FBQyxjQUFjLENBQUMsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUM1RSxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ1gsSUFBSSxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ3hCLFlBQVksR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDO1lBQ3pDLENBQUM7aUJBQU0sSUFBSSxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQy9CLE1BQU0sSUFBSSxLQUFLLENBQUMsNkJBQTZCLFVBQVUsMkNBQTJDLENBQUMsQ0FBQztZQUN4RyxDQUFDO1FBQ0wsQ0FBQztRQUNELE9BQU8sWUFBWSxDQUFDO0lBQ3hCLENBQUM7SUFDRCxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsVUFBVSxJQUFJLEdBQUksS0FBSyxDQUFDLENBQUM7UUFDN0QsTUFBTSxLQUFLLENBQUM7SUFDaEIsQ0FBQztBQUNMLENBQUM7QUFsQkEsd0NBa0JBO0FBRUQ7OztHQUdHO0FBQ0ksS0FBSyxVQUFVLGNBQWMsQ0FBQyxVQUFrQixFQUFFLE1BQWM7SUFDbkUsTUFBTSxhQUFhLEdBQUcsSUFBSSx1Q0FBYyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUNyRCxJQUFJLENBQUM7UUFDRCxNQUFNLFFBQVEsR0FBRyxNQUFNLGFBQWEsQ0FBQyxjQUFjLENBQUMsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUM5RSxPQUFPLFFBQVEsQ0FBQyxHQUFJLENBQUM7SUFDekIsQ0FBQztJQUNELE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsVUFBVSxtQkFBbUIsR0FBSSxLQUFLLENBQUMsQ0FBQztRQUM5RCxNQUFNLEtBQUssQ0FBQztJQUNoQixDQUFDO0FBQ0wsQ0FBQztBQVZELHdDQVVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU2VjcmV0c01hbmFnZXIgfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LXNlY3JldHMtbWFuYWdlclwiO1xuLyoqXG4gKiBHZXRzIHNlY3JldCB2YWx1ZSBmcm9tIEFXUyBTZWNyZXQgTWFuYWdlci4gUmVxdWlyZXMgYWNjZXNzIHJpZ2h0cyB0byB0aGUgc2VjcmV0LCBzcGVjaWZpZWQgYnkgdGhlIHNlY3JldE5hbWUgcGFyYW1ldGVyLlxuICogQHBhcmFtIHNlY3JldE5hbWUgbmFtZSBvZiB0aGUgc2VjcmV0IHRvIHJldHJpZXZlXG4gKiBAcGFyYW0gcmVnaW9uIFxuICogQHJldHVybnMgXG4qL1xuIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRTZWNyZXRWYWx1ZShzZWNyZXROYW1lOiBzdHJpbmcsIHJlZ2lvbjogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBzZWNyZXRNYW5hZ2VyID0gbmV3IFNlY3JldHNNYW5hZ2VyKHsgcmVnaW9uIH0pO1xuICAgIGxldCBzZWNyZXRTdHJpbmcgPSBcIlwiO1xuICAgIHRyeSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IHNlY3JldE1hbmFnZXIuZ2V0U2VjcmV0VmFsdWUoeyBTZWNyZXRJZDogc2VjcmV0TmFtZSB9KTtcbiAgICAgICAgaWYgKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UuU2VjcmV0U3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgc2VjcmV0U3RyaW5nID0gcmVzcG9uc2UuU2VjcmV0U3RyaW5nO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChyZXNwb25zZS5TZWNyZXRCaW5hcnkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgc2VjcmV0IGZvcm1hdCBmb3IgJHtzZWNyZXROYW1lfS4gRXhwZWN0ZWQgc3RyaW5nIHZhbHVlLCByZWNlaXZlZCBiaW5hcnkuYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNlY3JldFN0cmluZztcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBlcnJvciBnZXR0aW5nIHNlY3JldCAke3NlY3JldE5hbWV9OiBgICArIGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxufVxuXG4vKipcbiAqIFRocm93cyBhbiBlcnJvciBpZiBzZWNyZXQgaXMgdW5kZWZpbmVkIGluIHRoZSB0YXJnZXQgcmVnaW9uLlxuICogQHJldHVybnMgQVJOIG9mIHRoZSBzZWNyZXQgaWYgZXhpc3RzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdmFsaWRhdGVTZWNyZXQoc2VjcmV0TmFtZTogc3RyaW5nLCByZWdpb246IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3Qgc2VjcmV0TWFuYWdlciA9IG5ldyBTZWNyZXRzTWFuYWdlcih7IHJlZ2lvbiB9KTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHNlY3JldE1hbmFnZXIuZGVzY3JpYmVTZWNyZXQoeyBTZWNyZXRJZDogc2VjcmV0TmFtZSB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLkFSTiE7XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmxvZyhgU2VjcmV0ICR7c2VjcmV0TmFtZX0gaXMgbm90IGRlZmluZWQ6IGAgICsgZXJyb3IpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG59Il19