import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Added for navigation after posting
import Navbar from "./Navbar"; 

export default function AllTweets() {
  const navigate = useNavigate();
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // --- Create Tweet State ---
  const [form, setForm] = useState({
    tweetData: "",
    image: "",
  });

  // --- Fetching Logic ---
  const fetchTweets = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:7000/tweet/get-tweet");
      if (res.data.success) {
        setTweets(res.data.data);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to fetch tweets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets();
  }, []);

  // --- Form Handlers ---
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("myToken");

    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:7000/tweet/post",
        form,
        { headers: { "auth-token": token } }
      );

      if (res.data.success) {
        alert(res.data.message);
        setForm({ tweetData: "", image: "" }); // Clear form after success
        fetchTweets(); // Refresh the feed
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Tweet post failed");
    }
  };

  return (
    <div>
      <Navbar onRefresh={fetchTweets} />

      <div style={{ padding: "20px" }}>
        {/* --- Create Tweet Form Section --- */}
        <h2>Create Tweet</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "10px" }}>
            <label>Tweet Text</label>
            <textarea
              name="tweetData"
              value={form.tweetData}
              onChange={handleChange}
              placeholder="What's happening?"
              rows={4}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Image URL (Optional)</label>
            <input
              type="text"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="Paste image url"
              style={{ width: "100%" }}
            />
          </div>
          <button type="submit">Post Tweet</button>
        </form>

        <hr style={{ margin: "30px 0" }} />

        {/* --- Feed Section --- */}
        <h2>All Tweets</h2>
        {loading && <p>Loading tweets...</p>}

        {!loading && tweets.length === 0 ? (
          <p>No tweets found</p>
        ) : (
          tweets.map((t) => (
            <div
              key={t._id}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                borderRadius: "10px",
                marginBottom: "15px",
              }}
            >
              <h4 style={{ marginBottom: "5px" }}>
                {t.user?.name}{" "}
                <span style={{ fontSize: "13px", color: "gray" }}>
                  ({t.user?.email})
                </span>
              </h4>
              <p style={{ marginBottom: "10px" }}>{t.tweetData}</p>
              {t.image && (
                <img
                  src={`http://localhost:7000/${t.image}`}
                  alt="tweet"
                  style={{ width: "250px", borderRadius: "10px", border: "1px solid #ccc" }}
                />
              )}
              <button style={{ marginLeft: "10px" }} onClick={() => window.open
                (`http://localhost:7000/${t.image}`, "_blank")}>View Full Image</button>
              <p style={{ fontSize: "12px", color: "gray", marginTop: "10px" }}>
                Posted: {new Date(t.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}