const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const chatbot = require("./chatController");
dotenv.config();



const app = express();
const PORT = process.env.PORT || 5001;


app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });


const dbPath = path.resolve(__dirname, "database.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database", err.message);
  } else {
    console.log("Connected to the SQLite database.");
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {

    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'student',
      studentId TEXT UNIQUE,
      faceDescriptor TEXT
    )`);


    db.all("PRAGMA table_info(users)", (err, columns) => {
      if (!err && !columns.some(col => col.name === 'studentId')) {
        console.log("[Migration] Adding studentId to users...");
        db.run("ALTER TABLE users ADD COLUMN studentId TEXT UNIQUE");
      }
    });


    db.run(`CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      date TEXT,
      status TEXT,
      verified INTEGER DEFAULT 1,
      FOREIGN KEY(userId) REFERENCES users(id)
    )`);


    db.all("PRAGMA table_info(attendance)", (err, columns) => {
      if (!err && !columns.some(col => col.name === 'verified')) {
        console.log("[Migration] Adding verified to attendance...");
        db.run("ALTER TABLE attendance ADD COLUMN verified INTEGER DEFAULT 1");
      }
    });


    db.run("CREATE TABLE IF NOT EXISTS resources (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, category TEXT, fileUrl TEXT, uploadedBy INTEGER)");
    db.run("CREATE TABLE IF NOT EXISTS feedback (id INTEGER PRIMARY KEY AUTOINCREMENT, facultyName TEXT, rating INTEGER, comment TEXT, submittedBy INTEGER)");
    db.run("CREATE TABLE IF NOT EXISTS complaints (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, status TEXT DEFAULT 'pending', submittedBy INTEGER)");
    db.run("CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, date TEXT NOT NULL, location TEXT, description TEXT, type TEXT)");


    db.run("INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      ["System Admin", "admin@college.edu", "admin123", "admin"]);
  });
}


app.get("/", (req, res) => {
  res.send("College Management System API is running.");
});


app.post('/api/register', (req, res) => {
  const { name, email, password, role, studentId } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  db.run("INSERT INTO users (name, email, password, role, studentId) VALUES (?, ?, ?, ?, ?)",
    [name, email, password, role || 'student', studentId || null],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          const field = err.message.includes('email') ? 'Email' : 'Student ID';
          return res.status(400).json({ error: `${field} already exists` });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        message: 'User registered successfully',
        user: { id: this.lastID, name, email, role: role || 'student', studentId }
      });
    }
  );
});

app.post('/api/login', (req, res) => {
  const { identifier, password, role } = req.body;


  db.get("SELECT * FROM users WHERE (email = ? OR studentId = ?) AND password = ? AND role = ?",
    [identifier, identifier, password, role],
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      res.json({
        token: 'mock-jwt-token',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentId: user.studentId
        }
      });
    }
  );
});


app.get('/api/resources', (req, res) => {
  db.all("SELECT * FROM resources", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/resources/upload', upload.single('file'), (req, res) => {
  const { title, category, userId } = req.body;
  const fileUrl = req.file ? `http://localhost:5001/uploads/${req.file.filename}` : '';
  const fileSize = req.file ? (req.file.size / (1024 * 1024)).toFixed(2) + ' MB' : '0 MB';
  const fileType = req.file ? path.extname(req.file.originalname).substring(1).toUpperCase() : 'PDF';

  db.run("INSERT INTO resources (title, category, fileUrl, uploadedBy) VALUES (?, ?, ?, ?)",
    [title, category, fileUrl, userId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        id: this.lastID,
        fileUrl,
        size: fileSize,
        type: fileType,
        date: new Date().toISOString().split('T')[0]
      });
    }
  );
});


app.delete('/api/resources/:id', (req, res) => {
  const { id } = req.params;

  db.get("SELECT fileUrl FROM resources WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Resource not found" });

    const filePath = path.join(__dirname, row.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    db.run("DELETE FROM resources WHERE id = ?", [id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Resource deleted successfully" });
    });
  });
});


app.get('/api/admin/students', (req, res) => {
  db.all("SELECT id, name, email, role, studentId FROM users WHERE role = 'student' ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/admin/students', (req, res) => {
  const { name, email, password, studentId } = req.body;
  const role = 'student';

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  db.run("INSERT INTO users (name, email, password, role, studentId) VALUES (?, ?, ?, ?, ?)",
    [name, email, password, role, studentId],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, name, email, role, studentId });
    }
  );
});

app.delete('/api/admin/students/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM users WHERE id = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Student deleted successfully", changes: this.changes });
  });
});


