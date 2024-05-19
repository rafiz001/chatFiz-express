var sqlite3 = require('sqlite3').verbose()
var md5 = require('md5')

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text, 
            email text UNIQUE, 
            password text, 
            CONSTRAINT email_unique UNIQUE (email)
            );
            
            CREATE TABLE connection (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user1 text,
            user2 text,
            last_commit text
            );
            
            
            
            `,
        (err) => {
            if (err) {
                console.log(err.message);
                // Table already created
            }else{
                // Table just created, creating some rows
                var insert = 'INSERT INTO user (name, email, password) VALUES (?,?,?)'
                db.run(insert, ["admin","admin@example.com",md5("admin123456")])
                db.run(insert, ["user","user@example.com",md5("user123456")])
                
                db.run("INSERT INTO connection (user1, user2, last_commit) VALUES (?, ?, ?)",["admin@example.com","user@example.com","12345678910"]) 
            }
        });  
    }
});


module.exports = db