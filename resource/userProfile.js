// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

class UserProfile {
    constructor(isAuthenticated, name,cart, ordered) {
        this.name = name;
        this.isAuthenticated = isAuthenticated;
        this.cart = cart;
        this.ordered = ordered;
    }
}

module.exports.UserProfile = UserProfile;