app.post('/api/attendance', (req, res) => {
  const { studentId, status } = req.body;
  const date = new Date().toISOString().split('T')[0];

  db.get("SELECT id, name FROM users WHERE studentId = ?", [studentId], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: "Student ID not found" });

    db.run("INSERT INTO attendance (userId, date, status, verified) VALUES (?, ?, ?, 1)",
      [user.id, date, status || 'present'],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({
          id: this.lastID,
          userId: user.id,
          name: user.name,
          date,
          status: status || 'present',
          verified: 1,
          message: "Attendance recorded successfully."
        });
      }
    );
  });
});

app.get('/api/attendance/:userId', (req, res) => {
  const { userId } = req.params;
  db.all("SELECT * FROM attendance WHERE userId = ? ORDER BY date DESC", [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/admin/pending-attendance', (req, res) => {
  db.all(`
    SELECT a.*, u.name, u.studentId
    FROM attendance a
    JOIN users u ON a.userId = u.id
    WHERE a.verified = 0
    ORDER BY a.date DESC
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put('/api/admin/approve-attendance/:id', (req, res) => {
  const { id } = req.params;
  db.run("UPDATE attendance SET verified = 1 WHERE id = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Attendance approved", changes: this.changes });
  });
});


app.get('/api/admin/stats', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const query = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
  });

  try {
    const [students, attendance, resources, complaints] = await Promise.all([
      query("SELECT COUNT(*) as count FROM users WHERE role = 'student'"),
      query("SELECT COUNT(*) as count FROM attendance WHERE date = ? AND verified = 1", [today]),
      query("SELECT COUNT(*) as count FROM resources"),
      query("SELECT COUNT(*) as count FROM complaints WHERE status = 'pending'")
    ]);

    const stats = {
      totalStudents: students?.count || 0,
      presentToday: students?.count > 0 ? Math.round(((attendance?.count || 0) / students.count) * 100) : 0,
      totalResources: resources?.count || 0,
      pendingComplaints: complaints?.count || 0,
    };


    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      trendData.push({
        name: days[d.getDay()],
        attendance: Math.floor(Math.random() * 20) + 75,
        feedback: parseFloat((Math.random() * 0.5 + 4.2).toFixed(1))
      });
    }
    stats.trendData = trendData;

    res.json(stats);
  } catch (err) {
    console.error("[Stats API] Failure:", err.message);
    res.status(500).json({ error: "Failed to compile campus intelligence reports." });
  }
});

app.get('/api/events', (req, res) => {
  db.all("SELECT * FROM events ORDER BY date ASC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/events', (req, res) => {
  const { title, date, location, description, type } = req.body;
  if (!title || !date) return res.status(400).json({ error: "Title and Date are required" });

  db.run("INSERT INTO events (title, date, location, description, type) VALUES (?, ?, ?, ?, ?)",
    [title, date, location, description, type],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, title, date, location, description, type });
    }
  );
});

app.put('/api/events/:id', (req, res) => {
  const { title, date, location, description, type } = req.body;
  const { id } = req.params;

  db.run("UPDATE events SET title = ?, date = ?, location = ?, description = ?, type = ? WHERE id = ?",
    [title, date, location, description, type, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, title, date, location, description, type });
    }
  );
});

app.delete('/api/events/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM events WHERE id = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Event deleted", changes: this.changes });
  });
});


app.post('/api/feedback', (req, res) => {
  const { facultyName, rating, comment } = req.body;
  db.run("INSERT INTO feedback (facultyName, rating, comment) VALUES (?, ?, ?)",
    [facultyName, rating, comment],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, message: "Feedback submitted anonymously" });
    }
  );
});

app.post('/api/complaints', (req, res) => {
  const { title, description, category } = req.body;
  db.run("INSERT INTO complaints (title, description, status) VALUES (?, ?, ?)",
    [title, description, 'pending'],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, message: "Complaint filed anonymously" });
    }
  );
});

app.get('/api/admin/complaints', (req, res) => {
  db.all("SELECT * FROM complaints ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/admin/feedback', (req, res) => {
  db.all("SELECT * FROM feedback ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put('/api/admin/complaints/:id/resolve', (req, res) => {
  const { id } = req.params;
  db.run("UPDATE complaints SET status = 'resolved' WHERE id = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Complaint marked as resolved", changes: this.changes });
  });
});


app.post('/api/chat', (req, res) => chatbot.handleChat(req, res, db));


app.listen(PORT, () => {

  console.log(`Server is running on port ${PORT}`);
});
