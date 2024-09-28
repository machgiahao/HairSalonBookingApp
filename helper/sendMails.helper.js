const nodeMailer = require("nodemailer");

module.exports.sendMail = (email, subject, html) => {
    const transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOption = { 
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        html: html
    };

    // Correct usage of `sendMail` method
    transporter.sendMail(mailOption, function(error, info) {  // <-- Corrected line
        if (error) {
            console.log(error);            
        } else {
            console.log(`Email sent: ` + info.response);
        }
    });
};
