const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const app = express();
const upload = multer({ dest: "uploads/" });
const User  = require('../src/public/userDTB.js');


const user =  new User();
const session = require('express-session');
const FileStore=require('session-file-store')(session);
const cookieParser=require('cookie-parser');
app.use(cookieParser());
app.use(session({
    store:new FileStore({path:'./session'}),
    secret: 'ngoquangtu',
    resave: false,
    saveUninitialized: true,
    cookie:{
        secure:false,
        httpOnly:true,
}
}));
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        next();
    }
};
var userId;

// Thiết lập view engine là EJS và đường dẫn cho thư mục views
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));

// Route cho trang chủ
app.get('/', function(req, res) {
    if (req.session && req.session.user) {
        return res.redirect('/mainpage');
    }
    res.render('login', { user: user });
   
});
app.get('/get-session',(req,res)=>
{
    res.send(req.session);
})

app.get('/login', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/mainpage');
    }
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const loginFailure="Username or Password is not correct!!!Please try again!!!";

    try {
        const success = await user.login(email, password);
        if (success) {
            req.session.user = { email: email };
            userId = await user.getCurrentUserId();
            req.session.userId = userId;    
            console.log(userId);
            res.redirect('/mainpage');
        } else {

            res.render('login',{loginFailure})
        }
    } catch (error) {
        console.error('Đăng nhập thất bại:', error.message);
        res.status(500).send('Đăng nhập thất bại. Vui lòng thử lại sau.');
    }
});

app.get('/register', (req, res) => {
    res.render('signup');
});

app.post('/register', async (req, res) => {
    const { email, password,playerName } = req.body;
    const successMessage = 'Đăng ký thành công!';
    const failureMessage='Đăng ký thất bại. Tài khoản đăng ký đã tồn tại!';
    try {
        if (!email || !password) {
            return res.status(400).send('Email và mật khẩu không được để trống');
        }
       
        const success=await user.register(email, password,playerName);
        if(success)
        {
            res.render('signup',{successMessage});
        }
        else
        {
            res.render('signup',{failureMessage});
        }
    } catch (error) {
        console.error('Đăng ký thất bại:', error.message);
    }
});
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        } else {
            res.redirect('/login');
        }
    });
});
app.post('/upload',upload.single('file'),async (req,res)=>
{
    
    
    try {
        const avatarFile = req.file;
        const userId = req.session.userId;
        console.log(userId); 
        const success = await user.uploadAvatar( avatarFile,userId);
        if (success) {
            return res.status(500).send({avatarUrl:success});
        } else {
            return res.status(500).send('Failed to upload avatar.');
        }
    } catch (error) {
        console.error('Error uploading avatar:', error);
        return res.status(500).send('Internal server error.');
    }
});

app.get('/forgotpassword', (req, res) => {
    res.render('forgotpassword');
});
app.post('/forgotpassword',async (req,res)=>
{
    const {email}=req.body;
         const success=user.forgotPassword(email); 
        
       if(success)
        {
            res.send('gui thanh cong');
        }
        else
        {
            res.send('gui thanh cong');
        }
})

app.get('/mainpage',requireAuth,async function  (req,res)
{
        try {
            const userId = req.session.userId; // Lấy userId từ session
            const avatarUrl = await user.loadAvatar(userId); // Tải avatar của người dùng
            if (avatarUrl) {
                res.render('mainpage', { avatarUrl: avatarUrl });
            } else {
                res.render('mainpage', { avatarUrl: null });
            }
        } catch (error) {
            console.error('Error loading avatar:', error);
            res.status(500).send('Internal server error.');
        }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
