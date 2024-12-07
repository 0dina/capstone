import express from "express";
import mysql from "mysql2";
import path from "path";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import hpp from "hpp";
import { exec } from "child_process";
import bodyParser from "body-parser";
import axios from "axios"; // HTTP 요청을 보내기 위해 axios 사용

const app = express();
const port = 8080;

// 라즈베리파이 IP 주소와 포트
const RASPBERRY_PI_URL = "http://192.168.0.90:5000";


// Middleware 설정
app.use(cors({ origin: true, credentials: true }));
app.use(hpp());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// 창문 상태
let windowState = "closed";

// API: 창문 열기
app.post("/open", async (req, res) => {
  if (windowState === "open") {
    return res.status(400).json({ message: "Window is already open." });
  }

  try {
    const response = await axios.post(`${RASPBERRY_PI_URL}/open`);
    windowState = "open";
    res.json({ message: "Window opened successfully.", response: response.data });
  } catch (error) {
    console.error(`Error opening window: ${error.message}`);
    res.status(500).json({ message: "Failed to open window." });
  }
});

// API: 창문 닫기
app.post("/close", async (req, res) => {
  if (windowState === "closed") {
    return res.status(400).json({ message: "Window is already closed." });
  }

  try {
    const response = await axios.post(`${RASPBERRY_PI_URL}/close`);
    windowState = "closed";
    res.json({ message: "Window closed successfully.", response: response.data });
  } catch (error) {
    console.error(`Error closing window: ${error.message}`);
    res.status(500).json({ message: "Failed to close window." });
  }
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

// 서버 실행
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
