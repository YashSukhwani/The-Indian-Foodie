// Test this program and ensure it follows the description below. 
// Test weird scenarios and try to break the current implementation.

/*
Description

The application creates a new user with the provided email and password and sends a verification email instantly.
The user creation elements in the form are disabled at this stage, preventing a link from being sent to other new users.
If the user logs out without verifying, the object created in firebase gets deleted.
After the user logs out without verifying, the original form elements are enabled and the logOut button is disabled.
The same thing must also happen when the user closes the tab (session) they were working in.

*/

/*
Curent Implemetation

Every time a user's auth state changes, all the unverified users they created during that session get deleted from firebase.
That would be safe but it has implementation problems. This means an unverified user's account will be deleted even before they can
confirm their email. Hence, the version being used is that all unverified users will be deleted when a user signs out.

Under the regular implementation, one user can only send one createNewUser request at a time, and hence there can only be one unverified
user at a time. However, if the user goes into inspect element, then enables the form inputs and sends a request, they will be able to 
create more than one unverified user. A practical solution to this would be rendering a different page for the user while we await their
email confirmation. However, that has not yet been implemented in this test version.

Currently, if a user closes the tab without verifying their email, I had setup the cleanUsers() function to run. However,
the delete user request made to Firebase from this function does not complete in time. Hence, it makes more sense to send a simple url 
request to the backend, a request that will complete on time, to indicate the user that needs to be deleted. Then, the actual delete user
request to Firebase Auth can be made from the Firebase function that handles the simple url request from the frontend.
*/

// Below is the function where I tried to send the delete request directly to Firebase in time by using a timer to delay the closing 
// of the browser window.

// window.addEventListener('beforeunload', () => {
//     var x = newUsers.length * 900; // number of miliseconds to hold before unloading page
//     var a = (new Date()).getTime() + x;
//     // -----------
//     cleanUsers(); // function call goes here
//     // -----------
//     // browser will hold with unloading your page for X miliseconds, letting
//     // your function call to finish
//     while ((new Date()).getTime() < a) {}
// }, false);

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

        if (user.emailVerified)
            verify.innerHTML = "You are logged in!"
        else {
            var message = "Please confirm the verification link sent to " + user.email +
                " before you logout. Otherwise your account will be deleted."
            var verify = document.getElementById("verify");
            verify.innerHTML = message
        }

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
                    " before you logout. Otherwise your account will be deleted."

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
    var unverEmails = new Array();
    if (newUsers.length != 0) {
        newUsers.forEach((currUser) => {
            if (currUser != null) {
                let verified = currUser.emailVerified;
                if (!verified) {
                    unVerified.push(currUser)
                    unverEmails.push(currUser.email)
                    currUser.delete().then(function () {
                        // User deleted.
                    }).catch(function (error) {
                        // An error happened.
                        window.alert(error.message);
                        // window.alert(error.message);
                    });
                }
            }
        })
        // Removes already deleted users from newUsers
        for (let i = newUsers.length - 1; i >= 0; i--)
            if (unVerified.includes(newUsers[i]))
                newUsers[i] = null
        console.log('unVerified ' + unverEmails)
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
        verify.innerHTML = "Please enter your user information to log in."
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