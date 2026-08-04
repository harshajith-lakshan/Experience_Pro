import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    GoogleAuthProvider, 
    signInWithPopup,
    sendEmailVerification,
    sendPasswordResetEmail,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-TzxAWhIo9XaOtN24oHYsEn5JCZ3kUaM",
  authDomain: "expenses-traker-9264e.firebaseapp.com",
  projectId: "expenses-traker-9264e",
  storageBucket: "expenses-traker-9264e.firebasestorage.app",
  messagingSenderId: "825093696381",
  appId: "1:825093696381:web:511d2ebab18bf2c2adfa14",
  measurementId: "G-7DNLJBT023"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Helper functions for Toast / Alert notifications
function notifyError(msg) {
    if (window.showErrorToast) window.showErrorToast(msg);
    else if (window.Swal) Swal.fire({ icon: 'error', title: 'Error', text: msg });
    else alert(msg);
}

function notifySuccess(msg) {
    if (window.showSuccessToast) window.showSuccessToast(msg);
    else if (window.Swal) Swal.fire({ icon: 'success', title: 'Success', text: msg });
    else alert(msg);
}

// -------------------------------------------------------------
// 1. FORGOT PASSWORD LOGIC
// -------------------------------------------------------------
const forgotLink = document.getElementById('forgot-password-link');
if (forgotLink) {
    forgotLink.addEventListener('click', async (e) => {
        e.preventDefault();
        const emailVal = document.getElementById('login-email')?.value.trim();
        if (!emailVal) {
            notifyError("Please enter your email address in the Login Email field first.");
            return;
        }
        try {
            await sendPasswordResetEmail(auth, emailVal);
            notifySuccess("Password reset link has been sent to your email!");
        } catch (error) {
            notifyError("Error: " + error.message);
        }
    });
}

// -------------------------------------------------------------
// 2. LOGIN FORM SUBMIT (WITH EMAIL VERIFICATION CHECK)
// -------------------------------------------------------------
const loginFormElement = document.getElementById('login-form-element');
if (loginFormElement) {
    loginFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Check if email is verified
            if (!user.emailVerified) {
                await signOut(auth);
                notifyError("Please verify your email address before logging in. Check your inbox.");
            } else {
                notifySuccess("සාර්ථකව ඇතුළු විය!");
            }
        } catch (error) {
            notifyError("Login Error: " + error.message);
        }
    });
}

// -------------------------------------------------------------
// 3. SIGNUP FORM SUBMIT
// -------------------------------------------------------------
const signupFormElement = document.getElementById('signup-form-element');
if (signupFormElement) {
    signupFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const dob = document.getElementById('signup-dob').value;
        const gender = document.getElementById('signup-gender').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update Auth Profile Display Name
            await updateProfile(user, { displayName: name });

            // Save User Metadata to Firestore
            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                dob: dob,
                gender: gender,
                createdAt: new Date().toISOString()
            });

            // Send Verification Email
            await sendEmailVerification(user);
            await signOut(auth);

            notifySuccess("Account created! A verification link has been sent to your email. Please verify before logging in.");
            
            signupFormElement.reset();
            const loginRadio = document.getElementById('login');
            if (loginRadio) loginRadio.checked = true;
            document.querySelector("label.login")?.click();

        } catch (error) {
            notifyError("Signup Error: " + error.message);
        }
    });
}

// -------------------------------------------------------------
// 4. GOOGLE LOGIN
// -------------------------------------------------------------
const googleBtn = document.getElementById('google-login-btn');
if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Merge User profile into Firestore
            await setDoc(doc(db, "users", user.uid), {
                name: user.displayName,
                email: user.email,
                avatar: user.photoURL,
                lastLogin: new Date().toISOString()
            }, { merge: true });

            notifySuccess("Google Login Successful!");
        } catch (error) {
            notifyError("Google Login Error: " + error.message);
        }
    });
}

// -------------------------------------------------------------
// 5. LOGOUT LOGIC
// -------------------------------------------------------------
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            notifySuccess("සාර්ථකව ඉවත් විය!");
        } catch (error) {
            notifyError("Logout Error: " + error.message);
        }
    });
}

// Export auth & db instances for external modules
export { auth, db };
