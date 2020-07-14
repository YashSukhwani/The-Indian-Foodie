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
    sessionEnd();
    if (user) {
        let verify = document.getElementById("verify");
        let verified = user.emailVerified;
        if (verified)
            verify.innerHTML = "You are now logged in!"
    }
})

// After the new user is created but before sending the verfication email, update the user's display name.
// That will ensure the display name will be used in the verfication email.

// After the user successfully logs in, update his remaining profile information.

function createNewUser() {
    var email = document.getElementById("email");
    var pass = document.getElementById("pass");
    var logoutBtn = document.getElementById('signout');
    var verify = document.getElementById("verify").innerHTML;
    var login = document.getElementById("login");
    var signup = document.getElementById("signup");


    firebase.auth().createUserWithEmailAndPassword(email.value, pass.value)
        .then(() => {
            var user = firebase.auth().currentUser;

            user.sendEmailVerification().then(function () { // Email sent.
                var verified = user.emailVerified;

                if (!verified) {
                    verify = "Please confirm the verification link sent to " + user.email
                    newUsers.push(user)

                    showEnable(logoutBtn)
                    hideDisable(email)
                    hideDisable(pass)
                    hideDisable(signup)
                    hideDisable(login)
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

    firebase.auth().signInWithEmailAndPassword(email, pass).catch(function (error) {
        window.alert(error.message);
    })
}

function sessionEnd() {
    if (newUsers.length != 0) {
        newUsers.forEach((currUser) => {
            let verified = currUser.emailVerified;
            if (!verified) {
                currUser.delete().then(function () {
                    // User deleted.
                }).catch(function (error) {
                    // An error happened.
                });
            }
        })
    }
}

function signOut() {
    firebase.auth().signOut().then(function () {
        // Sign-out successful.
        let verify = document.getElementById("verify");
        verify.innerHTML = ""

        hideDisable(logoutBtn)
        showEnable(email)
        showEnable(pass)
        showEnable(signup)
        showEnable(login)
    }).catch(function (error) {
        // An error happened.
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