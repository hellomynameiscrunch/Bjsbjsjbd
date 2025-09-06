import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB 연결
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Post 스키마
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model("Post", postSchema);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // HTML 파일 위치

// 모든 포스트 가져오기
app.get("/posts", async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

// 새 포스트 생성
app.post("/posts", async (req, res) => {
  const { title, description, thumbnail } = req.body;
  if (!title || !description)
    return res.status(400).json({ error: "Title and description required" });

  const newPost = new Post({ title, description, thumbnail });
  await newPost.save();
  res.json(newPost);
});

// 검색
app.get("/posts/search", async (req, res) => {
  const q = req.query.q || "";
  const posts = await Post.find({ title: { $regex: q, $options: "i" } }).sort({
    createdAt: -1,
  });
  res.json(posts);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
