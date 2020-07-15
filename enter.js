// Later implement clearing of input boxes for whenever the form is submitted.

// Test this program and ensure it follows the description below. 
// Test weird scenarios and try to break the current implementation.

/*
Description

The application creates a new user with the provided email and password and sends a verification email instantly.
The user creation elements in the form are disabled at this stage, preventing a link from being sent to other new users.
If the user logs out without verifying, the object created in firebase gets deleted.
After the user logs out without verifying, the original form elements are enabled and the logOut button is disabled.

Every time a user's auth state changes, all the unverified users they created during that session get deleted from firebase.
The same thing also happens when the user closes the tab (session) they were working in.
*/

let newUsers = new Array();

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        var email = document.getElementById("email");
        var pass = document.getElementById("pass");
        var logoutBtn = document.getElementById('signout');
        var verify = document.getElementById("verify");
        var login = document.getElementById("login");
        var signup = document.getElementById("signup");

        showEnable(logoutBtn)
        clearInput(email)
        clearInput(pass)
        hideDisable(email)
        hideDisable(pass)
        hideDisable(signup)
        hideDisable(login)

        // Not possible to log into an unVerified account because it won't exist.
        verify.innerHTML = "You are logged in!"
    }
})

// After the new user is created but before sending the verfication email, update the user's display name.
// That will ensure the display name will be used in the verfication email.

// After the user successfully logs in, update his remaining profile information.

function createNewUser() {
    var email = document.getElementById("email");
    var pass = document.getElementById("pass");
    var logoutBtn = document.getElementById('signout');
    var login = document.getElementById("login");
    var signup = document.getElementById("signup");
    var verify = document.getElementById("verify");

    firebase.auth().createUserWithEmailAndPassword(email.value, pass.value)
        .then(() => {
            var user = firebase.auth().currentUser;
            newUsers.push(user)
            clearInput(email)
            clearInput(pass)

            user.sendEmailVerification().then(function () { // Email sent.
                var verified = user.emailVerified;
                var message = "Please confirm the verification link sent to " + user.email +
                    " before you logout. Otherwise your account will be deleted"

                if (!verified) {
                    showEnable(logoutBtn)
                    hideDisable(email)
                    hideDisable(pass)
                    hideDisable(signup)
                    hideDisable(login)
                    verify.innerHTML = message
                } // add else and direct the user to application inside.

            }).catch(function (error) {
                window.alert(error.message) // An error happened.
            });
        })
        .catch(function (error) {
            window.alert(error.message);
        })
}


function loginUser() {
    let email = document.getElementById("email").value;
    let pass = document.getElementById("pass").value;

    firebase.auth().signInWithEmailAndPassword(email, pass).then(() => {
        var user = firebase.auth().currentUser;
        var verified = user.emailVerified;
        console.log(verified)
        if (!verified)
            newUsers.push(user)
    }).catch(function (error) {
        window.alert(error.message);
    })
}


function cleanUsers() {
    var unVerified = new Array(); // includes all unVerified accouns created during that session
    if (newUsers.length != 0) {
        newUsers.forEach((currUser) => {
            let verified = currUser.emailVerified;
            if (!verified) {
                unVerified.push(currUser.email)
                currUser.delete().then(function () {
                    // User deleted.
                }).catch(function (error) {
                    // An error happened.
                    window.alert(error.message);
                    // window.alert(error.message);
                });
            }
        })
        // Removes already deleted users from newUsers
        for (let i = newUsers.length - 1; i >= 0; i--)
            if (unVerified.includes(newUsers[i]))
                newUsers.pop();
        console.log('unVerified ' + unVerified)
    }
}

function signOut() {
    cleanUsers();
    firebase.auth().signOut().then(function () {
        // Sign-out successful.
        var email = document.getElementById("email");
        var pass = document.getElementById("pass");
        var logoutBtn = document.getElementById('signout');
        var verify = document.getElementById("verify");
        var login = document.getElementById("login");
        var signup = document.getElementById("signup");

        hideDisable(logoutBtn)
        showEnable(email)
        showEnable(pass)
        showEnable(signup)
        showEnable(login)
        verify.innerHTML = "Please enter your user information to log in"
    }).catch(function (error) {
        // An error happened.
        window.alert(error.message);
    });
}

function hideDisable(item) {
    item.disabled = true
    // item.style.visibility = hidden
}

function showEnable(item) {
    item.disabled = false
    // item.style.visibility = block
}

function clearInput(item) {
    item.value = ""
}