import express from "express";
import mysql from "mysql2";
import path from "path";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import hpp from "hpp";
import { exec } from "child_process"; // Python 스크립트 실행을 위해 추가

const app = express();
const port = 8080;

// Middleware 설정
app.use(cors({ origin: true, credentials: true }));
app.use(hpp());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// MySQL 풀 설정
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "192.168.0.90",
  port: "3306",
  user: "root",
  password: "mypassword",
  database: "dina",
  debug: false,
});

// 서버 시작 시 DB 연결 확인
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1); // 연결 실패 시 서버 종료
  } else {
    console.log("Database connected successfully");
    connection.release(); // 연결 해제
  }
});

// 창문 제어 상태
let windowState = "closed"; // 초기 상태: 닫힘

// API: 창문 열기
app.post("/open", (req, res) => {
  if (windowState === "open") {
    return res.status(400).json({ message: "Window is already open." });
  }
  exec('python3 motorcontrol.py open', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error opening window: ${error.message}`);
      return res.status(500).json({ message: "Failed to open window." });
    }
    console.log(`Window opened: ${stdout}`);
    windowState = "open";
    res.json({ message: "Window opened successfully.", windowState });
  });
});

// API: 창문 닫기
app.post("/close", (req, res) => {
  if (windowState === "closed") {
    return res.status(400).json({ message: "Window is already closed." });
  }
  exec('python3 motorcontrol.py close', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error closing window: ${error.message}`);
      return res.status(500).json({ message: "Failed to close window." });
    }
    console.log(`Window closed: ${stdout}`);
    windowState = "closed";
    res.json({ message: "Window closed successfully.", windowState });
  });
});

// 기존 API 라우트
app.get("/api", async (req, res, next) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("DB Connection Error:", err);
      return res.status(500).json({ message: "Database connection failed" });
    }

    connection.query("SELECT * FROM choi;", (queryErr, results) => {
      if (queryErr) {
        console.error("Query Error:", queryErr);
        connection.release();
        return res.status(500).json({ message: "Query execution failed" });
      }

      res.status(200).json({ data: results });
      connection.release();
    });
  });
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
