
/*
Description

Firebase doesn't allow a client user to delete any users other than their own.

This application creates a new user with the provided email and password and sends a verification email instantly.
The user creation elements in the form are disabled at this stage, preventing a link from being sent to other new users.
If the user logs out without verifying, the user created in firebase gets deleted.
After the user logs out without verifying, the original form elements are enabled and the logOut button is disabled.

signOut() is called when the browser tab is closed, but it is not able to complete its async requests before the tab closes.
Hence, it makes more sense to send a simple url request to the backend, a request that will complete on time, to indicate the user that 
needs to be deleted. Then, the actual delete user request to Firebase Auth can be made from the Firebase function that handles the simple 
url request from the frontend.

Under the regular implementation, one user can only send one createNewUser request at a time, and hence there can only be one unverified
user at a time. However, if the user goes into inspect element, then enables the form inputs and sends a request, they will be able to 
create more than one unverified user. A practical solution to this would be rendering a different page for the user while we await their
email confirmation. However, that has not yet been implemented in this test version.

After the new user is created but before sending the verfication email, update the user's display name.
That will ensure the display name will be used in the verfication email.
After the user successfully logs in, update his remaining profile information.

*/

firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION).catch(function (error) {
    window.alert(error.message);
})

window.addEventListener('beforeunload', async () => {
    const x = 200; // number of miliseconds to hold before unloading page
    const a = (new Date()).getTime() + x;

    await signOut(); // function call goes here

    while ((new Date()).getTime() < a) {} // X miliseconds delay before browser unloads to allow function call to complete
}, false);

// const newUsers = new Array();

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        const email = document.getElementById("email");
        const pass = document.getElementById("pass");
        const logoutBtn = document.getElementById('signout');
        const verify = document.getElementById("verify");
        const login = document.getElementById("login");
        const signup = document.getElementById("signup");

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
            const message = "Please confirm the verification link sent to " + user.email +
                " before you logout. Otherwise your account will be deleted."
            const verify = document.getElementById("verify");
            verify.innerHTML = message
        }
    }
})

async function createNewUser() {
    const email = document.getElementById("email");
    const pass = document.getElementById("pass");
    const logoutBtn = document.getElementById('signout');
    const login = document.getElementById("login");
    const signup = document.getElementById("signup");
    const verify = document.getElementById("verify");

    await firebase.auth().createUserWithEmailAndPassword(email.value, pass.value)
        .then(async () => {
            const user = firebase.auth().currentUser;
            // newUsers.push(user)
            clearInput(email)
            clearInput(pass)

            await user.sendEmailVerification().then(function () { // Email sent.
                const verified = user.emailVerified;
                const message = "Please confirm the verification link sent to " + user.email +
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


async function loginUser() {
    const email = document.getElementById("email").value;
    const pass = document.getElementById("pass").value;

    await firebase.auth().signInWithEmailAndPassword(email, pass).then(() => {
        const user = firebase.auth().currentUser;
        const verified = user.emailVerified;
        console.log('verified: ' + verified)
        if (!verified)
            user.delete()
    }).catch(function (error) {
        window.alert(error.message);
    })
}

async function signOut() {
    let user = await firebase.auth().currentUser;
    if (user) {
        if (!user.emailVerified) {
            await user.delete()
            console.log('Deleted ' + user.email)
            window.alert('Deleted ' + user.email)
        } else {
            await firebase.auth().signOut().catch(function (error) {
                window.alert(error.message); // An error happened.
            });
        }

        const email = document.getElementById("email");
        const pass = document.getElementById("pass");
        const logoutBtn = document.getElementById('signout');
        const verify = document.getElementById("verify");
        const login = document.getElementById("login");
        const signup = document.getElementById("signup");

        hideDisable(logoutBtn)
        showEnable(email)
        showEnable(pass)
        showEnable(signup)
        showEnable(login)
        verify.innerHTML = "Please enter your user information to log in."
    }
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