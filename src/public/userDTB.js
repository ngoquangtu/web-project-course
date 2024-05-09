
const { initializeApp  } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,sendPasswordResetEmail } = require('firebase/auth');
const admin = require("firebase-admin");
const serviceAccount = require("../../serviceAccount.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "lexiland2024.appspot.com" 
});
const bucket = admin.storage().bucket();
class User {
    constructor() {
        
        const firebaseConfig = {
            apiKey: "AIzaSyBOR8_tGBEyN6nn_zkUB7TNv2x6KjHiT2c",
            authDomain: "lexiland2024.firebaseapp.com",
            projectId: "lexiland2024",
            storageBucket: "lexiland2024.appspot.com",
            messagingSenderId: "154851344957",
            appId: "1:154851344957:web:c97a8078658c716cb96054",
            measurementId: "G-PQY3W7VCSJ",

          };
        if (!firebaseConfig || typeof firebaseConfig !== 'object') {
            throw new Error('Invalid firebaseConfig provided. Please provide a valid object.');
        }
        this.firebaseConfig = firebaseConfig;
        
        this.initializeFirebase();  
    }

    initializeFirebase() {
        try {
            this.app = initializeApp(
                this.firebaseConfig);
            this.db = getFirestore(this.app);
            this.auth = getAuth(this.app);
            this.userId=null;
        } catch (error) {
            console.error('Error initializing Firebase:', error);
        }
    }
    async register(email, password,playerName) {
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            const user = userCredential.user;
            await this.saveUserToFirestore(user.uid, email,playerName);
            
            return true;
        } catch (error) {
            console.error("Error registering user:", error.message);
            return false;
        }
    }
    async login(email,password) {
        try 
        {
                await signInWithEmailAndPassword(this.auth, email, password);
                return true; // Trả về true nếu đăng nhập thành công
            } catch (error) {
                console.error("Error logging in:", error.message);
                return false; // Trả về false nếu đăng nhập thất bại
        }
    }

    async saveUserToFirestore(userId, email,playerName) {
        try {
            const userRef = doc(this.db, "users", userId);
            await setDoc(userRef, {
                email: email,
                playerName:playerName,
                score: 0
            })
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
    async getCurrentUserId() {
        try {
            const currentUser = this.auth.currentUser;
            if (currentUser) {
                return currentUser.uid;
            } else {

                await this.auth.onAuthStateChanged((user) => {
                    if (user) {
                        return user.uid;
                    } else {
                        return null;
                    }
                });
            }
        } catch (error) {
            console.error("Error getting current user ID:", error);
            throw error;
        }
    }

    async loadUserInfor(userId)
    {
        
        try
        {
            const userRef =  doc(this.db, "users", userId);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const { playerName } = userData; 
                return { playerName: playerName };
            } else {
                console.log("Không tìm thấy người dùng với ID đã cho.");
                return null;
            }
    
        }
        catch(error)
        {
            console.error("Lỗi khi tải thông tin người dùng:", error);
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
                leaderboardData.push({email:data.email,score:datre});
            });
            leaderboardData.sort((a, b) => b.score - a.score);
        } catch (error) {
            throw error;
        }
    }
    async uploadAvatar( avatarFile,userID) {
        try {
            const allowedFormats = ['image/png', 'image/jpeg'];
            if (!allowedFormats.includes(avatarFile.mimetype)) {
                return;
            }
    

            const fileName = Date.now() + avatarFile.originalname; 

            const destination = "avatars/" +    fileName;
            

            await bucket.upload(avatarFile.path,
            {
                destination:destination,
                metadata:
                {
                    contentType: avatarFile.mimetype
                }
            });
            // const avatarUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
            const avatarUrl=await bucket.file(destination).getSignedUrl({ action: 'read', expires: '01-01-2026' });
            const userRef = doc(this.db, 'users', userID);
            await setDoc(userRef, { avatarUrl: avatarUrl }, { merge: true });
            return true;
        } catch (error) {
            console.log('Error uploading avatar', error);

            return false;
        }
    }
    async forgotPassword(email) {
        try {
            sendPasswordResetEmail(this.auth, email);
            return true;
            
        } catch (error) {
            console.log('Lỗi khi gửi email đặt lại mật khẩu:', error);
            return false;
        }
    }
}

module.exports =  User ;
