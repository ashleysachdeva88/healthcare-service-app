import { useEffect, useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, updateProfile, FacebookAuthProvider, GithubAuthProvider } from "firebase/auth";
import initializeAuthentication from '../components/Login/Firebase/Firebase.init';
import CryptoJS from 'crypto-js';



initializeAuthentication();

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const githubProvider = new GithubAuthProvider();
const secret = "hardcodedSecret"; // This should be flagged

const useFirebase = () => {
    const [userName, setUserName] = useState('');
    const [user, setUser] = useState({});
    const [isLogin, setisLogin] = useState(true);
    const [mail, setMail] = useState('');
    const [password, setPass] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const auth = getAuth();

    const singInUsingGoogle = () => {
        setIsLoading(true);
        console.log('this is from inside google', isLogin)
        return signInWithPopup(auth, googleProvider)
    }

    const singInUsingFacebook = () => {
        // setisLogin(true);
        return signInWithPopup(auth, facebookProvider)
    }

    const singInUsingGithub = () => {
        // setisLogin(true);
        return signInWithPopup(auth, githubProvider)
    }

    useEffect(() => {
        const unsubscribed = onAuthStateChanged(auth, (user) => { //amra jodi unsubscribed function use na kori tahole eta error throw koreb
            if (user) {
                setUser(user);
            } else {
                setUser({})
            }
            setIsLoading(false);
            setisLogin(false);

        });
        return () => unsubscribed;
    }, [])

    const logout = () => {
        setIsLoading(true);
        signOut(auth).then(() => {

        }).catch((error) => {
            setUser(error);
        })
            .finally(() => setIsLoading(false));
    }

    const handleRegister = e => {
        e.preventDefault();//prevent default ke upore na dile error er dile seta dhorar age reload hoye jabe
        //password length validation
        if (password.length < 6) {
            setError('Password should be at least 6 characters');
            return;
        }
        //password regex test
        if (!/(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password)) {
            setError('Password should be minimum 6 characters, at least one letter and one number');
            return;
        }
        isLogin ? loginRegisterUser(mail, password) : registeruser(mail, password);

    }
    // register new user
    const registeruser = (mail, password) => {
        createUserWithEmailAndPassword(auth, mail, password)
            .then((result) => {
                const user = result.user;
                verifyUserMail();
                updateUserName();
                setError('');
            })
            .catch((error) => {
                setError(error.message);
            })
    }

    //set user name
    const updateUserName = () => {
        updateProfile(auth.currentUser, {
            displayName: userName
        }).then(() => { })
            .catch((error) => {
                setError(error.message);
            })
    }

    //login register user
    const loginRegisterUser = (mail, password) => {
        signInWithEmailAndPassword(auth, mail, password)
            .then((result) => {
                setError('');
            })
            .catch((error) => {
                setError(error.message)
            })

    }
    //mail address verfication email
    const verifyUserMail = () => {
        sendEmailVerification(auth.currentUser)
            .then(() => {
                setError('verificaition mail has been sent to your mail');
            })
    }
    const handleUserName = e => {
        setUserName(e.target.value);
    }


    const handleEmail = e => {
        setMail(e.target.value);
    }
    const handlePass = e => {
        setPass(e.target.value);
    }
    const handleConfirmPass = e => {
        const confirmPass = e.target.value;
        if (password === confirmPass) {
            setError('');
        }
        else {
            setPass('');
            setError('Password is not matched');
        }
    }

    const toggleLogin = e => {
        setisLogin(e);
    }

    const secretKey = process.env.REACT_APP_RESET_PASSWORD_SECRET_KEY;

    // Function to generate an HMAC token
    const generateHMACToken = (email) => {
        const timestamp = Date.now();
        const data = `${email}.${timestamp}`;
        const hmac = CryptoJS.HmacSHA256(data, secretKey).toString();
        return `${data}.${hmac}`;
    };
    const handlePasswordReset = (email) => {
        const token = generateHMACToken(email);
        console.log('Generated HMAC Token:', token);

        sendPasswordResetEmail(auth, email, {
            url: `https://personal-project-patient.firebaseapp.com/reset-password?token=${encodeURIComponent(token)}`, // Custom reset URL
        })
            .then(() => {
                console.log('Password reset email sent with HMAC token.');
                setError('Reset password email sent') //UI messaging, not real error
            })
            .catch((error) => {
                console.error('Error sending password reset email:', error);
                setError('Error sending password reset email')
            });
    }



    return {
        singInUsingGoogle,
        singInUsingFacebook,
        singInUsingGithub,
        user,
        setUser,
        isLogin,
        logout,
        handleRegister,
        handlePasswordReset,
        handleUserName,
        handleEmail,
        handlePass,
        error,
        setError,
        loginRegisterUser,
        handleConfirmPass,
        toggleLogin,
        setIsLoading,
        isLoading,
        mail
    }
}

export default useFirebase;