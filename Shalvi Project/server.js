require('dotenv').config();
const express = require("express");
const cors = require("cors");
const Parser = require("rss-parser");
const path = require("path");
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5500;
const parser = new Parser();

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

app.get("/about.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "about.html"));
});

app.get("/contact.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "contact.html"));
});

// API Route to fetch news
app.get("/news", async (req, res) => {
    try {
        const feed = await parser.parseURL("https://timesofindia.indiatimes.com/rssfeedstopstories.cms");
        const newsData = feed.items.map(item => ({
            title: item.title,
            description: item.contentSnippet,
            link: item.link, 
            pubDate: item.pubDate, 
        }));
        res.json(newsData);
    } catch (error) {
        console.error("Error fetching news:", error);
        res.status(500).json({ error: "Failed to fetch news" });
    }
});

// Email Route
app.post('/send-email', async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Create transporter
    let transporter = nodemailer.createTransport({
        service: 'gmail', // Using Gmail (change if needed)
        auth: {
            user: process.env.EMAIL_USER, // Your email
            pass: process.env.EMAIL_PASS  // Your app password (not normal password)
        }
    });

    // Email options
    let mailOptions = {
        from: email,
        to: process.env.EMAIL_USER, // Your email
        subject: `${subject}`,
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Email sent successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to send email', error });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});