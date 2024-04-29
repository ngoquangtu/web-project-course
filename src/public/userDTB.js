

// import { initializeApp } from 'firebase/app';
// import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
class User {
    constructor() {
        const firebaseConfig = {
            apiKey: "AIzaSyBOR8_tGBEyN6nn_zkUB7TNv2x6KjHiT2c",
            authDomain: "lexiland2024.firebaseapp.com",
            projectId: "lexiland2024",
            storageBucket: "lexiland2024.appspot.com",
            messagingSenderId: "154851344957",
            appId: "1:154851344957:web:c97a8078658c716cb96054",
            measurementId: "G-PQY3W7VCSJ"
          };
        if (!firebaseConfig || typeof firebaseConfig !== 'object') {
            throw new Error('Invalid firebaseConfig provided. Please provide a valid object.');
        }
        this.firebaseConfig = firebaseConfig;
        this.initializeFirebase();
    }

    initializeFirebase() {
        try {
            this.app = initializeApp(this.firebaseConfig);
            this.db = getFirestore(this.app);
            this.auth = getAuth(this.app);
        } catch (error) {
            console.error('Error initializing Firebase:', error);
        }
    }
    async register(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            const user = userCredential.user;
            await this.saveUserToFirestore(user.uid, email);
            return true;
        } catch (error) {
            console.error("Error registering user:", error.message);
            return false;
        }
    }
    async login(email,password) {

  try {
        await signInWithEmailAndPassword(this.auth, email, password);
        return true; // Trả về true nếu đăng nhập thành công
    } catch (error) {
        console.error("Error logging in:", error.message);
        return false; // Trả về false nếu đăng nhập thất bại
    }
    }

    async saveUserToFirestore(userId, email) {
        try {
            const userRef = doc(this.db, "users", userId);
            await setDoc(userRef, {
                email: email,
                score: 0
            });
            console.log("User data saved to Firestore");
        } catch (error) {
            console.error("Error saving user data to Firestore:", error);
            throw error;
        }
    }
    async savePoint(userId, score) 
    {
        try {
             const leaderBoardRef =await doc(this.db, "leaderboard", userId);
            const leaderboardSnapshot = await getDoc(leaderBoardRef);
    
            if (leaderboardSnapshot.exists()) {
                const currentScore = leaderboardSnapshot.data().score;
                
                if (score > currentScore) {
                    await setDoc(leaderBoardRef, { score }, { merge: true });
                    console.log("Score updated successfully");
                }
            } else {
                await setDoc(leaderBoardRef, { score });
                console.log("New score saved successfully");
            }
        } catch (error) {
            throw error;
        }
    }
    getCurrentUserId() {
        try {
            const currentUser = this.auth.currentUser;
            if (currentUser) {
                return currentUser.uid;
            } else {
                return null;
            }
        } catch (error) {
            throw error;
        }
    }
    async loadLeaderBoard() {
        try {
            const leaderBoardRef = collection(this.db, "leaderboard");
            const q = query(leaderBoardRef, orderBy("score", "desc"), limit(10));
            const querySnapshot = await getDocs(q);
            const leaderboardData = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                leaderboardData.push({email:data.email,score:data.score});
            });
            leaderboardData.sort((a, b) => b.score - a.score);
        } catch (error) {
            throw error;
        }
    }
}

module.exports =  User ;
