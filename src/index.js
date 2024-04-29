const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

const  User  = require('../src/public/userDTB.js');


const user =  new User();
const session = require('express-session');

app.use(session({
    secret: 'ngoquangtu',
    resave: false,
    saveUninitialized: true,
    cookie:{
        secure:false,
        httpOnly:true}
}));
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        next();
    }
};

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
    try {
        if (!email || !password) {
            return res.status(400).send('Email và mật khẩu không được để trống');
        }

        // Thực hiện đăng nhập bằng email và mật khẩu
        const success = await user.login(email, password);
        if (success) {
                        // Lưu thông tin người dùng vào session
            req.session.user = { email: email };
            res.redirect('/mainpage');
        } else {
            console.error('Đăng nhập thất bại');
            res.status(401).send('Email hoặc mật khẩu không chính xác');
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
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).send('Email và mật khẩu không được để trống');
        }
        await user.register(email, password);
    } catch (error) {
        console.error('Đăng ký thất bại:', error.message);
        res.status(500).send('Đăng ký thất bại. Tài khoản đăng ký đã tồn tại!.');
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


app.get('/mainpage',requireAuth,function(req,res)
{
    res.render('mainpage');
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
