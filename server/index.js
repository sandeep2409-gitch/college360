const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const multer = require("multer");
const fs = require("fs");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Database Setup
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
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'student',
      studentId TEXT,
      faceDescriptor TEXT
    )`);

    // Attendance table
    db.run(`CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      date TEXT,
      status TEXT,
      verified INTEGER DEFAULT 1,
       FOREIGN KEY(userId) REFERENCES users(id)
    )`);

    // Resources table
    db.run(`CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      category TEXT,
      fileUrl TEXT,
      uploadedBy INTEGER,
      FOREIGN KEY(uploadedBy) REFERENCES users(id)
    )`);

    // Feedback table
    db.run(`CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facultyName TEXT,
      rating INTEGER,
      comment TEXT,
      submittedBy INTEGER,
      FOREIGN KEY(submittedBy) REFERENCES users(id)
    )`);

    // Complaints table
    db.run(`CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      status TEXT DEFAULT 'pending',
      submittedBy INTEGER,
      FOREIGN KEY(submittedBy) REFERENCES users(id)
    )`);

    // Events table
    db.run(`CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      location TEXT,
      description TEXT,
      type TEXT
    )`);
    // Seed default admin if no users exist
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
      if (!err && row.count === 0) {
        db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
          ["System Admin", "admin@college.edu", "admin123", "admin"],
          (err) => {
            if (!err) console.log("Default admin account created: admin@college.edu / admin123");
          }
        );
      }
    });
  });
}

// Routes
app.get("/", (req, res) => {
  res.send("College Management System API is running.");
});

// Auth Routes
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
          return res.status(400).json({ error: 'Email already exists' });
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
  const { email, password, role } = req.body;
  
  db.get("SELECT * FROM users WHERE email = ? AND password = ? AND role = ?", 
    [email, password, role], 
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

// Resource Routes
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

// Student Management Routes
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

// Student Management Routes
app.get('/api/admin/students', (req, res) => {
  db.all("SELECT id, name, email, role FROM users WHERE role = 'student' ORDER BY id DESC", (err, rows) => {
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

// Attendance Routes
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

// Admin Stats Route
app.get('/api/admin/stats', (req, res) => {
  const stats = {};
  const today = new Date().toISOString().split('T')[0];

  db.serialize(() => {
    // Total Students
    db.get("SELECT COUNT(*) as count FROM users WHERE role = 'student'", (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      stats.totalStudents = row.count;

      // Present Today (Only Verified)
      db.get("SELECT COUNT(*) as count FROM attendance WHERE date = ? AND verified = 1", [today], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        const presentCount = row.count;
        stats.presentToday = stats.totalStudents > 0 ? Math.round((presentCount / stats.totalStudents) * 100) : 0;

        // Total Resources
        db.get("SELECT COUNT(*) as count FROM resources", (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          stats.totalResources = row.count;

          // Pending Complaints
          db.get("SELECT COUNT(*) as count FROM complaints WHERE status = 'pending'", (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.pendingComplaints = row.count;

            // Generate mock trend data based on real counts for last 7 days
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const trendData = [];
            for (let i = 6; i >= 0; i--) {
              const d = new Date();
              d.setDate(d.getDate() - i);
              trendData.push({
                name: days[d.getDay()],
                attendance: Math.floor(Math.random() * 20) + 80, // Real trend would query attendance by date
                feedback: (Math.random() * 1 + 4).toFixed(1)
              });
            }
            stats.trendData = trendData;

            res.json(stats);
          });
        });
      });
    });
  });
});
// Event Management Routes
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

// Feedback & Complaints (Anonymous)
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
