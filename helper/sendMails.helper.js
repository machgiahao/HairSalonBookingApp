const nodeMailer = require("nodemailer");

// Function to create the transporter
const createTransporter = () => {
    return nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
        }
    });
};

// Function to send an email
const sendEmail = (transporter, mailOptions) => {
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error occurred:', error);
                return reject(error);
            }
            // console.log(`Email sent: ${info.response}`);
            resolve(info);
        });
    });
};

// Main function to send mail
module.exports.sendMail = async (from, email, subject, html) => {
    const transporter = createTransporter();
    
    const mailOptions = { 
        from: from,
        to: email,
        subject: subject,
        html: html
    };

    try {
        const info = await sendEmail(transporter, mailOptions);
        return info; // Optional: return info for further handling if needed
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error; // Re-throw the error for upstream handling
    }
};
