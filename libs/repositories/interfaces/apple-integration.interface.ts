/**
 * Source: {@link https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_rest_api/authenticating_users_with_sign_in_with_apple  Authenticating users with Sign in with Apple}
 */
export interface AppleIdTokenResponse {
    /**
     * The issuer registered claim identifies the principal that issues the identity token. Because Apple generates the token, the value is https://appleid.apple.com.
     */
    iss: string
    /**
     * The subject registered claim identifies the principal that’s the subject of the identity token. Because this token is for your app, the value is the unique identifier for the user.
     */
    sub: string
    email: string
    /**
     * The audience registered claim identifies the recipient of the identity token. Because the token is for your app, the value is the client_id from your developer account.
     */
    aud: string
    /**
     * The expiration time registered claim identifies the time that the identity token expires, in the number of seconds since the Unix epoch in UTC. The value must be greater than the current date and time when verifying the token.
     */
    exp: number
    /**
     * The issued at registered claim indicates the time that Apple issues the identity token, in the number of seconds since the Unix epoch in UTC.
     */
    iat: number
    /**
     * A string for associating a client session with the identity token. This value mitigates replay attacks and is present only if you pass it in the authorization request.
     */
    nonce: string
    /**
     * A Boolean value that indicates whether the transaction is on a nonce-supported platform. If you send a nonce in the authorization request, but don’t see the nonce claim in the identity token, check this claim to determine how to proceed. If this claim returns true, treat nonce as mandatory and fail the transaction; otherwise, you can proceed treating the nonce as optional.
     */
    nonce_supported: boolean
    /**
     * A string value that represents the user’s email address. The email address is either the user’s real email address or the proxy address, depending on their private email relay service. This value may be empty for Sign in with Apple at Work & School users. For example, younger students may not have an email address.
     */
    email_verified: boolean
    /**
     * A string or Boolean value that indicates whether the service verifies the email. The value can either be a string ("true" or "false") or a Boolean (true or false). The system may not verify email addresses for Sign in with Apple at Work & School users, and this claim is "false" or false for those users.
     */
    is_private_email: boolean
    /**
     * An Integer value that indicates whether the user appears to be a real person. Use the value of this claim to mitigate fraud. The possible values are: 0 (or Unsupported), 1 (or Unknown), 2 (or LikelyReal). For more information, see {@link https://developer.apple.com/documentation/authenticationservices/asuserdetectionstatus ASUserDetectionStatus}. This claim is present only in iOS 14 and later, macOS 11 and later, watchOS 7 and later, tvOS 14 and later. The claim isn’t present or supported for web-based apps.
     */
    real_user_status: string
    /**
     * A string value that represents the transfer identifier for migrating users to your team. This claim is present only during the 60-day transfer period after you transfer an app. For more information, {@link https://developer.apple.com/documentation Bringing new apps and users into your team}
     */
    transfer_sub: string
}

export interface IAppleIntegration {
    validate(idToken: string): Promise<AppleIdTokenResponse>
}
