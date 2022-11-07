// const express = require('express');
// const mysql = require('mysql');

// const app = express();

// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'Ayumun1011!',
//     database: 'list_app'
//     // database: ''
//   });

// connection.connect((err) => {
// if (err) {
//     console.log('error connecting: ' + err.stack);
//     return;
// }
// console.log('success');
// });


// app.get('/', (req, res) => {
//     connection.query(
//         'SELECT * FROM users',
//         (error, results) => {
//             console.log(results);
//             res.render('hello.ejs');
//         }
//     );
// });

// app.listen(3000);

const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const app = express();
// const cookieParser = require('cookie-parser')

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Ayumun1011!',
  database: 'list_app'
});

connection.connect((err) => {
if (err) {
    console.log('error connecting: ' + err.stack);
    return;
}
console.log('success');
});

app.use(
  session({
    secret: 'my_secret_key',
    // cookie: { maxAge: 60000 },
    resave: false,
    // saveUninitialized: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 60 * 1000
    }
  })
);

app.use((req, res, next) => {
  if (req.session.userId === undefined) {
    res.locals.username = 'ゲスト';
    res.locals.isLoggedIn = false;
    console.log('ログインしていません');
  } else {
    res.locals.username = req.session.username;
    res.locals.isLoggedIn = true;
    console.log(req.session.username);
    console.log('ログインしています');
  }
  next();
});

app.get('/', (req, res) => {
  res.render('top.ejs');
});

app.get('/list', (req, res) => {
  connection.query(
    'SELECT * FROM articles',
    (error, results) => {
      res.render('list.ejs', { articles: results });
    }
  );
});

app.get('/article/:id', (req, res) => {
  const id = req.params.id;
  connection.query(
    'SELECT * FROM articles WHERE id = ?',
    [id],
    (error, results) => {
    console.log(error);
      res.render('article.ejs', { article: results[0] });
      console.log(results);
    }
  );
});

app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  connection.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    (error, results) => {
      if (results.length > 0) {
        console.log("空じゃありません");
        if (req.body.password === results[0].password){
          req.session.userId = results[0].id;
          console.log("IDは・・"+results[0].id)
          req.session.username = results[0].username;
          console.log("usernameは・・"+results[0].username)
          res.redirect('/list');
        } else {
          res.redirect('/login');
        }    
      } else {
        res.redirect('/login');
      }
    }
  );
});

app.get('/logout', (req, res) => {
  req.session.destroy(error => {
    res.redirect('/list');
  });
});

app.listen(3000);
