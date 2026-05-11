const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const path = require("path");

const swaggerDocs = (app) => {
    // Load the auto-generated swagger.json
    const swaggerFile = path.join(__dirname, "../swagger-output.json");
    const swaggerData = fs.readFileSync(swaggerFile, "utf8");
    const swaggerSpec = JSON.parse(swaggerData);

    app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: "Hair Salon API Docs",
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            docExpansion: 'none'
        }
    }));

    app.get("/swagger.json", (req, res) => {
        res.json(swaggerSpec);
    });
};

module.exports = swaggerDocs;