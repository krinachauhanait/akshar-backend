require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve frontend
app.use(express.static("public"));

// ✅ Create transporter ONCE (not inside route)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ✅ Verify connection (DEBUGGING)
transporter.verify((error, success) => {
    if (error) {
        console.log("❌ Email config error:", error);
    } else {
        console.log("✅ Email server is ready");
    }
});

// ROUTE: FORM SUBMIT
app.post("/send-quotation", async (req, res) => {

    console.log("📩 Form Data:", req.body); // DEBUG

    const { name, phone, email, location, message } = req.body;

    // ✅ Fix services handling (array issue)
    let services = req.body["services[]"] || req.body.services;

    if (Array.isArray(services)) {
        services = services.join(", ");
    }

    try {
        await transporter.sendMail({
            from: `"Akshar Elektrotekniks" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            replyTo: email, // ✅ so you can reply directly
            subject: "New Quotation Request",
            html: `
                <h2>New Quotation Request</h2>

                <p><strong>Name:</strong> ${name || "N/A"}</p>
                <p><strong>Phone:</strong> ${phone || "N/A"}</p>
                <p><strong>Email:</strong> ${email || "N/A"}</p>
                <p><strong>Location:</strong> ${location || "N/A"}</p>

                <p><strong>Services:</strong> ${services || "N/A"}</p>

                <p><strong>Message:</strong> ${message || "N/A"}</p>
            `
        });

        res.json({ success: true });

    } catch (error) {
        console.error("❌ Mail Error:", error);

        res.status(500).json({ success: false });
    }
});

// START SERVER
app.listen(5000, () => {
    console.log("🚀 Server running on http://localhost:5000");
});